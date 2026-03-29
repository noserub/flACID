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

/** Compare media URL to element.src (absolute) */
function audioSrcMatchesElement(url: string, elementSrc: string): boolean {
  if (!url || !elementSrc) return false;
  try {
    return new URL(url, window.location.href).href === new URL(elementSrc).href;
  } catch {
    return elementSrc.includes(url);
  }
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
  const [isPageVisible, setIsPageVisible] = useState(
    () => (typeof document !== 'undefined' ? document.visibilityState === 'visible' : true)
  );

  const visualizerAudioRef = useRef<HTMLAudioElement>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement>(null);
  const audioRef = visualizerAudioRef; // alias for MusicPlayer

  const currentTrackUrl = tracks[currentTrack]?.url?.trim() ?? '';
  const currentTrackData = tracks[currentTrack];

  // Use background (direct) audio when hidden so playback continues with screen off
  const useBackgroundAudio = !isPageVisible;

  // Load / reset audio only when the track (or its URL) changes — not when switching tabs.
  // Including useBackgroundAudio in deps previously re-ran this and set isPlaying false, stopping background audio.
  // useBackgroundAudio is read here only to pick which element receives the new load when the track changes.
  useEffect(() => {
    setIsAudioReady(false);
    setIsBuffering(false);
    setIsPlaying(false);
    if (!currentTrackData) return;

    const activeEl = useBackgroundAudio ? backgroundAudioRef.current : visualizerAudioRef.current;
    const inactiveEl = useBackgroundAudio ? visualizerAudioRef.current : backgroundAudioRef.current;

    const setupElement = (el: HTMLAudioElement | null, shouldLoad: boolean) => {
      if (!el) return;
      if (currentTrackUrl) {
        if (shouldLoad) {
          el.pause();
          el.currentTime = 0;
          el.crossOrigin = 'anonymous';
          el.src = currentTrackData.url;
          el.load();
        }
      } else {
        el.pause();
        el.removeAttribute('src');
        el.load();
        setDuration(parseDurationStr(currentTrackData.duration));
        setCurrentTime(0);
      }
    };

    setupElement(activeEl, true);
    setupElement(inactiveEl, false);
  }, [currentTrack, currentTrackUrl, currentTrackData]);

  // Sync play/pause and volume to the active element
  useEffect(() => {
    const active = useBackgroundAudio ? backgroundAudioRef.current : visualizerAudioRef.current;
    const inactive = useBackgroundAudio ? visualizerAudioRef.current : backgroundAudioRef.current;
    if (active) {
      if (isPlaying) active.play().catch(() => setIsPlaying(false));
      else active.pause();
      active.volume = isMuted ? 0 : volume;
    }
    if (inactive) {
      inactive.pause();
      inactive.volume = isMuted ? 0 : volume;
    }
  }, [isPlaying, volume, isMuted, useBackgroundAudio]);

  // Apply volume to both when it changes
  useEffect(() => {
    const vol = isMuted ? 0 : volume;
    if (visualizerAudioRef.current) visualizerAudioRef.current.volume = vol;
    if (backgroundAudioRef.current) backgroundAudioRef.current.volume = vol;
  }, [volume, isMuted]);

  // Switch audio elements when visibility changes (background = direct output, continues when screen off)
  const visibilityRef = useRef(isPageVisible);
  useEffect(() => {
    if (visibilityRef.current === isPageVisible) return;
    visibilityRef.current = isPageVisible;

    const from = isPageVisible ? backgroundAudioRef.current : visualizerAudioRef.current;
    const to = isPageVisible ? visualizerAudioRef.current : backgroundAudioRef.current;
    if (!from || !to || !currentTrackUrl) return;

    const t = from.currentTime;
    const wantUrl = currentTrackData?.url ?? '';
    if (!wantUrl || !audioSrcMatchesElement(wantUrl, to.src)) {
      to.crossOrigin = 'anonymous';
      to.src = wantUrl;
      to.load();
    }
    to.currentTime = t;
    setCurrentTime(t);
    if (isPlaying) {
      from.pause();
      to.play().catch(() => setIsPlaying(false));
    } else {
      from.pause();
      to.pause();
    }
  }, [isPageVisible, isPlaying, currentTrackUrl, currentTrackData?.url]);

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    const el = visualizerAudioRef.current ?? backgroundAudioRef.current;
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
      const active = useBackgroundAudio ? backgroundAudioRef.current : visualizerAudioRef.current;
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
  }, [isPlaying, duration, currentTime, useBackgroundAudio]);

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
        if (backgroundAudioRef.current) backgroundAudioRef.current.currentTime = t;
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

  // Track visibility and switch audio; resume context when visible
  useEffect(() => {
    const handler = () => {
      const visible = document.visibilityState === 'visible';
      setIsPageVisible(visible);
      if (visible) resumeAudioContext();
    };
    handler(); // sync initial state
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const resumeAudioContextIfNeeded = useCallback(() => {
    // AudioContext resume is handled in MusicPlayer when isPlaying becomes true
  }, []);

  const togglePlay = useCallback(() => {
    const track = tracks[currentTrack];
    if (!track?.url) return;
    const activeEl = useBackgroundAudio ? backgroundAudioRef.current : visualizerAudioRef.current;
    if (!isAudioReady && activeEl) {
      activeEl.load();
      return;
    }
    resumeAudioContextIfNeeded();
    setIsPlaying((p) => !p);
  }, [tracks, currentTrack, isAudioReady, useBackgroundAudio, resumeAudioContextIfNeeded]);

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
    if (visualizerAudioRef.current) visualizerAudioRef.current.currentTime = t;
    if (backgroundAudioRef.current) backgroundAudioRef.current.currentTime = t;
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
        className="sr-only"
        aria-hidden
      />
      <audio
        ref={backgroundAudioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onError={handleError}
        onEnded={handleEnded}
        preload={currentTrackUrl ? 'metadata' : 'none'}
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
