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
import { isSupabaseConfigured } from '../lib/supabase';
import { parseVisualizationId } from '../lib/contentMappers';
import { formatDuration } from '../utils';

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
  currentTrackData: PlayerTrack | undefined;
  /** Ref to the visualizer audio element — used by MusicPlayer to connect analyser (Web Audio) */
  audioRef: RefObject<HTMLAudioElement | null>;
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
  showAirPlayPicker: () => void;
  showRemotePlaybackPicker: () => Promise<void>;
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
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAirPlayAvailable, setIsAirPlayAvailable] = useState(false);
  const [isRemotePlaybackAvailable, setIsRemotePlaybackAvailable] = useState(false);
  const [isRemotePlaybackConnected, setIsRemotePlaybackConnected] = useState(false);
  const [remotePlaybackDeviceName, setRemotePlaybackDeviceName] = useState<string | null>(null);
  const visualizerAudioRef = useRef<HTMLAudioElement>(null);
  const castContextRef = useRef<any>(null);
  const castSessionRef = useRef<any>(null);
  const castMediaSessionRef = useRef<any>(null);
  const castEnabledRef = useRef(false);
  const audioRef = visualizerAudioRef; // alias for MusicPlayer

  const currentTrackUrl = tracks[currentTrack]?.url?.trim() ?? '';
  const currentTrackData = tracks[currentTrack];
  const castReceiverAppId = String(import.meta.env.VITE_GOOGLE_CAST_APP_ID ?? '').trim() || 'CC1AD845';

  // Load / reset audio when the track (or its URL) changes.
  // Single element: audible output stays on the element; analyser uses captureStream in MusicPlayer (no handoff).
  useEffect(() => {
    setIsAudioReady(false);
    setIsBuffering(false);
    setIsPlaying(false);
    if (!currentTrackData) return;

    const el = visualizerAudioRef.current;
    if (!el) return;

    if (currentTrackUrl) {
      el.pause();
      el.currentTime = 0;
      el.crossOrigin = 'anonymous';
      el.src = currentTrackData.url;
      el.load();
    } else {
      el.pause();
      el.removeAttribute('src');
      el.load();
      setDuration(parseDurationStr(currentTrackData.duration));
      setCurrentTime(0);
    }
  }, [currentTrack, currentTrackUrl, currentTrackData]);

  // Drive play/pause and volume on the single element
  useEffect(() => {
    const el = visualizerAudioRef.current;
    if (!el) return;
    el.volume = isMuted ? 0 : volume;
    if (castSessionRef.current) {
      el.pause();
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
      const p = el.play();
      if (p !== undefined) p.catch(() => setIsPlaying(false));
    } else {
      el.pause();
    }
  }, [isPlaying, volume, isMuted]);

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const el = visualizerAudioRef.current;
    if (el) setDuration(el.duration);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsAudioReady(true);
    setIsBuffering(false);
    if (shouldAutoPlay) {
      setIsPlaying(true);
      setShouldAutoPlay(false);
    }
  }, [shouldAutoPlay]);

  const handleWaiting = useCallback(() => setIsBuffering(true), []);
  const handlePlaying = useCallback(() => setIsBuffering(false), []);

  const handleError = useCallback(() => {
    setIsAudioReady(false);
    setIsPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    if (currentTrack < tracks.length - 1) {
      const next = tracks[currentTrack + 1];
      setCurrentTrackState(currentTrack + 1);
      if (next.url) setShouldAutoPlay(true);
      else setIsPlaying(false);
    } else {
      setIsPlaying(false);
    }
  }, [currentTrack, tracks]);

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
        const fallback = new URL('/android-chrome-192x192.png', window.location.origin).href;
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
      const active = visualizerAudioRef.current;
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

  // Media Session API: action handlers so lock screen / car controls work
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;

    ms.setActionHandler('play', async () => {
      await resumeAudioContext();
      setIsPlaying(true);
      ms.playbackState = 'playing';
    });
    ms.setActionHandler('pause', () => {
      setIsPlaying(false);
      ms.playbackState = 'paused';
    });
    ms.setActionHandler('previoustrack', () => {
      if (currentTrack > 0) {
        setCurrentTrackState(currentTrack - 1);
        setCurrentTime(0);
        const prev = tracks[currentTrack - 1];
        if (prev?.url) setShouldAutoPlay(true);
      }
    });
    ms.setActionHandler('nexttrack', () => {
      if (currentTrack < tracks.length - 1) {
        setCurrentTrackState(currentTrack + 1);
        setCurrentTime(0);
        const next = tracks[currentTrack + 1];
        if (next?.url) setShouldAutoPlay(true);
      }
    });
    ms.setActionHandler('seekto', (details) => {
      const t = details.seekTime;
      if (typeof t === 'number' && Number.isFinite(t)) {
        setCurrentTime(t);
        if (visualizerAudioRef.current) visualizerAudioRef.current.currentTime = t;
      }
    });

    return () => {
      ms.setActionHandler('play', null);
      ms.setActionHandler('pause', null);
      ms.setActionHandler('previoustrack', null);
      ms.setActionHandler('nexttrack', null);
      ms.setActionHandler('seekto', null);
    };
  }, [currentTrack, tracks]);

  // Sync UI to paused when AudioContext suspends — only when using visualizer (visible)
  useEffect(() => {
    registerOnSuspend(() => {
      if (document.visibilityState === 'visible') setIsPlaying(false);
    });
    return () => registerOnSuspend(null);
  }, []);

  // Resume AudioContext when tab is foregrounded (analyser path; element audio is independent).
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') resumeAudioContext();
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const resumeAudioContextIfNeeded = useCallback(() => {
    // AudioContext resume is handled in MusicPlayer when isPlaying becomes true
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
    const el = visualizerAudioRef.current;
    if (!el) return;

    el.setAttribute('airplay', 'allow');
    el.setAttribute('x-webkit-airplay', 'allow');

    const airPlayElement = el as HTMLAudioElement & {
      webkitShowPlaybackTargetPicker?: () => void;
    };

    setIsAirPlayAvailable(typeof airPlayElement.webkitShowPlaybackTargetPicker === 'function');

    const handleAirPlayAvailability = (event: Event) => {
      const e = event as Event & { availability?: string };
      setIsAirPlayAvailable(e.availability === 'available');
    };

    el.addEventListener('webkitplaybacktargetavailabilitychanged', handleAirPlayAvailability);

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
      removeRemoteListeners?.();
      if (typeof disposeCastListeners === 'function') disposeCastListeners();
      win.__onGCastApiAvailable = previousOnCastAvailable;
    };
  }, [castReceiverAppId]);

  const showAirPlayPicker = useCallback(() => {
    const el = visualizerAudioRef.current as (HTMLAudioElement & {
      webkitShowPlaybackTargetPicker?: () => void;
    }) | null;
    if (!el) return;
    el.webkitShowPlaybackTargetPicker?.();
  }, []);

  const showRemotePlaybackPicker = useCallback(async () => {
    const el = visualizerAudioRef.current;
    if (el?.remote && typeof el.remote.prompt === 'function') {
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

  const togglePlay = useCallback(() => {
    const track = tracks[currentTrack];
    if (!track?.url) return;
    const el = visualizerAudioRef.current;
    if (!castSessionRef.current && !isAudioReady && el) {
      el.load();
      return;
    }
    resumeAudioContextIfNeeded();
    setIsPlaying((p) => !p);
  }, [tracks, currentTrack, isAudioReady, resumeAudioContextIfNeeded]);

  const skipForward = useCallback(() => {
    if (currentTrack >= tracks.length - 1) return;
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentTrackState(currentTrack + 1);
    const next = tracks[currentTrack + 1];
    if (next?.url) setShouldAutoPlay(true);
  }, [currentTrack, tracks]);

  const skipBack = useCallback(() => {
    if (currentTrack <= 0) return;
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentTrackState(currentTrack - 1);
    const prev = tracks[currentTrack - 1];
    if (prev?.url) setShouldAutoPlay(true);
  }, [currentTrack, tracks]);

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
    if (visualizerAudioRef.current) visualizerAudioRef.current.currentTime = t;
  }, []);

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
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentTrackState(index);
      setShouldAutoPlay(true);
    },
    [tracks]
  );

  const setCurrentTrack = useCallback((index: number) => {
    setCurrentTrackState(index);
  }, []);

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
      setShouldAutoPlay,
      isFullscreen,
      setIsFullscreen,
      isAirPlayAvailable,
      isRemotePlaybackAvailable,
      isRemotePlaybackConnected,
      remotePlaybackDeviceName,
      showAirPlayPicker,
      showRemotePlaybackPicker,
    }),
    [
      tracks,
      currentTrack,
      isPlaying,
      isFullscreen,
      currentTime,
      duration,
      volume,
      isMuted,
      isAudioReady,
      isBuffering,
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
      showAirPlayPicker,
      showRemotePlaybackPicker,
    ]
  );

  return (
    <PlaybackContext.Provider value={value}>
      {children}
      <audio
        ref={visualizerAudioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onError={handleError}
        onEnded={handleEnded}
        preload={currentTrackUrl ? 'metadata' : 'none'}
        playsInline
        className="sr-only"
        aria-hidden
      />
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (ctx === undefined) throw new Error('usePlayback must be used within PlaybackProvider');
  return ctx;
}
