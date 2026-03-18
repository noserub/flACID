import { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, List, Maximize, Minimize, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { PsychedelicVisualizer } from './PsychedelicVisualizer';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentIntensity } from '../contexts/DescentIntensityContext';
import { useTracks } from '../hooks';
import { isSupabaseConfigured } from '../lib/supabase';
import { parseVisualizationId } from '../lib/contentMappers';
import { formatDuration } from '../utils';
import { MusicPlayerEditDialog } from './MusicPlayerEditDialog';
import { motion, AnimatePresence } from 'motion/react';

interface PlayerTrack {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  url: string;
  visualizationId: number;
}

// Parse duration string to seconds
const parseDuration = (durationStr: string): number => {
  const [minutes, seconds] = durationStr.split(':').map(Number);
  return minutes * 60 + seconds;
};

export function MusicPlayer() {
  const { content, isEditMode } = useEditMode();
  const { registerAnalyser } = useDescentIntensity();
  const { tracks: supabaseTracks, loading: tracksLoading } = useTracks();

  // Use Supabase tracks when configured and loaded; otherwise use EditModeContext
  const tracks: PlayerTrack[] = useMemo(() => {
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
  }, [isSupabaseConfigured, tracksLoading, supabaseTracks, content.musicPlayer.tracks]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisualizerLoading, setIsVisualizerLoading] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // AudioContext/analyser for visualizer only. We do NOT connect the audio element to the
  // context so that cross-origin URLs (e.g. Supabase Storage) can play sound; connecting
  // would require CORS and causes "MediaElementAudioSource outputs zeroes".
  useEffect(() => {
    if (audioContextRef.current && analyserRef.current) return;
    const AudioContextConstructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    const ctx = new AudioContextConstructor();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    console.log('Audio context and analyser created successfully');
    return () => {
      try {
        if (analyserRef.current) analyserRef.current.disconnect();
      } catch (_) {}
      if (audioContextRef.current?.state !== 'closed') audioContextRef.current?.close();
    };
  }, []);

  // Track URL for stable effect deps (avoids reload loop when tracks array reference changes)
  const currentTrackUrl = tracks[currentTrack]?.url?.trim() ?? '';
  const currentTrackData = tracks[currentTrack];

  // Update audio source when track index or track URL changes
  useEffect(() => {
    setIsAudioReady(false);
    setIsPlaying(false);
    if (!audioRef.current || !currentTrackData) return;

    if (currentTrackUrl) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute('crossOrigin');
      audioRef.current.src = currentTrackData.url;
      audioRef.current.load();
      console.log(`Loading track: ${currentTrackData.title}`, currentTrackUrl.substring(0, 50) + '...');
    } else {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      setDuration(parseDuration(currentTrackData.duration));
      setCurrentTime(0);
      console.log(`No audio file for track: ${currentTrackData.title}`);
    }
  }, [currentTrack, currentTrackUrl]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.log('Audio playback failed:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Audio event handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      console.log(`Audio metadata loaded - Duration: ${audioRef.current.duration}s`);
    }
  };

  const handleCanPlay = () => {
    setIsAudioReady(true);
    console.log('Audio ready to play');
    
    // Auto-play if requested (e.g., from playlist selection)
    if (shouldAutoPlay) {
      setIsPlaying(true);
      setShouldAutoPlay(false);
    }
  };

  const handleError = (_e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    if (audioRef.current && audioRef.current.src) {
      console.error('Failed to load audio:', {
        track: tracks[currentTrack]?.title,
        url: audioRef.current.src.substring(0, 100),
        error: _e.type,
        message: audioRef.current.error?.message || 'Unknown error'
      });
    }
    setIsAudioReady(false);
    setIsPlaying(false);
  };

  const handleEnded = () => {
    // Auto-play next track
    if (currentTrack < tracks.length - 1) {
      const nextTrack = tracks[currentTrack + 1];
      setCurrentTrack(currentTrack + 1);
      
      // Only auto-play if next track has audio
      if (nextTrack.url) {
        setShouldAutoPlay(true);
      } else {
        setIsPlaying(false);
      }
    } else {
      setIsPlaying(false);
    }
  };

  const resumeAudioContextIfNeeded = () => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const togglePlay = () => {
    const track = tracks[currentTrack];
    if (!track.url) {
      alert('No audio file uploaded for this track. Please upload an audio file in edit mode.');
      return;
    }
    
    if (!isAudioReady && audioRef.current) {
      console.log('Audio not ready yet, waiting...');
      // Try to load again
      audioRef.current.load();
      return;
    }
    // Resume AudioContext on user gesture so sound is output (browser autoplay policy)
    resumeAudioContextIfNeeded();
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    if (currentTrack < tracks.length - 1) {
      const nextTrack = tracks[currentTrack + 1];
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentTrack(currentTrack + 1);
      if (nextTrack.url) {
        resumeAudioContextIfNeeded();
        setShouldAutoPlay(true);
      }
    }
  };

  const skipBack = () => {
    if (currentTrack > 0) {
      const prevTrack = tracks[currentTrack - 1];
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentTrack(currentTrack - 1);
      if (prevTrack.url) {
        resumeAudioContextIfNeeded();
        setShouldAutoPlay(true);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const selectTrack = (index: number) => {
    const track = tracks[index];
    if (!track.url) {
      setCurrentTrack(index);
      setCurrentTime(0);
      setIsPlaying(false);
      return;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentTrack(index);
    resumeAudioContextIfNeeded();
    setShouldAutoPlay(true);
    console.log(`Playlist selection: ${track.title} - Auto-play queued`);
  };

  // Fullscreen functionality with loading state
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsVisualizerLoading(true);
      setIsFullscreen(true);
      // Hide loading indicator after animation completes
      setTimeout(() => setIsVisualizerLoading(false), 800);
    } else {
      setIsFullscreen(false);
      setIsVisualizerLoading(false);
    }
  };

  // Touch gesture handlers for swipe-down to exit fullscreen
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isFullscreen) return;
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isFullscreen || touchStartY === null) return;
    setTouchCurrentY(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isFullscreen || touchStartY === null || touchCurrentY === null) {
      setTouchStartY(null);
      setTouchCurrentY(null);
      return;
    }

    const swipeDistance = touchCurrentY - touchStartY;
    const swipeThreshold = 100; // Minimum swipe distance in pixels

    // If swiped down more than threshold, exit fullscreen
    if (swipeDistance > swipeThreshold) {
      setIsFullscreen(false);
      setIsVisualizerLoading(false);
    }

    setTouchStartY(null);
    setTouchCurrentY(null);
  };

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullscreen]);

  // Prevent body scrolling when fullscreen is active
  useEffect(() => {
    if (isFullscreen) {
      // Save current overflow state
      const originalOverflow = document.body.style.overflow;
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      
      // Restore on cleanup
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isFullscreen]);

  // Register analyser with Descent Mode
  useEffect(() => {
    registerAnalyser(analyserRef.current, isPlaying);
  }, [isPlaying, registerAnalyser]);

  if (!tracks || tracks.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto relative">
        {isEditMode && <MusicPlayerEditDialog />}
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No tracks available. {isEditMode && 'Click "Edit Tracks" to add music.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto relative">
      {isEditMode && <MusicPlayerEditDialog />}
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onError={handleError}
        onEnded={handleEnded}
        preload="auto"
      />
      
      {/* Fullscreen container overlay with animation */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-black"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Loading indicator */}
            <AnimatePresence>
              {isVisualizerLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex items-center justify-center z-[60] bg-black/50 backdrop-blur-sm"
                >
                  <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 text-purple-400 animate-spin mx-auto" />
                    <p className="text-white/80 text-lg">Initializing visualization...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Swipe indicator (visible during swipe) */}
            {touchStartY !== null && touchCurrentY !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: Math.min((touchCurrentY - touchStartY) / 100, 0.6) }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[55] pointer-events-none"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm">
                  Swipe down to exit
                </div>
              </motion.div>
            )}

            {/* Visualizer */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: touchStartY !== null && touchCurrentY !== null 
                  ? Math.max(0, touchCurrentY - touchStartY) * 0.5 
                  : 0
              }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative h-full w-full bg-gradient-to-br from-cyan-900/20 to-fuchsia-900/20"
            >
              <PsychedelicVisualizer 
                key="fullscreen-visualizer"
                analyser={null}
                isPlaying={isPlaying} 
                currentTrack={currentTrack}
                visualizationId={tracks[currentTrack]?.visualizationId}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-center"
                >
                  <h3 className="text-white/90 mb-2 text-4xl md:text-5xl">{tracks[currentTrack].title}</h3>
                  <p className="text-white/60 text-2xl md:text-3xl">{tracks[currentTrack].artist}</p>
                  {tracks[currentTrack].album && (
                    <p className="text-white/50 mt-1 text-xl md:text-2xl">{tracks[currentTrack].album}</p>
                  )}
                </motion.div>
              </div>
              
              {/* Fullscreen exit button */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="absolute top-6 right-6 pointer-events-auto z-50"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-white hover:text-white hover:bg-white/20 h-12 w-12 rounded-full backdrop-blur-sm bg-black/30 transition-all hover:scale-110"
                >
                  <X className="h-6 w-6" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Fullscreen controls overlay */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 pointer-events-auto z-50 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-8 pt-24"
            >
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-white/70">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-24 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={skipBack}
                      disabled={currentTrack === 0}
                      className="text-white hover:text-white hover:bg-white/20 h-12 w-12 disabled:opacity-30"
                    >
                      <SkipBack className="h-7 w-7" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={togglePlay}
                      disabled={!tracks[currentTrack].url || (!isAudioReady && !isPlaying)}
                      className="h-16 w-16 rounded-full bg-white hover:bg-white/90 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-0.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={skipForward}
                      disabled={currentTrack === tracks.length - 1}
                      className="text-white hover:text-white hover:bg-white/20 h-12 w-12 disabled:opacity-30"
                    >
                      <SkipForward className="h-7 w-7" />
                    </Button>
                  </div>

                  <div className="w-32"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Normal player view */}
      {!isFullscreen && (
      <div className="bg-card/80 backdrop-blur-md border-2 border-border rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/10">
        {/* Visualizer */}
        <div className="relative h-64 md:h-96 bg-gradient-to-br from-cyan-900/20 to-fuchsia-900/20">
          <PsychedelicVisualizer 
            key="normal-visualizer"
            analyser={null} 
            isPlaying={isPlaying} 
            currentTrack={currentTrack}
            visualizationId={tracks[currentTrack]?.visualizationId}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <h3 className={`text-white/90 mb-2 ${isFullscreen ? 'text-4xl md:text-5xl' : ''}`}>{tracks[currentTrack].title}</h3>
              <p className={`text-white/60 ${isFullscreen ? 'text-2xl md:text-3xl' : ''}`}>{tracks[currentTrack].artist}</p>
              {tracks[currentTrack].album && (
                <p className={`text-white/50 mt-1 ${isFullscreen ? 'text-xl md:text-2xl' : 'text-sm'}`}>{tracks[currentTrack].album}</p>
              )}
            </div>
          </div>
        </div>

        {/* Controls - hidden in fullscreen */}
        {!isFullscreen && <div className="p-6 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between gap-6">
            {/* Volume Controls Group */}
            <div className="flex items-center gap-2 bg-background/40 rounded-lg px-3 py-2 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-cyan-400 hover:text-fuchsia-400 hover:bg-transparent hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all duration-300"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24 cursor-pointer"
              />
            </div>

            {/* Playback Controls Group */}
            <div className="flex items-center gap-2 bg-background/40 rounded-lg px-4 py-2 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={skipBack}
                disabled={currentTrack === 0}
                className="text-cyan-400 hover:text-fuchsia-400 hover:bg-transparent hover:shadow-lg hover:shadow-fuchsia-500/20 disabled:text-muted-foreground transition-all duration-300"
              >
                <SkipBack className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                onClick={togglePlay}
                disabled={!tracks[currentTrack].url || (!isAudioReady && !isPlaying)}
                className="h-12 w-12 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipForward}
                disabled={currentTrack === tracks.length - 1}
                className="text-cyan-400 hover:text-fuchsia-400 hover:bg-transparent hover:shadow-lg hover:shadow-fuchsia-500/20 disabled:text-muted-foreground transition-all duration-300"
              >
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>

            {/* View Controls Group */}
            <div className="flex items-center gap-2 bg-background/40 rounded-lg px-3 py-2 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-cyan-400 hover:text-fuchsia-400 hover:bg-transparent hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all duration-300"
                title="Enter fullscreen mode"
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPlaylist(!showPlaylist)}
                className="text-cyan-400 hover:text-fuchsia-400 hover:bg-transparent hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all duration-300"
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>}

        {/* Playlist - hidden in fullscreen */}
        {!isFullscreen && showPlaylist && (
          <div className="border-t border-border">
            <div className="p-4">
              <h4 className="mb-3 text-muted-foreground">Playlist</h4>
              <div className="space-y-1">
                {tracks.map((track, index) => (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={`w-full text-left p-3 rounded-md transition-colors ${
                      index === currentTrack
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{track.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {track.artist}
                          {track.album && ` • ${track.album}`}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground ml-4">{track.duration}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
}