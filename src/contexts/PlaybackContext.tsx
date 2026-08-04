import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
  type RefObject,
} from 'react';
import { useEditMode } from './EditModeContext';
import { useTracks } from '../hooks';
import { resumeAudioContext, registerOnSuspend } from '../lib/audioContextManager';
import { resetPlaybackAudioBridge } from '../lib/playbackAudioBridge';
import { isSupabaseConfigured } from '../lib/supabase';
import { parseVisualizationId } from '../lib/contentMappers';
import { formatDuration } from '../utils';
import { releaseScreenWakeLock, requestScreenWakeLock } from '../lib/screenWakeLock';
import { scrollToHeroStage } from '../lib/albumTracks';
import { toast } from '../lib/toast';
import { siteIconUrl } from '../lib/siteIcons';
import { isAppleTouchDevice } from '../utils/isMobile';
import { activatePlaybackAudioSession, armPlaybackAudioSessionOnGesture } from '../lib/iosAudioSession';
import { getPlaybackElement } from '../lib/playbackElement';

export interface PlayerTrack {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  url: string;
  visualizationId: number;
  /** HTTPS URL for lock screen / notification artwork */
  artworkUrl?: string;
}

const parseDurationStr = (durationStr: string): number => {
  const [minutes, seconds] = durationStr.split(':').map(Number);
  return minutes * 60 + seconds;
};

interface PlaybackContextType {
  tracks: PlayerTrack[];
  currentTrack: number;
  setCurrentTrack: (index: number) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isAudioReady: boolean;
  isBuffering: boolean;
  /** True once the user has started listening this visit (survives pause). */
  hasPlaybackSession: boolean;
  currentTrackData: PlayerTrack | undefined;
  /** Audible HTMLAudioElement — never routed through Web Audio (background / lock screen safe). */
  audioRef: RefObject<HTMLAudioElement | null>;
  /** Muted analysis element for visualizers (Web Audio). */
  analysisAudioRef: RefObject<HTMLAudioElement | null>;
  togglePlay: () => void;
  skipForward: () => void;
  skipBack: () => void;
  handleSeek: (value: number[]) => void;
  handleVolumeChange: (value: number[]) => void;
  toggleMute: () => void;
  formatTime: (time: number) => string;
  selectTrack: (index: number) => void;
  setShouldAutoPlay: (value: boolean) => void;
  isFullscreen: boolean;
  setIsFullscreen: (value: boolean) => void;
  isAirPlayAvailable: boolean;
  isRemotePlaybackAvailable: boolean;
  isRemotePlaybackConnected: boolean;
  remotePlaybackDeviceName: string | null;
  /** True when the analysis element should feed Web Audio visualizers. */
  isAnalysisAudioActive: boolean;
  /** Bumps when the analysis <audio> element is remounted after tearing down Web Audio. */
  analysisEpoch: number;
  showAirPlayPicker: () => void;
  showRemotePlaybackPicker: () => Promise<void>;
  /** Hero Stage: immersive viz in the hero viewport */
  isHeroStage: boolean;
  heroInView: boolean;
  setHeroInView: (inView: boolean) => void;
  setHeroStageActive: (active: boolean) => void;
  playFromHero: () => void;
  /** Select track and start Hero Stage playback (Listen now, viz showcase, etc.) */
  playTrackAtHero: (index: number) => void;
  /** Select track and play in place — discography / catalog (no scroll) */
  playTrackInPlace: (index: number) => void;
  /** Shared Web Audio analyser for visualizers (PlaybackAnalyserBridge) */
  analyser: AnalyserNode | null;
  setAnalyser: (node: AnalyserNode | null) => void;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { content, isEditMode, isDraft, draftRevision } = useEditMode();
  const { tracks: supabaseTracks, loading: tracksLoading } = useTracks();

  const tracks: PlayerTrack[] = useMemo(() => {
    const mapContentTrack = (t: (typeof content.musicPlayer.tracks)[number]) => {
      const cover = 'coverImage' in t && typeof (t as { coverImage?: string }).coverImage === 'string'
        ? (t as { coverImage?: string }).coverImage?.trim()
        : '';
      return {
        ...t,
        visualizationId: t.visualizationId ?? 0,
        artworkUrl: cover || undefined,
      };
    };
    if (isEditMode) {
      return content.musicPlayer.tracks.map(mapContentTrack);
    }
    // When we have a draft (e.g. just exited edit mode), use content so visualization and other edits persist
    if (isDraft) {
      return content.musicPlayer.tracks.map(mapContentTrack);
    }
    if (isSupabaseConfigured && !tracksLoading && supabaseTracks.length > 0) {
      return supabaseTracks.map((t, i) => ({
        id: i,
        title: t.title,
        artist: t.artist,
        album: t.album ?? '',
        duration: formatDuration(t.duration),
        url: t.audio_url,
        visualizationId: parseVisualizationId(t.visualization_type),
        artworkUrl: t.cover_image_url?.trim() || undefined,
      }));
    }
    return content.musicPlayer.tracks.map(mapContentTrack);
  }, [isEditMode, isDraft, isSupabaseConfigured, tracksLoading, supabaseTracks, content.musicPlayer.tracks, draftRevision]);

