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
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover';
import { cn } from './ui/utils';
import { DESCENT_MENU_PORTAL_LIFT } from '../lib/descentContentLayer';
import { TRY_DESCENT_CLICKED_EVENT } from '../lib/descentHelp';
import { registerAudioContext } from '../lib/audioContextManager';
import { motion, AnimatePresence } from 'motion/react';

/** Shared AudioContext so analyser stays valid across StrictMode remounts */
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
  const [showPlayHint, setShowPlayHint] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(true);
  const showFullscreenControlsRef = useRef(showFullscreenControls);
  showFullscreenControlsRef.current = showFullscreenControls;
  const justShowedFromActivityRef = useRef(0);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioNode | null>(null);
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
    registerAudioContext(ctx);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    return () => {
      try {
        if (analyserRef.current) analyserRef.current.disconnect();
      } catch (_) {}
      registerAudioContext(null);
    };
  }, []);

  // Analysis via captureStream so <audio> keeps default output. createMediaElementSource hijacks
  // the element to Web Audio only — that required a second <audio> for tab background and caused Chrome handoff stutter.
  useEffect(() => {
    const audio = audioRef?.current;
    const url = currentTrackData?.url?.trim();
    if (!audio || !url || !analyserRef.current || !audioContextRef.current) {
      setAnalyserForViz(null);
      return;
    }
    const ctx = audioContextRef.current;
    const analyser = analyserRef.current;

    if (typeof audio.captureStream !== 'function') {
      setAnalyserForViz(null);
      return;
    }

    let stream: MediaStream;
    try {
      stream = audio.captureStream();
    } catch {
      setAnalyserForViz(null);
      return;
    }

    const source = ctx.createMediaStreamSource(stream);
    const silentGain = ctx.createGain();
    silentGain.gain.value = 0;
    try {
      source.connect(analyser);
      analyser.connect(silentGain);
      silentGain.connect(ctx.destination);
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      try {
        source.disconnect();
      } catch {
        /* ignore */
      }
      setAnalyserForViz(null);
      return;
    }
    sourceRef.current = source;
    setAnalyserForViz(analyser);

    return () => {
      try {
        stream.getTracks().forEach((t) => t.stop());
        source.disconnect();
        silentGain.disconnect();
        analyser.disconnect();
      } catch {
        /* ignore */
      }
      sourceRef.current = null;
    };
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

  // Auto-hide fullscreen controls after 3s inactivity — only when playing (keep visible if paused so user can hit play)
  useEffect(() => {
    if (!isFullscreen) return;

    const AUTO_HIDE_MS = 3000;
    let timeoutId: number | null = null;

    const scheduleHide = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setShowFullscreenControls(false);
        timeoutId = null;
      }, AUTO_HIDE_MS);
    };

    const cancelHide = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const handleActivity = () => {
      const wasHidden = !showFullscreenControlsRef.current;
      setShowFullscreenControls(true);
      if (isPlaying) scheduleHide();
      if (wasHidden) {
        justShowedFromActivityRef.current = Date.now();
      }
    };

    if (isPlaying && showFullscreenControls) {
      scheduleHide();
    } else {
      cancelHide();
    }

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('touchmove', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('touchmove', handleActivity);
      cancelHide();
    };
  }, [isFullscreen, isPlaying, showFullscreenControls]);

  // Fullscreen functionality with loading state (isFullscreen lives in PlaybackContext for mini player visibility)
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsVisualizerLoading(true);
      setShowFullscreenControls(true);
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

  // Listen for "Try Descend" click — show play hint in fullscreen
  useEffect(() => {
    const handler = () => setShowPlayHint(true);
    window.addEventListener(TRY_DESCENT_CLICKED_EVENT, handler);
    return () => window.removeEventListener(TRY_DESCENT_CLICKED_EVENT, handler);
  }, []);

  // Auto-dismiss play hint after 5 seconds
  useEffect(() => {
    if (!showPlayHint || !isFullscreen) return;
    const id = window.setTimeout(() => setShowPlayHint(false), 5000);
    return () => window.clearTimeout(id);
  }, [showPlayHint, isFullscreen]);

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
            className="fixed inset-0 z-[9980] bg-black cursor-pointer"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              // Ignore click if we just showed from touchstart (avoids show-then-immediate-hide)
              if (Date.now() - justShowedFromActivityRef.current < 300) return;
              setShowFullscreenControls((v) => !v);
            }}
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

            {/* Buffering indicator */}
            <AnimatePresence>
              {isBuffering && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 flex items-center justify-center z-[59] bg-black/30"
                >
                  <div className="text-center space-y-3">
                    <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mx-auto" />
                    <p className="text-white/70 text-sm">Buffering...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Swipe indicator (visible during swipe, hidden when controls hidden) */}
            <AnimatePresence>
              {showFullscreenControls && touchStartY !== null && touchCurrentY !== null && (
              <motion.div
                key="swipe-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: Math.min((touchCurrentY - touchStartY) / 100, 0.6) }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[55] pointer-events-none"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm">
                  Swipe down to exit
                </div>
              </motion.div>
            )}
            </AnimatePresence>

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
              <AnimatePresence>
                {showFullscreenControls && (
                  <motion.div
                    key="fullscreen-track-info"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <motion.div
                      initial={{ y: 8 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.05, duration: 0.3 }}
                      className="text-center"
                    >
                      <h3 className="text-white/90 mb-2 text-4xl md:text-5xl">{tracks[currentTrack].title}</h3>
                      <p className="text-white/60 text-2xl md:text-3xl">{tracks[currentTrack].artist}</p>
                      {tracks[currentTrack].album && (
                        <p className="text-white/50 mt-1 text-xl md:text-2xl">{tracks[currentTrack].album}</p>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Fullscreen controls overlay — tap/click elsewhere to hide for recording */}
            <AnimatePresence>
              {showFullscreenControls && (
              <motion.div
                key="fullscreen-bottom-controls"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute bottom-0 left-0 right-0 pointer-events-auto z-50 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-8 pt-24"
                onClick={(e) => e.stopPropagation()}
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
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
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
                      aria-label="Previous track"
                    >
                      <SkipBack className="h-7 w-7" aria-hidden />
                    </Button>
                    <Popover
                      open={showPlayHint && !isPlaying}
                      onOpenChange={(open) => !open && setShowPlayHint(false)}
                    >
                      <PopoverAnchor asChild>
                        <Button
                          size="icon"
                          onClick={() => {
                            setShowPlayHint(false);
                            handleTogglePlay();
                          }}
                          disabled={!tracks[currentTrack]?.url || (!isAudioReady && !isPlaying)}
                          className="h-16 w-16 rounded-full bg-white hover:bg-white/90 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? <Pause className="h-8 w-8" aria-hidden /> : <Play className="h-8 w-8 ml-0.5" aria-hidden />}
                        </Button>
                      </PopoverAnchor>
                      <PopoverContent
                        side="top"
                        align="center"
                        sideOffset={12}
                        collisionPadding={16}
                        className={cn(
                          DESCENT_MENU_PORTAL_LIFT,
                          'rounded-lg border border-cyan-500/30 bg-background/95 backdrop-blur-md shadow-xl shadow-fuchsia-950/20 p-4 text-sm text-foreground'
                        )}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        <div className="space-y-3">
                          <p className="text-cyan-100">Play music for the full experience</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="border border-cyan-500/25 text-cyan-200/90 hover:bg-cyan-500/10 hover:text-cyan-100"
                            onClick={() => setShowPlayHint(false)}
                          >
                            Got it
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={skipForward}
                      disabled={currentTrack === tracks.length - 1}
                      className="text-white hover:text-white hover:bg-white/20 h-12 w-12 disabled:opacity-30"
                      aria-label="Next track"
                    >
                      <SkipForward className="h-7 w-7" aria-hidden />
                    </Button>
                  </div>

                  <div className="w-32"></div>
                </div>
              </div>
              </motion.div>
              )}
            </AnimatePresence>
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
          <AnimatePresence>
            {showFullscreenControls && (
              <motion.div
                key="fullscreen-ascend-x"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
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
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* Normal player view */}
      {!isFullscreen && (
      <div className="bg-card/80 backdrop-blur-md border-2 border-border rounded-lg overflow-hidden shadow-2xl shadow-cyan-500/10">
        {/* Visualizer */}
        <div className="relative h-64 md:h-96 bg-gradient-to-br from-cyan-900/20 to-fuchsia-900/20">
          <AnimatePresence>
            {isBuffering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center z-10 bg-black/20"
              >
                <div className="text-center space-y-2">
                  <Loader2 className="h-8 w-8 text-cyan-400 animate-spin mx-auto" />
                  <p className="text-white/70 text-sm">Buffering...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
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
                aria-label="Previous track"
              >
                <SkipBack className="h-6 w-6" aria-hidden />
              </Button>
              <Button
                size="icon"
                onClick={handleTogglePlay}
                disabled={!tracks[currentTrack].url || (!isAudioReady && !isPlaying)}
                className="h-12 w-12 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="h-6 w-6" aria-hidden /> : <Play className="h-6 w-6 ml-0.5" aria-hidden />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={skipForward}
                disabled={currentTrack === tracks.length - 1}
                className="text-cyan-400 hover:text-fuchsia-400 hover:bg-transparent hover:shadow-lg hover:shadow-fuchsia-500/20 disabled:text-muted-foreground transition-all duration-300"
                aria-label="Next track"
              >
                <SkipForward className="h-6 w-6" aria-hidden />
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
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" aria-hidden /> : <Maximize className="h-5 w-5" aria-hidden />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPlaylist(!showPlaylist)}
                className="text-cyan-400 hover:text-fuchsia-400 hover:bg-transparent hover:shadow-lg hover:shadow-fuchsia-500/20 transition-all duration-300"
                aria-label={showPlaylist ? 'Hide playlist' : 'Show playlist'}
              >
                <List className="h-5 w-5" aria-hidden />
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