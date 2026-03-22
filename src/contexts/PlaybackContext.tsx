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
import { resumeAudioContext } from '../lib/audioContextManager';
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
  currentTrackData: PlayerTrack | undefined;
  /** Ref to the audio element — used by MusicPlayer to connect analyser for Descend reactivity */
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
    if (isEditMode) {
      return content.musicPlayer.tracks.map((t) => ({
        ...t,
        visualizationId: t.visualizationId ?? 0,
      }));
    }
    // When we have a draft (e.g. just exited edit mode), use content so visualization and other edits persist
    if (isDraft) {
      return content.musicPlayer.tracks.map((t) => ({
        ...t,
        visualizationId: t.visualizationId ?? 0,
      }));
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
      }));
    }
    return content.musicPlayer.tracks.map((t) => ({
      ...t,
      visualizationId: t.visualizationId ?? 0,
    }));
  }, [isEditMode, isDraft, isSupabaseConfigured, tracksLoading, supabaseTracks, content.musicPlayer.tracks, draftRevision]);

  const [currentTrack, setCurrentTrackState] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrackUrl = tracks[currentTrack]?.url?.trim() ?? '';
  const currentTrackData = tracks[currentTrack];

  useEffect(() => {
    setIsAudioReady(false);
    setIsPlaying(false);
    if (!audioRef.current || !currentTrackData) return;

    if (currentTrackUrl) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.crossOrigin = 'anonymous';
      audioRef.current.src = currentTrackData.url;
      audioRef.current.load();
    } else {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      setDuration(parseDurationStr(currentTrackData.duration));
      setCurrentTime(0);
    }
  }, [currentTrack, currentTrackUrl, currentTrackData]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  }, []);

  const handleCanPlay = useCallback(() => {
    setIsAudioReady(true);
    if (shouldAutoPlay) {
      setIsPlaying(true);
      setShouldAutoPlay(false);
    }
  }, [shouldAutoPlay]);

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

  // Media Session API: metadata for lock screen, car display, etc.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const track = currentTrackData;
    if (!track) {
      navigator.mediaSession.metadata = null;
      return;
    }
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || undefined,
      // artwork: add when album art URLs available
    });
  }, [currentTrackData]);

  // Media Session API: action handlers so lock screen / car controls work
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const ms = navigator.mediaSession;

    ms.setActionHandler('play', async () => {
      await resumeAudioContext();
      setIsPlaying(true);
    });
    ms.setActionHandler('pause', () => setIsPlaying(false));
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
        if (audioRef.current) audioRef.current.currentTime = t;
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

  // Resume AudioContext when tab becomes visible (fixes silence after background/sleep)
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        resumeAudioContext();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, []);

  const resumeAudioContextIfNeeded = useCallback(() => {
    // AudioContext resume is handled in MusicPlayer when isPlaying becomes true
  }, []);

  const togglePlay = useCallback(() => {
    const track = tracks[currentTrack];
    if (!track?.url) return;
    if (!isAudioReady && audioRef.current) {
      audioRef.current.load();
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
    if (audioRef.current) audioRef.current.currentTime = t;
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
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onEnded={handleEnded}
        preload="none"
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