  const [currentTrack, setCurrentTrackState] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackSessionActive, setPlaybackSessionActive] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHeroStage, setIsHeroStage] = useState(false);
  const [heroInView, setHeroInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible'
  );
  /** Stable for the session — iOS/iPadOS never mounts the analysis audio element. */
  const appleTouchDeviceRef = useRef(
    typeof navigator !== 'undefined' ? isAppleTouchDevice() : false
  );
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const shouldAutoPlayRef = useRef(false);
  /** True only after an intentional user / Media Session pause (not iOS auto-pause). */
  const userPausedRef = useRef(false);
  /** Track ended / skip while playing — keep media session active and avoid pause→play in background */
  const autoAdvanceRef = useRef(false);
  const tracksRef = useRef(tracks);
  const currentTrackIndexRef = useRef(currentTrack);
  tracksRef.current = tracks;
  currentTrackIndexRef.current = currentTrack;
  const [isAirPlayAvailable, setIsAirPlayAvailable] = useState(false);
  const [isAirPlayWireless, setIsAirPlayWireless] = useState(false);
  const [isRemotePlaybackAvailable, setIsRemotePlaybackAvailable] = useState(false);
  const [isRemotePlaybackConnected, setIsRemotePlaybackConnected] = useState(false);
  const [remotePlaybackDeviceName, setRemotePlaybackDeviceName] = useState<string | null>(null);
  /** Pause analysis Web Audio while AirPlay / remote picker is open. */
  const [nativeRouteLock, setNativeRouteLock] = useState(false);
  const [analysisEpoch, setAnalysisEpoch] = useState(0);
  /** Audible element — document singleton, never passed to createMediaElementSource. */
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  /** Analysis-only element for visualizers. */
  const analysisAudioRef = useRef<HTMLAudioElement>(null);
  const castContextRef = useRef<any>(null);
  const castSessionRef = useRef<any>(null);
  const castMediaSessionRef = useRef<any>(null);
  const castEnabledRef = useRef(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const wasAnalysisActiveRef = useRef(false);
  /** Prevents hero-stage sync from killing viz while scrolling up after catalog play */
  const heroStageLockUntilRef = useRef(0);
  /** Keeps hero stage active until catalog play reaches the hero viewport */
  const catalogPlayPendingRef = useRef(false);
  const audioRef = playbackAudioRef;

  const currentTrackUrl = tracks[currentTrack]?.url?.trim() ?? '';
  const currentTrackData = tracks[currentTrack];
  /**
   * Viz analysis (Web Audio) — never on iOS/iPadOS (WebKit background-restricts WebAudio
   * sessions and can kill lock-screen playback). Elsewhere: foreground only.
   * Visualizers fall back to the EQ simulator when this is false.
   */
  const isAnalysisAudioActive =
    !appleTouchDeviceRef.current &&
    pageVisible &&
    !isAirPlayWireless &&
    !isRemotePlaybackConnected &&
    !nativeRouteLock;
  /** True once the user has started listening this visit — not on passive track preload. */
  const hasPlaybackSession =
    playbackSessionActive &&
    Boolean(currentTrackData?.url?.trim()) &&
    (isPlaying || currentTime > 0.5 || shouldAutoPlay);

  const activatePlaybackSession = useCallback(() => {
    setPlaybackSessionActive(true);
  }, []);

  const endPlaybackSession = useCallback(() => {
    setPlaybackSessionActive(false);
    setIsHeroStage(false);
  }, []);
  const castReceiverAppId = String(import.meta.env.VITE_GOOGLE_CAST_APP_ID ?? '').trim() || 'CC1AD845';

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    shouldAutoPlayRef.current = shouldAutoPlay;
  }, [shouldAutoPlay]);

  useEffect(() => {
    if (isPlaying) {
      setPlaybackSessionActive(true);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (currentTime > 0.5) {
      setPlaybackSessionActive(true);
    }
  }, [currentTime]);

  const beginAutoAdvance = useCallback(() => {
    autoAdvanceRef.current = true;
    shouldAutoPlayRef.current = true;
    setShouldAutoPlay(true);
  }, []);

  const clearAutoAdvance = useCallback(() => {
    autoAdvanceRef.current = false;
    shouldAutoPlayRef.current = false;
    setShouldAutoPlay(false);
  }, []);

  const tryStartPlayback = useCallback(() => {
    const el = playbackAudioRef.current;
    if (!el || castSessionRef.current) return;
    if (!shouldAutoPlayRef.current && !isPlayingRef.current) return;

    activatePlaybackAudioSession();
    const playPromise = el.play();
    if (playPromise === undefined) return;

    playPromise
      .then(() => {
        shouldAutoPlayRef.current = false;
        setShouldAutoPlay(false);
        setIsPlaying(true);
        setIsBuffering(false);
      })
      .catch((err: unknown) => {
        const name =
          err && typeof err === 'object' && 'name' in err
            ? String((err as { name?: string }).name)
            : '';
        if (name === 'AbortError') return;
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
        if (el.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
        shouldAutoPlayRef.current = false;
        setShouldAutoPlay(false);
        setIsPlaying(false);
        setIsBuffering(false);
        clearAutoAdvance();
      });
  }, [clearAutoAdvance]);

  // Analysis Web Audio on/off: pause & tear down when inactive; remount analysis node when re-enabled.
  useEffect(() => {
    const wasActive = wasAnalysisActiveRef.current;
    if (wasActive === isAnalysisAudioActive) return;
    wasAnalysisActiveRef.current = isAnalysisAudioActive;

    const analysis = analysisAudioRef.current;
    if (!isAnalysisAudioActive) {
      analysis?.pause();
      resetPlaybackAudioBridge();
      return;
    }

    resetPlaybackAudioBridge();
    setAnalysisEpoch((epoch) => epoch + 1);
  }, [isAnalysisAudioActive]);

  // Drop the picker lock once a real external route connects, or after cancel timeout.
  useEffect(() => {
    if (!nativeRouteLock) return;
    if (isAirPlayWireless || isRemotePlaybackConnected) {
      setNativeRouteLock(false);
      return;
    }
    const timer = window.setTimeout(() => setNativeRouteLock(false), 45000);
    return () => window.clearTimeout(timer);
  }, [nativeRouteLock, isAirPlayWireless, isRemotePlaybackConnected]);

  const syncAnalysisElement = useCallback(
    (opts?: { play?: boolean }) => {
      const playEl = playbackAudioRef.current;
      const analysis = analysisAudioRef.current;
      if (!playEl || !analysis || !isAnalysisAudioActive) return;

      const url = currentTrackUrl;
      if (!url) {
        analysis.pause();
        analysis.removeAttribute('src');
        return;
      }

      const analysisSrc = analysis.currentSrc || analysis.getAttribute('src') || '';
      if (!analysisSrc || analysisSrc !== (playEl.currentSrc || playEl.src) ) {
        analysis.crossOrigin = 'anonymous';
        analysis.src = url;
        analysis.load();
      }

      try {
        if (Number.isFinite(playEl.currentTime)) {
          if (Math.abs(analysis.currentTime - playEl.currentTime) > 0.3) {
            analysis.currentTime = playEl.currentTime;
          }
        }
      } catch {
        /* ignore seek race while loading */
      }

      // Do not play() here — PlaybackAnalyserBridge starts analysis only after
      // createMediaElementSource claims the element (avoids a native double-audio blip).
      if (!isPlayingRef.current || !opts?.play) {
        analysis.pause();
      }
    },
    [currentTrackUrl, isAnalysisAudioActive]
  );

  // After analysis remount, re-bind src and follow audible transport.
  useEffect(() => {
    if (analysisEpoch === 0 || !isAnalysisAudioActive) return;
    syncAnalysisElement({ play: isPlayingRef.current });
  }, [analysisEpoch, isAnalysisAudioActive, syncAnalysisElement]);

  // Load / reset audible when the track (or its URL) changes.
  // CRITICAL: do not depend on visibility / analysis flags — backgrounding used to
  // re-run this effect and call setIsPlaying(false) / el.pause(), killing lock-screen audio.
  useEffect(() => {
    const keepPlaying = autoAdvanceRef.current;
    autoAdvanceRef.current = false;

    setIsAudioReady(false);
    setIsBuffering(keepPlaying || shouldAutoPlayRef.current);
    if (!keepPlaying) {
      setIsPlaying(false);
    }
    if (!currentTrackData) return;

    const el = playbackAudioRef.current;
    if (!el) return;

    if (currentTrackUrl) {
      if (!keepPlaying) el.pause();
      el.currentTime = 0;
      // Do NOT set crossOrigin on the audible element. CORS mode breaks some
      // Supabase/CDN range requests on iOS when the PWA is backgrounded.
      el.removeAttribute('crossorigin');
      el.src = currentTrackData.url;
      el.load();
      if (keepPlaying) {
        window.setTimeout(tryStartPlayback, 0);
      }
    } else {
      el.pause();
      el.removeAttribute('src');
      el.load();
      setDuration(parseDurationStr(currentTrackData.duration));
      setCurrentTime(0);
      clearAutoAdvance();
    }
  }, [currentTrack, currentTrackUrl, currentTrackData, tryStartPlayback, clearAutoAdvance]);

  // Keep analysis element src in sync with the audible track (never pauses audible).
  useEffect(() => {
    if (!isAnalysisAudioActive || !currentTrackUrl) return;
    syncAnalysisElement({ play: isPlayingRef.current });
  }, [currentTrackUrl, isAnalysisAudioActive, syncAnalysisElement]);

  // Drive play/pause and volume on the audible element only.
  // Do not depend on analysis/visibility — those must never pause native transport.
  useEffect(() => {
    const el = playbackAudioRef.current;
    if (!el) return;
    el.volume = isMuted ? 0 : volume;
    if (castSessionRef.current) {
      el.pause();
      analysisAudioRef.current?.pause();
      const mediaSession = castMediaSessionRef.current ?? castSessionRef.current.getMediaSession?.();
      if (mediaSession) {
        castMediaSessionRef.current = mediaSession;
        const chromeCastNS = (window as any).chrome?.cast;
        try {
          if (isPlaying && chromeCastNS?.media?.PlayRequest) {
            mediaSession.play(new chromeCastNS.media.PlayRequest());
          } else if (!isPlaying && chromeCastNS?.media?.PauseRequest) {
            mediaSession.pause(new chromeCastNS.media.PauseRequest());
          }
        } catch {
          // Keep UI state even if cast command fails.
        }
      }
      return;
    }
    if (isPlaying) {
      userPausedRef.current = false;
      activatePlaybackAudioSession();
      el.playbackRate = 1;
      el.defaultPlaybackRate = 1;
      // Already playing (e.g. Media Session just started it) — do not call play() again.
      if (!el.paused) return;
      const p = el.play();
      if (p !== undefined) {
        p.catch((err: unknown) => {
          // iOS rejects play() with AbortError when backgrounding / interrupting.
          // Do NOT arm shouldAutoPlay here — that caused lock-screen Pause to fight
          // canplay → tryStartPlayback and "repeat several times before stopping".
          const name =
            err && typeof err === 'object' && 'name' in err
              ? String((err as { name?: string }).name)
              : '';
          if (name === 'AbortError') return;
          if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
          if (el.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
          setIsPlaying(false);
        });
      }
    } else {
      userPausedRef.current = true;
      shouldAutoPlayRef.current = false;
      el.pause();
      analysisAudioRef.current?.pause();
    }
  }, [isPlaying, volume, isMuted]);

  const handleTimeUpdate = useCallback(() => {
    // Keep JS quiet while backgrounded — React setState during iOS freeze can kill media.
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    const el = playbackAudioRef.current;
    if (!el) return;
    const t = el.currentTime;
    setCurrentTime(t);
    const analysis = analysisAudioRef.current;
    if (!analysis || analysis.paused) return;
    try {
      if (Math.abs(analysis.currentTime - t) > 0.45) {
        analysis.currentTime = t;
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const el = playbackAudioRef.current;
    if (el) setDuration(el.duration);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsAudioReady(true);
    if (shouldAutoPlayRef.current) {
      tryStartPlayback();
      return;
    }
    setIsBuffering(false);
    const el = playbackAudioRef.current;
    if (!isPlayingRef.current && (el?.currentTime ?? 0) <= 0.5) {
      endPlaybackSession();
    }
  }, [tryStartPlayback, endPlaybackSession]);

  const handleLoadedData = useCallback(() => {
    if (shouldAutoPlayRef.current) tryStartPlayback();
  }, [tryStartPlayback]);

  const handleWaiting = useCallback(() => {
    if (isPlayingRef.current || shouldAutoPlayRef.current) setIsBuffering(true);
  }, []);
  const handlePlaying = useCallback(() => setIsBuffering(false), []);

  const handleError = useCallback(() => {
    // While backgrounded, iOS/SW glitches can fire spurious media errors.
    // Do not tear down the session or pause — that is what users hear as "music stopped".
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return;
    }
    setIsAudioReady(false);
    setIsBuffering(false);
    clearAutoAdvance();
    catalogPlayPendingRef.current = false;
    endPlaybackSession();
    setIsPlaying(false);
  }, [endPlaybackSession, clearAutoAdvance]);

  const handleEnded = useCallback(() => {
    const index = currentTrackIndexRef.current;
    const list = tracksRef.current;
    if (index < list.length - 1) {
      const next = list[index + 1];
      if (next.url) {
        beginAutoAdvance();
        setIsPlaying(true);
        setCurrentTrackState(index + 1);
      } else {
        clearAutoAdvance();
        setIsPlaying(false);
        setCurrentTrackState(index + 1);
      }
    } else {
      clearAutoAdvance();
      endPlaybackSession();
      setIsPlaying(false);
    }
  }, [endPlaybackSession, beginAutoAdvance, clearAutoAdvance]);

  // Bind the document-owned audio element once (outside React mount/unmount churn).
  useEffect(() => {
    const el = getPlaybackElement();
    playbackAudioRef.current = el;
    el.preload = 'auto';

    const onPause = () => {
      // iOS Safari sometimes auto-pauses media when backgrounding. If the user did not
      // pause, reclaim playback immediately while the page can still call play().
      if (userPausedRef.current) return;
      if (!isPlayingRef.current) return;
      activatePlaybackAudioSession();
      if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
      void el.play().catch(() => {
        /* gesture may be required after a hard OS suspend */
      });
    };

    el.addEventListener('timeupdate', handleTimeUpdate);
    el.addEventListener('loadedmetadata', handleLoadedMetadata);
    el.addEventListener('canplay', handleCanPlay);
    el.addEventListener('loadeddata', handleLoadedData);
    el.addEventListener('waiting', handleWaiting);
    el.addEventListener('playing', handlePlaying);
    el.addEventListener('error', handleError);
    el.addEventListener('ended', handleEnded);
    el.addEventListener('pause', onPause);

    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate);
      el.removeEventListener('loadedmetadata', handleLoadedMetadata);
      el.removeEventListener('canplay', handleCanPlay);
      el.removeEventListener('loadeddata', handleLoadedData);
      el.removeEventListener('waiting', handleWaiting);
      el.removeEventListener('playing', handlePlaying);
      el.removeEventListener('error', handleError);
      el.removeEventListener('ended', handleEnded);
      el.removeEventListener('pause', onPause);
      // Do not remove the element from the document — iOS may still own the session.
    };
  }, [
    handleTimeUpdate,
    handleLoadedMetadata,
    handleCanPlay,
    handleLoadedData,
    handleWaiting,
    handlePlaying,
    handleError,
    handleEnded,
  ]);

  useEffect(() => armPlaybackAudioSessionOnGesture(), []);

  // Media Session API: metadata for lock screen, car display, notification shade, etc.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const track = currentTrackData;
    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }
    const artwork: MediaImage[] = [];
    const art = track.artworkUrl?.trim();
    if (art) {
      artwork.push({ src: art, sizes: '512x512' });
      artwork.push({ src: art, sizes: '256x256' });
    } else {
      try {
        const fallback = new URL(siteIconUrl('/android-chrome-192x192.png'), window.location.origin).href;
        artwork.push({ src: fallback, sizes: '192x192', type: 'image/png' });
      } catch {
        /* ignore */
      }
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || undefined,
      artwork: artwork.length > 0 ? artwork : undefined,
    });
  }, [currentTrackData]);

  // Lock screen / OS scrubber: position state (throttled via interval)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;
    if (typeof ms.setPositionState !== 'function') return;

    const clearPosition = () => {
      try {
        ms.setPositionState(null);
      } catch {
        /* ignore */
      }
    };

    if (!isPlaying || !Number.isFinite(duration) || duration <= 0) {
      clearPosition();
      return;
    }

    const update = () => {
      const active = playbackAudioRef.current;
      const dur =
        active && Number.isFinite(active.duration) && active.duration > 0 ? active.duration : duration;
      const pos = active && Number.isFinite(active.currentTime) ? active.currentTime : currentTime;
      try {
        ms.setPositionState({
          duration: dur,
          playbackRate: active?.playbackRate ?? 1,
          position: Math.min(Math.max(0, pos), dur),
        });
      } catch {
        /* Safari may throw until playback started */
      }
    };

    update();
    const id = window.setInterval(update, 1000);
    return () => {
      window.clearInterval(id);
      clearPosition();
    };
  }, [isPlaying, duration, currentTime]);

  // Media Session playbackState — helps iOS treat us as active media (lock screen, Control Center)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // Media Session handlers — register once. Re-binding on track changes nulls handlers
  // briefly and causes flaky lock-screen Pause/Play on iOS.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;

    ms.setActionHandler('play', async () => {
      activatePlaybackAudioSession();
      userPausedRef.current = false;
      shouldAutoPlayRef.current = false;
      setShouldAutoPlay(false);
      const el = playbackAudioRef.current ?? getPlaybackElement();
      el.playbackRate = 1;
      el.defaultPlaybackRate = 1;
      try {
        await el.play();
      } catch {
        /* ignore */
      }
      ms.playbackState = 'playing';
      isPlayingRef.current = true;
      setIsPlaying(true);
    });
    ms.setActionHandler('pause', () => {
      // Clear autoplay arming so canplay cannot restart after an intentional pause.
      userPausedRef.current = true;
      shouldAutoPlayRef.current = false;
      setShouldAutoPlay(false);
      autoAdvanceRef.current = false;
      setIsHeroStage(false);
      isPlayingRef.current = false;
      setIsPlaying(false);
      ms.playbackState = 'paused';
      playbackAudioRef.current?.pause();
      analysisAudioRef.current?.pause();
    });
    ms.setActionHandler('previoustrack', () => {
      const index = currentTrackIndexRef.current;
      const list = tracksRef.current;
      if (index > 0) {
        setCurrentTime(0);
        const prev = list[index - 1];
        if (prev?.url && isPlayingRef.current) {
          autoAdvanceRef.current = true;
          shouldAutoPlayRef.current = true;
          setShouldAutoPlay(true);
          setIsPlaying(true);
        } else {
          autoAdvanceRef.current = false;
          shouldAutoPlayRef.current = false;
          setShouldAutoPlay(false);
        }
        setCurrentTrackState(index - 1);
      }
    });
    ms.setActionHandler('nexttrack', () => {
      const index = currentTrackIndexRef.current;
      const list = tracksRef.current;
      if (index < list.length - 1) {
        setCurrentTime(0);
        const next = list[index + 1];
        if (next?.url && isPlayingRef.current) {
          autoAdvanceRef.current = true;
          shouldAutoPlayRef.current = true;
          setShouldAutoPlay(true);
          setIsPlaying(true);
        } else {
          autoAdvanceRef.current = false;
          shouldAutoPlayRef.current = false;
          setShouldAutoPlay(false);
        }
        setCurrentTrackState(index + 1);
      }
    });
    ms.setActionHandler('seekto', (details) => {
      const t = details.seekTime;
      if (typeof t === 'number' && Number.isFinite(t)) {
        setCurrentTime(t);
        if (playbackAudioRef.current) playbackAudioRef.current.currentTime = t;
        if (analysisAudioRef.current) {
          try {
            analysisAudioRef.current.currentTime = t;
          } catch {
            /* ignore */
          }
        }
      }
    });

    return () => {
      ms.setActionHandler('play', null);
      ms.setActionHandler('pause', null);
      ms.setActionHandler('previoustrack', null);
      ms.setActionHandler('nexttrack', null);
      ms.setActionHandler('seekto', null);
    };
  }, []);

  // Do not react to AudioContext suspend with setState — that can cascade into pausing music.
  useEffect(() => {
    registerOnSuspend(() => {
      try {
        analysisAudioRef.current?.pause();
      } catch {
        /* ignore */
      }
      resetPlaybackAudioBridge();
    });
    return () => registerOnSuspend(null);
  }, []);

  // Keep screen awake while playing or in fullscreen visualizer (best-effort; released when tab is hidden).
  // Skip wake lock on Apple touch devices — it is unrelated to audio and adds hide/show churn on iOS.
  useEffect(() => {
    if (appleTouchDeviceRef.current) return;
    const wantWake = isPlaying || isFullscreen;
    if (!wantWake) {
      void (async () => {
        await releaseScreenWakeLock(wakeLockRef.current);
        wakeLockRef.current = null;
      })();
      return;
    }
    let cancelled = false;
    void (async () => {
      if (wakeLockRef.current) return;
      const lock = await requestScreenWakeLock();
      if (cancelled) {
        await releaseScreenWakeLock(lock);
        return;
      }
      if (!lock) return;
      wakeLockRef.current = lock;
      lock.addEventListener('release', () => {
        if (wakeLockRef.current === lock) wakeLockRef.current = null;
      });
    })();
    return () => {
      cancelled = true;
      void (async () => {
        await releaseScreenWakeLock(wakeLockRef.current);
        wakeLockRef.current = null;
      })();
    };
  }, [isPlaying, isFullscreen]);

  // Background: touch nothing related to audible media. Reclaim play() only on return if needed.
  useEffect(() => {
    const onVisibility = () => {
      const visible = document.visibilityState === 'visible';

      if (!visible) {
        // Intentionally empty for the playing case: no setState, no bridge teardown.
        if (!isPlayingRef.current) {
          setPageVisible(false);
          setIsHeroStage(false);
        }
        return;
      }

      setPageVisible(true);

      if (isPlayingRef.current && !userPausedRef.current) {
        const el = playbackAudioRef.current ?? getPlaybackElement();
        if (el.paused) {
          activatePlaybackAudioSession();
          void el.play().catch(() => {
            /* may need a Media Session / user gesture */
          });
        }
        if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      }
    };

    const onPageHide = () => {
      // No-op: any work here races iOS media suspension.
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  const resumeAudioContextIfNeeded = useCallback(() => {
    // Must run in the user-gesture stack on iOS/Android or Web Audio stays suspended (silent).
    void resumeAudioContext();
  }, []);

  const loadCurrentTrackOnCast = useCallback(async (autoplay: boolean) => {
    const track = currentTrackData;
    const session = castSessionRef.current;
    const castNS = (window as any).cast;
    const chromeCastNS = (window as any).chrome?.cast;
    if (!track?.url || !session || !castNS?.framework || !chromeCastNS?.media) return;

    try {
      const mediaInfo = new chromeCastNS.media.MediaInfo(track.url, 'audio/*');
      mediaInfo.streamType = chromeCastNS.media.StreamType.BUFFERED;
      const metadata = new chromeCastNS.media.MusicTrackMediaMetadata();
      metadata.title = track.title;
      metadata.artist = track.artist;
      metadata.albumName = track.album || '';
      const art = track.artworkUrl?.trim();
      if (art) metadata.images = [{ url: art }];
      mediaInfo.metadata = metadata;

      const request = new chromeCastNS.media.LoadRequest(mediaInfo);
      request.autoplay = autoplay;
      request.currentTime = Math.max(0, currentTime || 0);
      await session.loadMedia(request);
      castMediaSessionRef.current = session.getMediaSession?.() ?? null;
      setIsRemotePlaybackConnected(true);
    } catch {
      // Keep local playback when cast load fails.
    }
  }, [currentTrackData, currentTime]);

  // Keep cast device media in sync when track changes.
  useEffect(() => {
    if (!castSessionRef.current || !currentTrackData?.url) return;
    const shouldPlayOnCast = isPlaying || shouldAutoPlay;
    void loadCurrentTrackOnCast(shouldPlayOnCast);
    if (shouldAutoPlay) setShouldAutoPlay(false);
  }, [currentTrack, currentTrackData?.url, isPlaying, shouldAutoPlay, loadCurrentTrackOnCast]);

  // Discover remote playback capabilities (AirPlay / Remote Playback API) and Cast SDK fallback.
  useEffect(() => {
    const el = playbackAudioRef.current;
    if (!el) return;

    el.setAttribute('airplay', 'allow');
    el.setAttribute('x-webkit-airplay', 'allow');

    const airPlayElement = el as HTMLAudioElement & {
      webkitShowPlaybackTargetPicker?: () => void;
      webkitCurrentPlaybackTargetIsWireless?: boolean;
    };

    setIsAirPlayAvailable(typeof airPlayElement.webkitShowPlaybackTargetPicker === 'function');
    setIsAirPlayWireless(Boolean(airPlayElement.webkitCurrentPlaybackTargetIsWireless));

    const handleAirPlayAvailability = (event: Event) => {
      const e = event as Event & { availability?: string };
      setIsAirPlayAvailable(e.availability === 'available');
    };

    const handleAirPlayWirelessChanged = () => {
      setIsAirPlayWireless(Boolean(airPlayElement.webkitCurrentPlaybackTargetIsWireless));
    };

    el.addEventListener('webkitplaybacktargetavailabilitychanged', handleAirPlayAvailability);
    el.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', handleAirPlayWirelessChanged);

    let remote: RemotePlayback | null = null;
    try {
      remote = (el as HTMLAudioElement & { remote?: RemotePlayback }).remote ?? null;
    } catch {
      remote = null;
    }
    let removeRemoteListeners: (() => void) | null = null;
    if (remote && typeof remote.prompt === 'function') {
      setIsRemotePlaybackAvailable(true);
      setIsRemotePlaybackConnected(remote.state === 'connected');

      const handleRemoteStateChange = () => {
        setIsRemotePlaybackConnected(remote.state === 'connected');
      };

      remote.addEventListener('connecting', handleRemoteStateChange);
      remote.addEventListener('connect', handleRemoteStateChange);
      remote.addEventListener('disconnect', handleRemoteStateChange);

      removeRemoteListeners = () => {
        remote.removeEventListener('connecting', handleRemoteStateChange);
        remote.removeEventListener('connect', handleRemoteStateChange);
        remote.removeEventListener('disconnect', handleRemoteStateChange);
      };
    }

    const initCastFramework = () => {
      const win = window as any;
      if (!win.cast?.framework || !win.chrome?.cast) return undefined;
      try {
        const context = win.cast.framework.CastContext.getInstance();
        if (!context || typeof context.setOptions !== 'function') return undefined;
        context.setOptions({
          receiverApplicationId: castReceiverAppId,
          autoJoinPolicy: win.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
        });
        castContextRef.current = context;
        castEnabledRef.current = true;
        setIsRemotePlaybackAvailable(true);

        const syncCastState = () => {
          const session = context.getCurrentSession?.() ?? null;
          castSessionRef.current = session;
          castMediaSessionRef.current = session?.getMediaSession?.() ?? null;
          const deviceName = session?.getCastDevice?.()?.friendlyName;
          setRemotePlaybackDeviceName(typeof deviceName === 'string' && deviceName.trim() ? deviceName : null);
          const castState = context.getCastState?.();
          setIsRemotePlaybackConnected(Boolean(session) || castState === win.cast.framework.CastState.CONNECTED);
          if (!session) setRemotePlaybackDeviceName(null);
        };

        syncCastState();
        if (
          typeof context.addEventListener === 'function' &&
          typeof context.removeEventListener === 'function' &&
          win.cast.framework.CastContextEventType?.CAST_STATE_CHANGED
        ) {
          context.addEventListener(win.cast.framework.CastContextEventType.CAST_STATE_CHANGED, syncCastState);
          return () => context.removeEventListener(win.cast.framework.CastContextEventType.CAST_STATE_CHANGED, syncCastState);
        }
        return undefined;
      } catch {
        return undefined;
      }
    };

    let disposeCastListeners: (() => void) | undefined;
    const win = window as any;
    const existingCastScript = document.getElementById('google-cast-sender');
    const previousOnCastAvailable = win.__onGCastApiAvailable;
    win.__onGCastApiAvailable = (available: boolean) => {
      if (typeof previousOnCastAvailable === 'function') previousOnCastAvailable(available);
      if (!available) return;
      disposeCastListeners = initCastFramework();
    };

    if (win.cast?.framework && win.chrome?.cast) {
      disposeCastListeners = initCastFramework();
    } else if (!existingCastScript) {
      const script = document.createElement('script');
      script.id = 'google-cast-sender';
      script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      el.removeEventListener('webkitplaybacktargetavailabilitychanged', handleAirPlayAvailability);
      el.removeEventListener('webkitcurrentplaybacktargetiswirelesschanged', handleAirPlayWirelessChanged);
      removeRemoteListeners?.();
      if (typeof disposeCastListeners === 'function') disposeCastListeners();
      win.__onGCastApiAvailable = previousOnCastAvailable;
    };
  }, [castReceiverAppId]);

  const showAirPlayPicker = useCallback(() => {
    const el = playbackAudioRef.current as (HTMLAudioElement & {
      webkitShowPlaybackTargetPicker?: () => void;
    }) | null;
    if (!el) return;
    // Audible element is already native. Pause analysis so AirPlay stays pitch-stable.
    analysisAudioRef.current?.pause();
    resetPlaybackAudioBridge();
    setNativeRouteLock(true);
    el.webkitShowPlaybackTargetPicker?.();
  }, []);

  const showRemotePlaybackPicker = useCallback(async () => {
    const el = playbackAudioRef.current;
    if (el?.remote && typeof el.remote.prompt === 'function') {
      analysisAudioRef.current?.pause();
      resetPlaybackAudioBridge();
      setNativeRouteLock(true);
      try {
        await el.remote.prompt();
        return;
      } catch {
        // Fall through to Cast SDK fallback.
      }
    }

    if (!castEnabledRef.current || !castContextRef.current) return;
    try {
      await castContextRef.current.requestSession();
      castSessionRef.current = castContextRef.current.getCurrentSession?.() ?? null;
      if (castSessionRef.current) {
        await loadCurrentTrackOnCast(isPlaying || shouldAutoPlay);
        const deviceName = castSessionRef.current.getCastDevice?.()?.friendlyName;
        setRemotePlaybackDeviceName(typeof deviceName === 'string' && deviceName.trim() ? deviceName : null);
      }
    } catch {
      // User canceled Cast picker or no devices available.
    }
  }, [isPlaying, shouldAutoPlay, loadCurrentTrackOnCast]);

  const skipForward = useCallback(() => {
    if (currentTrack >= tracks.length - 1) return;
    const wasPlaying = isPlaying;
    setCurrentTime(0);
    const next = tracks[currentTrack + 1];
    if (!next?.url) {
      clearAutoAdvance();
      setIsPlaying(false);
      setCurrentTrackState(currentTrack + 1);
      return;
    }
    if (wasPlaying) {
      beginAutoAdvance();
      setIsPlaying(true);
    } else {
      clearAutoAdvance();
      setIsPlaying(false);
    }
    setCurrentTrackState(currentTrack + 1);
  }, [currentTrack, tracks, isPlaying, beginAutoAdvance, clearAutoAdvance]);

  const skipBack = useCallback(() => {
    if (currentTrack <= 0) return;
    const wasPlaying = isPlaying;
    setCurrentTime(0);
    const prev = tracks[currentTrack - 1];
    if (!prev?.url) {
      clearAutoAdvance();
      setIsPlaying(false);
      setCurrentTrackState(currentTrack - 1);
      return;
    }
    if (wasPlaying) {
      beginAutoAdvance();
      setIsPlaying(true);
    } else {
      clearAutoAdvance();
      setIsPlaying(false);
    }
    setCurrentTrackState(currentTrack - 1);
  }, [currentTrack, tracks, isPlaying, beginAutoAdvance, clearAutoAdvance]);

  const handleSeek = useCallback((value: number[]) => {
    const t = value[0];
    setCurrentTime(t);
    if (castSessionRef.current) {
      const mediaSession = castMediaSessionRef.current ?? castSessionRef.current.getMediaSession?.();
      const chromeCastNS = (window as any).chrome?.cast;
      if (mediaSession && chromeCastNS?.media?.SeekRequest) {
        try {
          const seekRequest = new chromeCastNS.media.SeekRequest();
          seekRequest.currentTime = t;
          mediaSession.seek(seekRequest);
        } catch {
          // Ignore cast seek failure and keep local UI synced.
        }
      }
    }
    if (playbackAudioRef.current) playbackAudioRef.current.currentTime = t;
    if (analysisAudioRef.current && isAnalysisAudioActive) {
      try {
        analysisAudioRef.current.currentTime = t;
      } catch {
        /* ignore */
      }
    }
  }, [isAnalysisAudioActive]);

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  const formatTime = useCallback((time: number) => {
    if (!Number.isFinite(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  const selectTrack = useCallback(
    (index: number) => {
      const track = tracks[index];
      if (!track) return;
      if (!track.url) {
        setCurrentTrackState(index);
        setCurrentTime(0);
        setIsPlaying(false);
        return;
      }
      activatePlaybackSession();
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentTrackState(index);
      setShouldAutoPlay(true);
    },
    [tracks, activatePlaybackSession]
  );

  const setCurrentTrack = useCallback((index: number) => {
    setCurrentTrackState(index);
  }, []);

  const setHeroStageActive = useCallback((active: boolean) => {
    setIsHeroStage(active);
  }, []);

  const beginPlayback = useCallback(
    (opts?: { forceHero?: boolean; trackIndex?: number }) => {
      const requestedIndex = opts?.trackIndex;
      const fallbackIndex = tracks[currentTrack]?.url?.trim()
        ? currentTrack
        : tracks.findIndex((t) => t.url?.trim());
      const targetIndex =
        requestedIndex != null && tracks[requestedIndex]?.url?.trim()
          ? requestedIndex
          : fallbackIndex;

      if (targetIndex < 0) {
        setIsBuffering(false);
        toast.error('No audio file uploaded for this track. Upload audio in edit mode.');
        return;
      }

      activatePlaybackSession();
      activatePlaybackAudioSession();

      const useHero = opts?.forceHero ?? heroInView;
      if (opts?.forceHero && pageVisible && !isFullscreen) {
        setIsHeroStage(true);
      } else if (useHero && heroInView && pageVisible && !isFullscreen) {
        setIsHeroStage(true);
      }

      resumeAudioContextIfNeeded();

      if (currentTrack !== targetIndex) {
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentTrackState(targetIndex);
        setShouldAutoPlay(true);
        return;
      }

      const track = tracks[targetIndex];
      if (!track?.url) {
        setIsBuffering(false);
        return;
      }

      const el = playbackAudioRef.current;
      if (!castSessionRef.current && el) {
        if (!isAudioReady || el.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
          el.load();
          setShouldAutoPlay(true);
          return;
        }
      }

      setIsBuffering(false);
      setIsPlaying(true);
    },
    [tracks, currentTrack, isAudioReady, heroInView, pageVisible, isFullscreen, resumeAudioContextIfNeeded, activatePlaybackSession]
  );

  const playFromHero = useCallback(() => {
    beginPlayback({ forceHero: true });
  }, [beginPlayback]);

  const playTrackAtHero = useCallback(
    (index: number) => {
      const track = tracks[index];
      if (!track?.url?.trim()) {
        toast.error('No audio file uploaded for this track. Upload audio in edit mode.');
        return;
      }
      catalogPlayPendingRef.current = true;
      heroStageLockUntilRef.current = Date.now() + 8000;
      scrollToHeroStage('smooth');
      setIsBuffering(true);
      beginPlayback({ forceHero: true, trackIndex: index });
    },
    [tracks, beginPlayback]
  );

  const playTrackInPlace = useCallback(
    (index: number) => {
      const track = tracks[index];
      if (!track?.url?.trim()) {
        toast.error('No audio file uploaded for this track. Upload audio in edit mode.');
        return;
      }
      catalogPlayPendingRef.current = false;
      heroStageLockUntilRef.current = 0;
      if (!heroInView) {
        setIsHeroStage(false);
      }
      setIsBuffering(true);
      beginPlayback({ trackIndex: index });
    },
    [tracks, beginPlayback, heroInView]
  );

  const togglePlay = useCallback(() => {
    const track = tracks[currentTrack];
    if (!track?.url) return;

    if (isPlaying) {
      catalogPlayPendingRef.current = false;
      setIsHeroStage(false);
      userPausedRef.current = true;
      shouldAutoPlayRef.current = false;
      setShouldAutoPlay(false);
      autoAdvanceRef.current = false;
      resumeAudioContextIfNeeded();
      setIsPlaying(false);
      return;
    }

    userPausedRef.current = false;
    activatePlaybackAudioSession();
    beginPlayback({ forceHero: heroInView || isHeroStage });
  }, [tracks, currentTrack, isPlaying, beginPlayback, resumeAudioContextIfNeeded, heroInView, isHeroStage]);

  // Fullscreen takes over the viz surface; hero stage yields
  useEffect(() => {
    if (isFullscreen && isHeroStage) {
      setIsHeroStage(false);
    }
  }, [isFullscreen, isHeroStage]);

  /** While playing: enter hero stage when hero is visible; exit when scrolled away (audio continues). */
  useEffect(() => {
    if (!isPlaying || isFullscreen) {
      if (!isPlaying && !isBuffering) catalogPlayPendingRef.current = false;
      return;
    }

    if (!pageVisible) {
      catalogPlayPendingRef.current = false;
      setIsHeroStage(false);
      return;
    }

    if (catalogPlayPendingRef.current) {
      if (heroInView) {
        catalogPlayPendingRef.current = false;
        heroStageLockUntilRef.current = 0;
        setIsHeroStage(true);
        void resumeAudioContextIfNeeded();
      }
      return;
    }

    if (heroInView) {
      heroStageLockUntilRef.current = 0;
      const timer = window.setTimeout(() => {
        setIsHeroStage(true);
        void resumeAudioContextIfNeeded();
      }, 150);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      if (Date.now() < heroStageLockUntilRef.current) return;
      setIsHeroStage(false);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [isPlaying, isBuffering, heroInView, pageVisible, isFullscreen, resumeAudioContextIfNeeded]);

  const value: PlaybackContextType = useMemo(
    () => ({
      tracks,
      currentTrack,
      setCurrentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      isAudioReady,
      isBuffering,
      hasPlaybackSession,
      currentTrackData,
      audioRef,
      analysisAudioRef,
      togglePlay,
      skipForward,
      skipBack,
      handleSeek,
      handleVolumeChange,
      toggleMute,
      formatTime,
      selectTrack,
      setShouldAutoPlay,
      isFullscreen,
      setIsFullscreen,
      isAirPlayAvailable,
      isRemotePlaybackAvailable,
      isRemotePlaybackConnected,
      remotePlaybackDeviceName,
      isAnalysisAudioActive,
      analysisEpoch,
      showAirPlayPicker,
      showRemotePlaybackPicker,
      isHeroStage,
      heroInView,
      setHeroInView,
      setHeroStageActive,
      playFromHero,
      playTrackAtHero,
      playTrackInPlace,
      analyser,
      setAnalyser,
    }),
    [
      tracks,
      currentTrack,
      isPlaying,
      isFullscreen,
      isHeroStage,
      heroInView,
      analyser,
      currentTime,
      duration,
      volume,
      isMuted,
      isAudioReady,
      isBuffering,
      hasPlaybackSession,
      currentTrackData,
      audioRef,
      togglePlay,
      skipForward,
      skipBack,
      handleSeek,
      handleVolumeChange,
      toggleMute,
      formatTime,
      selectTrack,
      isFullscreen,
      isAirPlayAvailable,
      isRemotePlaybackAvailable,
      isRemotePlaybackConnected,
      remotePlaybackDeviceName,
      isAnalysisAudioActive,
      analysisEpoch,
      showAirPlayPicker,
      showRemotePlaybackPicker,
      setHeroStageActive,
      playFromHero,
      playTrackAtHero,
      playTrackInPlace,
      setAnalyser,
    ]
  );

  return (
    <PlaybackContext.Provider value={value}>
      {children}
      {/* Audible element is a document singleton (see playbackElement.ts), not React-owned. */}
      {/* Analysis element: desktop viz only — never mount on iOS (avoids audio-session fights). */}
      {!appleTouchDeviceRef.current && (
        <audio
          key={analysisEpoch}
          ref={analysisAudioRef}
          preload={currentTrackUrl && isAnalysisAudioActive ? 'auto' : 'none'}
          playsInline
          disableRemotePlayback
          className="sr-only"
          aria-hidden
        />
      )}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (ctx === undefined) throw new Error('usePlayback must be used within PlaybackProvider');
  return ctx;
}
