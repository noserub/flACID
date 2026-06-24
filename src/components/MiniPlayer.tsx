import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { ListMusic } from 'lucide-react';
import { usePlayback } from '../contexts/PlaybackContext';
import { useDescentMode } from '../contexts/DescentModeContext';
import { DESCENT_CHROME_LIFT } from '../lib/descentContentLayer';
import { cn } from './ui/utils';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { MiniPlayerChip } from './MiniPlayerChip';
import {
  useVizSensitivity,
  VIZ_SENSITIVITY_MAX,
  VIZ_SENSITIVITY_MIN,
} from '../contexts/VizSensitivityContext';
import { motion, AnimatePresence } from 'motion/react';

export type { MiniPlayerDock } from './MiniPlayerChip';

function useLargeScreen() {
  const [large, setLarge] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setLarge(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return large;
}

interface PanelAnchor {
  top: number;
  left: number;
  width: number;
  bottom: number;
}

function NowPlayingPanel({
  open,
  onClose,
  anchor,
  openAbove,
  isLargeScreen,
  tracks,
  currentTrack,
  selectTrack,
  currentTime,
  duration,
  handleSeek,
  formatTime,
  isDescentMode,
  showVizControls,
  excludeRef,
}: {
  open: boolean;
  onClose: () => void;
  anchor: PanelAnchor | null;
  openAbove: boolean;
  isLargeScreen: boolean;
  isDescentMode: boolean;
  showVizControls: boolean;
  excludeRef: RefObject<HTMLElement | null>;
  tracks: ReturnType<typeof usePlayback>['tracks'];
  currentTrack: number;
  selectTrack: (index: number) => void;
  currentTime: number;
  duration: number;
  handleSeek: (value: number[]) => void;
  formatTime: (time: number) => string;
}) {
  const { sensitivity, setSensitivity } = useVizSensitivity();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (excludeRef.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open, onClose, excludeRef]);

  if (typeof document === 'undefined' || !open) return null;

  const panelZ = isDescentMode ? DESCENT_CHROME_LIFT : 'z-[52]';

  const panelMaxHeight = (): number | undefined => {
    if (typeof window === 'undefined' || !anchor) return undefined;
    if (openAbove) {
      return Math.max(200, anchor.top - 12);
    }
    return Math.max(200, window.innerHeight - anchor.bottom - 16);
  };

  const panelStyle = (): CSSProperties => {
    const maxHeight = panelMaxHeight();
    if (!anchor) {
      return {
        bottom: 'calc(var(--mobile-mini-player-bottom) + var(--mobile-player-strip-height) + 0.5rem)',
      };
    }
    if (openAbove) {
      return {
        bottom: `${window.innerHeight - anchor.top + 8}px`,
        left: Math.max(8, anchor.left),
        width: Math.min(Math.max(anchor.width, 320), window.innerWidth - 16),
        maxHeight,
      };
    }
    return {
      top: anchor.bottom + 8,
      left: Math.max(8, anchor.left),
      width: Math.min(Math.max(anchor.width, 320), window.innerWidth - 16),
      maxHeight,
    };
  };

  const panel = (
    <AnimatePresence>
      {open && (
          <motion.div
            ref={panelRef}
            key="now-playing-panel"
            role="dialog"
            aria-label="Now playing"
            aria-modal="true"
            initial={{ opacity: 0, y: openAbove ? 10 : isLargeScreen ? -6 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: openAbove ? 10 : isLargeScreen ? -6 : 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed flex flex-col overflow-hidden rounded-xl border border-signal-purple/25',
              'bg-background shadow-xl shadow-black/30',
              panelZ,
              !anchor && 'left-2 right-2 max-h-[min(28rem,62vh)] rounded-2xl'
            )}
            style={panelStyle()}
          >
            <div className="shrink-0 z-10 border-b border-signal-purple/10 bg-background px-4 pt-3 pb-3 space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <ListMusic className="h-3.5 w-3.5" aria-hidden />
                Now playing
              </div>
              <div className="px-0.5 py-2">
                <Slider
                  value={[currentTime]}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {showVizControls && (
              <div className="shrink-0 z-10 border-b border-signal-purple/10 bg-background px-4 pt-3 pb-3 space-y-2">
                <Label className="text-xs text-muted-foreground">Visualizer reactivity</Label>
                <div className="px-0.5 py-2">
                  <Slider
                    value={[sensitivity]}
                    min={VIZ_SENSITIVITY_MIN}
                    max={VIZ_SENSITIVITY_MAX}
                    step={0.05}
                    onValueChange={(v) => setSensitivity(v[0] ?? 1)}
                    className="cursor-pointer w-full"
                    aria-label="Visualizer reactivity"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  Lower = calmer, less noise. Higher = snappier motion.
                </p>
              </div>
            )}

            <div className="relative z-0 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 space-y-0.5 touch-pan-y">
              {tracks.map((track, index) => {
                const isActive = index === currentTrack;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => {
                      selectTrack(index);
                      onClose();
                    }}
                    className={cn(
                      'w-full text-left rounded-lg px-3 text-sm transition-colors',
                      !isLargeScreen ? 'min-h-11 py-3' : 'py-2',
                      isActive
                        ? 'bg-signal-purple/20 text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <span className="font-medium truncate block">{track.title}</span>
                    <span className="text-xs opacity-70 truncate block">
                      {track.album || track.artist}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(panel, document.body);
}

export function MiniPlayer({ dock = 'chrome' }: { dock?: MiniPlayerDock }) {
  const {
    tracks,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    currentTrackData,
    togglePlay,
    playFromHero,
    skipForward,
    skipBack,
    selectTrack,
    handleSeek,
    formatTime,
    isFullscreen,
    isHeroStage,
    heroInView,
  } = usePlayback();
  const { isDescentMode } = useDescentMode();
  const isLargeScreen = useLargeScreen();
  const chipRef = useRef<HTMLDivElement>(null);
  const [playerInView, setPlayerInView] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelAnchor, setPanelAnchor] = useState<PanelAnchor | null>(null);

  const isHeroDock = dock === 'hero';

  const handlePlayPause = () => {
    if (isPlaying) {
      togglePlay();
      return;
    }
    if (isHeroDock) {
      playFromHero();
      return;
    }
    togglePlay();
  };

  const updatePanelAnchor = useCallback(() => {
    const el = chipRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPanelAnchor({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      bottom: rect.bottom,
    });
  }, []);

  useLayoutEffect(() => {
    if (!panelOpen) return;
    updatePanelAnchor();
    window.addEventListener('resize', updatePanelAnchor);
    window.addEventListener('scroll', updatePanelAnchor, true);
    return () => {
      window.removeEventListener('resize', updatePanelAnchor);
      window.removeEventListener('scroll', updatePanelAnchor, true);
    };
  }, [panelOpen, updatePanelAnchor]);

  /** Keep panel pinned while open (hero layout + page scroll). */
  useEffect(() => {
    if (!panelOpen) return;
    let frame = 0;
    const sync = () => {
      updatePanelAnchor();
      frame = requestAnimationFrame(sync);
    };
    frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  }, [panelOpen, updatePanelAnchor]);

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panelOpen]);

  useEffect(() => {
    if (isHeroDock) return;
    let io: IntersectionObserver | null = null;
    const attach = (el: Element) => {
      io = new IntersectionObserver(
        ([entry]) => setPlayerInView(entry?.isIntersecting ?? false),
        { threshold: 0, rootMargin: '-100px 0px 0px 0px' }
      );
      io.observe(el);
    };
    const el = document.getElementById('music-player');
    if (el) {
      attach(el);
      return () => io?.disconnect();
    }
    const id = setInterval(() => {
      const target = document.getElementById('music-player');
      if (target) {
        clearInterval(id);
        attach(target);
      }
    }, 400);
    return () => {
      clearInterval(id);
      io?.disconnect();
    };
  }, [isHeroDock]);

  /** Hero dock is mounted by HeroSection — always show when tracks exist (no heroInView gate). */
  const showHero =
    isHeroDock &&
    tracks.length > 0 &&
    currentTrackData &&
    !isFullscreen;

  const showChrome =
    !isHeroDock &&
    !heroInView &&
    tracks.length > 0 &&
    currentTrackData &&
    !isFullscreen &&
    (isPlaying || !playerInView);

  useEffect(() => {
    if (isHeroDock || isLargeScreen || !showChrome) {
      delete document.documentElement.dataset.mobileChromePlayer;
      return;
    }
    document.documentElement.dataset.mobileChromePlayer = 'visible';
    return () => {
      delete document.documentElement.dataset.mobileChromePlayer;
    };
  }, [isHeroDock, isLargeScreen, showChrome]);

  if (!showHero && !showChrome) return null;

  const showVizControls = isHeroDock || isHeroStage;

  const chip = (
    <MiniPlayerChip
      ref={chipRef}
      dock={isHeroDock ? 'hero' : 'chrome'}
      title={currentTrackData.title}
      subtitle={currentTrackData.album || currentTrackData.artist}
      isPlaying={isPlaying}
      panelOpen={panelOpen}
      canPlay={!!currentTrackData?.url}
      canSkipBack={currentTrack > 0}
      canSkipForward={currentTrack < tracks.length - 1}
      currentTime={currentTime}
      duration={duration}
      onPlayPause={handlePlayPause}
      onSkipBack={skipBack}
      onSkipForward={skipForward}
      onTogglePanel={() => setPanelOpen((o) => !o)}
      layout={isHeroDock}
      panelActive={panelOpen}
      animated
      isLargeScreen={isLargeScreen}
      className={cn(
        !isHeroDock &&
          !isLargeScreen &&
          cn(
            'fixed inset-x-0 !min-w-0 !max-w-none w-full',
            isDescentMode ? DESCENT_CHROME_LIFT : 'z-[45]'
          )
      )}
      style={
        !isHeroDock && !isLargeScreen
          ? { bottom: 'var(--mobile-mini-player-bottom)' }
          : undefined
      }
    />
  );

  const panel = (
      <NowPlayingPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        anchor={panelAnchor}
        openAbove={isHeroDock || !isLargeScreen}
        isLargeScreen={isLargeScreen}
        tracks={tracks}
        currentTrack={currentTrack}
        selectTrack={selectTrack}
        currentTime={currentTime}
        duration={duration}
        handleSeek={handleSeek}
        formatTime={formatTime}
        isDescentMode={isDescentMode}
        showVizControls={showVizControls}
        excludeRef={chipRef}
      />
  );

  if (showChrome && !isLargeScreen && typeof document !== 'undefined') {
    return (
      <>
        {createPortal(chip, document.body)}
        {panel}
      </>
    );
  }

  return (
    <>
      {chip}
      {panel}
    </>
  );
}
