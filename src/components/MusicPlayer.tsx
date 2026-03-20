import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, List, Maximize, Minimize, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { PsychedelicVisualizer } from './PsychedelicVisualizer';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentMode } from '../contexts/DescentModeContext';
import { useDescentIntensity } from '../contexts/DescentIntensityContext';
import { usePlayback } from '../contexts/PlaybackContext';
import { MusicPlayerEditDialog } from './MusicPlayerEditDialog';
import { DescentToggleButton } from './DescentModeToggle';
import { motion, AnimatePresence } from 'motion/react';

/** One MediaElementSourceNode per HTMLMediaElement — persists across StrictMode remounts */
const audioSourceByElement = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
/** Shared AudioContext so source stays valid across StrictMode remounts */
let sharedAudioContext: AudioContext | null = null;

export function MusicPlayer() {
  const { isEditMode } = useEditMode();
  const { isDescentMode, toggleDescentMode } = useDescentMode();
  const { registerAnalyser, registerPlaybackState } = useDescentIntensity();
  const {
    tracks,
    currentTrack,
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
    isFullscreen,
    setIsFullscreen,
  } = usePlayback();

  const handleTogglePlay = () => {
    if (!currentTrackData?.url) {
      alert('No audio file uploaded for this track. Please upload an audio file in edit mode.');
      return;
    }
    togglePlay();
  };

  const [showPlaylist, setShowPlaylist] = useState(true);
  const [isVisualizerLoading, setIsVisualizerLoading] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [analyserForViz, setAnalyserForViz] = useState<AnalyserNode | null>(null);

  // AudioContext/analyser for visualizer + DescentIntensity (shared so source stays valid)
  useEffect(() => {
    if (audioContextRef.current && analyserRef.current) return;
    const AudioContextConstructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    const ctx = sharedAudioContext && sharedAudioContext.state !== 'closed'
      ? sharedAudioContext
      : new AudioContextConstructor();
    sharedAudioContext = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    return () => {
      try {
        if (analyserRef.current) analyserRef.current.disconnect();
      } catch (_) {}
    };
  }, []);

  // Connect analyser to audio element for real music reactivity (Descend + visualizer).
  // createMediaElementSource can only be called ONCE per element — reuse via WeakMap.
  useEffect(() => {
    const audio = audioRef?.current;
    const url = currentTrackData?.url?.trim();
    if (!audio || !url || !analyserRef.current || !audioContextRef.current) {
      setAnalyserForViz(null);
      return;
    }
    const ctx = audioContextRef.current;
    const analyser = analyserRef.current;
    let source = audioSourceByElement.get(audio);
    const isNewSource = !source;
    if (!source) {
      try {
        source = ctx.createMediaElementSource(audio);
        audioSourceByElement.set(audio, source);
      } catch {
        setAnalyserForViz(analyser);
        return;
      }
    }
    if (isNewSource || !sourceRef.current) {
      try {
        source.connect(analyser);
        analyser.connect(ctx.destination);
      } catch {
        setAnalyserForViz(analyser);
        return;
      }
    }
    sourceRef.current = source;
    setAnalyserForViz(analyser);
  }, [audioRef, currentTrackData?.url, isAudioReady]);

  // Resume AudioContext on first play (browser autoplay policy)
  useEffect(() => {
    if (isPlaying && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [isPlaying]);

  useEffect(() => {
    registerAnalyser(analyserForViz ?? analyserRef.current, isPlaying);
  }, [isPlaying, registerAnalyser, analyserForViz]);

  useEffect(() => {
    registerPlaybackState(currentTime, currentTrack);
  }, [currentTime, currentTrack, registerPlaybackState]);

  // Fullscreen functionality with loading state (isFullscreen lives in PlaybackContext for mini player visibility)
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsVisualizerLoading(true);
      setIsFullscreen(true);
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

  if (!tracks || tracks.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto relative z-0">
        {isEditMode && <MusicPlayerEditDialog />}
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">No tracks available. {isEditMode && 'Click "Edit Tracks" to add music.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto relative z-0">
        {isEditMode && <MusicPlayerEditDialog />}
        {/* Portal fullscreen to app root (last sibling of sections) so it paints above z-0 sections; stays in #root so Descend 9990+ remains on top */}
      {typeof document !== 'undefined' &&
        (() => {
          const portalRoot = document.getElementById('fullscreen-portal-root');
          return portalRoot
            ? createPortal(
          <AnimatePresence mode="sync">
            {isFullscreen && (
          <motion.div
            key="music-fullscreen-shell"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9980] bg-black"
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
              key="music-fullscreen-viz"
              initial={false}
              animate={{
                scale: 1,
                opacity: 1,
                y:
                  touchStartY !== null && touchCurrentY !== null
                    ? Math.max(0, touchCurrentY - touchStartY) * 0.5
                    : 0,
              }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative h-full w-full bg-gradient-to-br from-cyan-900/20 to-fuchsia-900/20"
            >
              <PsychedelicVisualizer 
                key={`fullscreen-viz-${currentTrack}-${tracks[currentTrack]?.visualizationId ?? 0}`}
                analyser={analyserForViz}
                isPlaying={isPlaying} 
                currentTrack={currentTrack}
                visualizationId={tracks[currentTrack]?.visualizationId}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  initial={false}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.35 }}
                  className="text-center"
                >
                  <h3 className="text-white/90 mb-2 text-4xl md:text-5xl">{tracks[currentTrack].title}</h3>
                  <p className="text-white/60 text-2xl md:text-3xl">{tracks[currentTrack].artist}</p>
                  {tracks[currentTrack].album && (
                    <p className="text-white/50 mt-1 text-xl md:text-2xl">{tracks[currentTrack].album}</p>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Fullscreen controls overlay */}
            <motion.div
              initial={false}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.35, ease: 'easeOut' }}
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
                      onClick={handleTogglePlay}
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
          </AnimatePresence>,
                portalRoot
              )
            : null;
        })()}

        {/* Ascend + X portaled to document.body so they sit above Descend (9990+) and any stacking context */}
      {typeof document !== 'undefined' && isFullscreen &&
        createPortal(
          <div
            className="fixed top-0 right-0 z-[10100] flex items-center gap-3 pointer-events-auto p-4 sm:p-6 bg-black/60 backdrop-blur-md rounded-bl-xl"
            style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}
          >
            <DescentToggleButton isDescentMode={isDescentMode} onClick={toggleDescentMode} />
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="h-10 w-10 bg-background/80 text-cyan-400 border border-cyan-400/30 hover:border-fuchsia-400/50 hover:text-fuchsia-400 hover:bg-transparent hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all duration-300"
              aria-label="Exit fullscreen"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>,
          document.body
        )}

      {/* Normal player view */}
      {!isFullscreen && (
      <div className="bg-card/80 backdrop-blur-md border-2 border-border rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/10">
        {/* Visualizer */}
        <div className="relative h-64 md:h-96 bg-gradient-to-br from-cyan-900/20 to-fuchsia-900/20">
          <PsychedelicVisualizer 
            key={`normal-viz-${currentTrack}-${tracks[currentTrack]?.visualizationId ?? 0}`}
            analyser={analyserForViz} 
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

          {/* Playback Controls - wrap on mobile so fullscreen/playlist stay visible */}
          <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
            {/* Volume Controls Group */}
            <div className="flex flex-shrink-0 items-center gap-2 bg-background/40 rounded-lg px-3 py-2 backdrop-blur-sm">
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
                className="w-16 sm:w-24 cursor-pointer"
              />
            </div>

            {/* Playback Controls Group */}
            <div className="flex flex-shrink-0 items-center gap-2 bg-background/40 rounded-lg px-4 py-2 backdrop-blur-sm">
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
                onClick={handleTogglePlay}
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
            <div className="flex w-full flex-shrink-0 basis-full items-center justify-center gap-2 sm:w-auto sm:basis-auto bg-background/40 rounded-lg px-3 py-2 backdrop-blur-sm">
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