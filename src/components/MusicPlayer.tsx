import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, List, Maximize, Minimize, X, Loader2, Radio, Tv } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { PsychedelicVisualizer } from './PsychedelicVisualizer';
import { useEditMode } from '../contexts/EditModeContext';
import { useDescentMode } from '../contexts/DescentModeContext';
import { usePlayback } from '../contexts/PlaybackContext';
import {
  useVizSensitivity,
  VIZ_SENSITIVITY_MAX,
  VIZ_SENSITIVITY_MIN,
} from '../contexts/VizSensitivityContext';
import { MusicPlayerEditDialog } from './MusicPlayerEditDialog';
import { DescentToggleButton } from './DescentModeToggle';
import { cn } from './ui/utils';
import {
  brandActiveAccentClass,
  brandControlClass,
  brandIconButtonClass,
  brandPrimaryButtonClass,
  brandSpinnerClass,
  brandVizSurfaceClass,
} from '../lib/brandClasses';
import { border, onDark, overlay, shadow } from '../lib/colors';
import { zIndex } from '../lib/layoutTokens';
import {
  playerAlbum,
  playerAlbumLarge,
  playerArtist,
  playerArtistLarge,
  playerTrackTitle,
  playerTrackTitleLarge,
} from '../lib/typography';
import { motion, AnimatePresence } from 'motion/react';

export function MusicPlayer() {
  const { isEditMode } = useEditMode();
  const { isDescentMode, descentSupported, toggleDescentMode } = useDescentMode();
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
    isHeroStage,
    analyser: analyserForViz,
    isAirPlayAvailable,
    isRemotePlaybackAvailable,
    isRemotePlaybackConnected,
    remotePlaybackDeviceName,
    showAirPlayPicker,
    showRemotePlaybackPicker,
  } = usePlayback();

  const { sensitivity, setSensitivity } = useVizSensitivity();

  const handleTogglePlay = () => {
    if (!currentTrackData?.url) {
      alert('No audio file uploaded for this track. Please upload an audio file in edit mode.');
      return;
    }
    togglePlay();
  };

  const canShowRemoteTargets = isAirPlayAvailable || isRemotePlaybackAvailable;

  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isVisualizerLoading, setIsVisualizerLoading] = useState(false);
  const [showFullscreenControls, setShowFullscreenControls] = useState(true);
  const showFullscreenControlsRef = useRef(showFullscreenControls);
  showFullscreenControlsRef.current = showFullscreenControls;
  const justShowedFromActivityRef = useRef(0);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);

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
            className={cn('fixed top-0 left-0 right-0 h-[100dvh] min-h-[100dvh] w-full cursor-pointer', zIndex.fullscreen, overlay.fullscreen)}
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
                  className={cn('absolute inset-0 flex items-center justify-center backdrop-blur-sm', zIndex.modal, overlay.scrim)}
                >
                  <div className="text-center space-y-4">
                    <Loader2 className={cn('h-12 w-12 animate-spin mx-auto', brandSpinnerClass)} />
                    <p className={cn(onDark.body, 'text-lg')}>Initializing visualization...</p>
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
                  className={cn('absolute inset-0 flex items-center justify-center', zIndex.modal, overlay.scrimLight)}
                >
                  <div className="text-center space-y-3">
                    <Loader2 className={cn('h-10 w-10 animate-spin mx-auto', brandSpinnerClass)} />
                    <p className={cn(onDark.secondary, 'text-sm')}>Buffering...</p>
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
                <div className={cn('rounded-full px-4 py-2 text-sm', overlay.pill, onDark.heading)}>
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
              className={cn('relative h-full w-full', brandVizSurfaceClass)}
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
                      <h3 className={cn(playerTrackTitleLarge, 'mb-2')}>{tracks[currentTrack].title}</h3>
                      <p className={playerArtistLarge}>{tracks[currentTrack].artist}</p>
                      {tracks[currentTrack].album && (
                        <p className={playerAlbumLarge}>{tracks[currentTrack].album}</p>
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
                className="absolute bottom-0 left-0 right-0 pointer-events-auto z-50 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-4 pt-16 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-24 sm:pb-8"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                  <div className={cn('flex justify-between text-sm', onDark.secondary)}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Primary: transport always centered and visible (mobile-first) */}
                <div className="flex items-center justify-center gap-3 sm:gap-4 py-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipBack}
                    disabled={currentTrack === 0}
                    className="text-white hover:text-white hover:bg-white/20 h-12 w-12 shrink-0 disabled:opacity-30"
                    aria-label="Previous track"
                  >
                    <SkipBack className="h-7 w-7" aria-hidden />
                  </Button>
                  <Button
                    size="icon"
                    onClick={handleTogglePlay}
                    disabled={!tracks[currentTrack]?.url || (!isAudioReady && !isPlaying)}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-white hover:bg-white/90 text-black disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden /> : <Play className="h-7 w-7 sm:h-8 sm:w-8 ml-0.5" aria-hidden />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={skipForward}
                    disabled={currentTrack === tracks.length - 1}
                    className="text-white hover:text-white hover:bg-white/20 h-12 w-12 shrink-0 disabled:opacity-30"
                    aria-label="Next track"
                  >
                    <SkipForward className="h-7 w-7" aria-hidden />
                  </Button>
                </div>

                {/* Secondary: volume, visualizer tuning, cast — below transport */}
                <div className="pt-2 border-t border-white/10 sm:border-white/5 sm:pt-3">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                    <div className="flex items-center gap-2 shrink-0 sm:max-w-[200px]">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className="text-white hover:text-white hover:bg-white/20 shrink-0"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
                      </Button>
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        className="flex-1 min-w-0 max-w-[10rem] sm:max-w-none sm:w-24 cursor-pointer"
                      />
                    </div>

                    <div className="flex-1 min-w-0 sm:max-w-md sm:mx-auto lg:mx-0">
                      <Label className={cn(onDark.secondary, 'text-xs block mb-1.5')}>Visualizer reactivity</Label>
                      <Slider
                        value={[sensitivity]}
                        min={VIZ_SENSITIVITY_MIN}
                        max={VIZ_SENSITIVITY_MAX}
                        step={0.05}
                        onValueChange={(v) => setSensitivity(v[0] ?? 1)}
                        className="cursor-pointer w-full"
                        aria-label="Visualizer reactivity"
                      />
                      <p className={cn(onDark.faint, 'text-[10px] mt-1 hidden sm:block')}>
                        Lower = calmer, less noise. Higher = snappier.
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 shrink-0 sm:justify-end sm:min-w-[5.5rem]">
                      {isAirPlayAvailable && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={showAirPlayPicker}
                          className="text-white hover:text-white hover:bg-white/20"
                          aria-label="Open AirPlay devices"
                          title="AirPlay"
                        >
                          <Radio className="h-5 w-5" aria-hidden />
                        </Button>
                      )}
                      {isRemotePlaybackAvailable && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void showRemotePlaybackPicker()}
                            className={`text-white hover:text-white hover:bg-white/20 ${isRemotePlaybackConnected ? 'bg-white/20' : ''}`}
                            aria-label={isRemotePlaybackConnected ? 'Casting connected' : 'Open cast devices'}
                            title={isRemotePlaybackConnected ? 'Casting connected' : 'Cast'}
                          >
                            <Tv className="h-5 w-5" aria-hidden />
                          </Button>
                          <AnimatePresence initial={false}>
                            {isRemotePlaybackConnected && (
                              <motion.span
                                key="fullscreen-cast-device"
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -4 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                className={cn('max-w-24 truncate text-[11px] hidden sm:inline', onDark.secondary)}
                              >
                                {remotePlaybackDeviceName ?? 'Connected'}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
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
                className={cn('fixed top-0 right-0 flex items-center gap-3 pointer-events-auto p-4 sm:p-6 rounded-bl-xl', zIndex.fullscreenChrome, overlay.chromeBar)}
                style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}
              >
                {descentSupported && !isDescentMode && (
                  <DescentToggleButton isDescentMode={isDescentMode} onClick={toggleDescentMode} />
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                  className={cn('h-10 w-10', brandControlClass)}
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
      <div className={cn('bg-card/80 backdrop-blur-md border-2 border-border rounded-lg overflow-hidden shadow-2xl', shadow.glowPurpleSm)}>
        {/* Visualizer */}
        <div className={cn('relative h-64 md:h-96', brandVizSurfaceClass)}>
          <AnimatePresence>
            {isBuffering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn('absolute inset-0 flex items-center justify-center z-10', overlay.scrimLight)}
              >
                <div className="text-center space-y-2">
                  <Loader2 className={cn('h-8 w-8 animate-spin mx-auto', brandSpinnerClass)} />
                  <p className={cn(onDark.secondary, 'text-sm')}>Buffering...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {isHeroStage ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-void/90 px-6 text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-signal-purple-bright/90">
                Hero Stage
              </p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Visualizer is live at the top. Use the now playing bar for transport and tracks.
              </p>
            </div>
          ) : (
          <PsychedelicVisualizer 
            key={`normal-viz-${currentTrack}-${tracks[currentTrack]?.visualizationId ?? 0}`}
            analyser={analyserForViz} 
            isPlaying={isPlaying} 
            currentTrack={currentTrack}
            visualizationId={tracks[currentTrack]?.visualizationId}
          />
          )}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <h3 className={cn(isFullscreen ? playerTrackTitleLarge : playerTrackTitle, 'mb-2')}>
                {tracks[currentTrack].title}
              </h3>
              <p className={isFullscreen ? playerArtistLarge : playerArtist}>
                {tracks[currentTrack].artist}
              </p>
              {tracks[currentTrack].album && (
                <p className={isFullscreen ? playerAlbumLarge : playerAlbum}>
                  {tracks[currentTrack].album}
                </p>
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

          {/* Mobile: transport on top; md+: [volume+viz] [transport] [view] */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-x-6 md:gap-y-3">
            {/* Playback — first on mobile; centered column on desktop */}
            <div className="flex justify-center md:col-start-2 md:row-start-1">
              <div className="flex items-center gap-2 bg-background/40 rounded-lg px-4 py-2 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipBack}
                  disabled={currentTrack === 0}
                  className={cn(brandIconButtonClass)}
                  aria-label="Previous track"
                >
                  <SkipBack className="h-6 w-6" aria-hidden />
                </Button>
                <Button
                  size="icon"
                  onClick={handleTogglePlay}
                  disabled={!tracks[currentTrack].url || (!isAudioReady && !isPlaying)}
                  className={cn(
                    'h-12 w-12 rounded-full disabled:opacity-50 disabled:cursor-not-allowed',
                    brandPrimaryButtonClass
                  )}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="h-6 w-6" aria-hidden /> : <Play className="h-6 w-6 ml-0.5" aria-hidden />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipForward}
                  disabled={currentTrack === tracks.length - 1}
                  className={cn(brandIconButtonClass)}
                  aria-label="Next track"
                >
                  <SkipForward className="h-6 w-6" aria-hidden />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch md:col-start-1 md:row-start-1 min-w-0">
              <div className="flex flex-1 min-w-0 items-center gap-2 bg-background/40 rounded-lg px-3 py-2 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className={cn(brandIconButtonClass, 'shrink-0')}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="flex-1 min-w-0 cursor-pointer"
                />
              </div>

              <div className="flex flex-1 min-w-0 flex-col gap-1.5 bg-background/40 rounded-lg px-3 py-2 backdrop-blur-sm sm:max-w-xs">
                <Label className="text-xs text-muted-foreground">Visualizer reactivity</Label>
                <Slider
                  value={[sensitivity]}
                  min={VIZ_SENSITIVITY_MIN}
                  max={VIZ_SENSITIVITY_MAX}
                  step={0.05}
                  onValueChange={(v) => setSensitivity(v[0] ?? 1)}
                  className="cursor-pointer w-full"
                  aria-label="Visualizer reactivity"
                />
                <p className="text-[10px] text-muted-foreground leading-snug hidden sm:block">
                  Lower = calmer, less noise
                </p>
              </div>
            </div>

            <div className="flex w-full justify-center md:justify-end md:col-start-3 md:row-start-1 shrink-0">
              <div className="flex items-center justify-center gap-2 bg-background/40 rounded-lg px-3 py-2 backdrop-blur-sm">
              {canShowRemoteTargets && (
                <>
                  {isAirPlayAvailable && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={showAirPlayPicker}
                      className={cn(brandIconButtonClass)}
                      aria-label="Open AirPlay devices"
                      title="AirPlay"
                    >
                      <Radio className="h-5 w-5" aria-hidden />
                    </Button>
                  )}
                  {isRemotePlaybackAvailable && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => void showRemotePlaybackPicker()}
                        className={cn(
                          brandIconButtonClass,
                          isRemotePlaybackConnected && brandActiveAccentClass
                        )}
                        aria-label={isRemotePlaybackConnected ? 'Casting connected' : 'Open cast devices'}
                        title={isRemotePlaybackConnected ? 'Casting connected' : 'Cast'}
                      >
                        <Tv className="h-5 w-5" aria-hidden />
                      </Button>
                      <AnimatePresence initial={false}>
                        {isRemotePlaybackConnected && (
                          <motion.span
                            key="normal-cast-device"
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -4 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="max-w-28 truncate text-xs text-signal-purple-bright/80"
                          >
                            {remotePlaybackDeviceName ?? 'Connected'}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className={cn(brandIconButtonClass)}
                title="Enter fullscreen mode"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" aria-hidden /> : <Maximize className="h-5 w-5" aria-hidden />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={cn(brandIconButtonClass)}
                aria-label={showPlaylist ? 'Hide playlist' : 'Show playlist'}
              >
                <List className="h-5 w-5" aria-hidden />
              </Button>
              </div>
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