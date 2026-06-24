import { forwardRef, type Ref } from 'react';
import { ChevronDown, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { cn } from './ui/utils';
import {
  miniPlayerChipChromeClass,
  miniPlayerChipChromeMobileClass,
  miniPlayerChipHeroClass,
  miniPlayerChipWidthClass,
  miniPlayerChipHeightClass,
  miniPlayerChipRowClass,
  miniPlayerTransportDividerChrome,
  miniPlayerTransportDividerHero,
  miniPlayerTransportPadClass,
  miniPlayerMetaButtonClass,
  miniPlayerTransportTouchClass,
} from '../lib/miniPlayerStyles';
import {
  miniPlayerMeta,
  miniPlayerMetaOnDark,
  miniPlayerTitle,
  miniPlayerTitleOnDark,
} from '../lib/typography';

export type MiniPlayerDock = 'hero' | 'chrome';

export interface MiniPlayerChipProps {
  dock: MiniPlayerDock;
  title: string;
  subtitle: string;
  isPlaying: boolean;
  panelOpen: boolean;
  canPlay: boolean;
  canSkipBack: boolean;
  canSkipForward: boolean;
  currentTime?: number;
  duration?: number;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onTogglePanel: () => void;
  layout?: boolean;
  panelActive?: boolean;
  animated?: boolean;
  isLargeScreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const MiniPlayerChip = forwardRef(function MiniPlayerChip(
  {
    dock,
    title,
    subtitle,
    isPlaying,
    panelOpen,
    canPlay,
    canSkipBack,
    canSkipForward,
    currentTime = 0,
    duration = 0,
    onPlayPause,
    onSkipBack,
    onSkipForward,
    onTogglePanel,
    layout = false,
    panelActive = false,
    animated = false,
    isLargeScreen = false,
    className,
    style,
  }: MiniPlayerChipProps,
  ref: Ref<HTMLDivElement>
) {
  const isHeroDock = dock === 'hero';
  const isMobileChrome = !isHeroDock && !isLargeScreen;
  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const skipButtonClass = cn(
    'rounded-md',
    isMobileChrome
      ? cn(miniPlayerTransportTouchClass, 'size-11')
      : 'hidden size-8 sm:inline-flex'
  );

  const playButtonClass = cn(
    'rounded-full shrink-0',
    isMobileChrome ? cn(miniPlayerTransportTouchClass, 'size-11') : 'size-9'
  );

  return (
    <motion.div
      ref={ref}
      layout={layout}
      initial={animated ? { opacity: 0, y: isHeroDock ? 12 : isLargeScreen ? -8 : 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        layout: layout ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] } : undefined,
      }}
      className={cn(
        'mx-auto flex items-stretch overflow-hidden shadow-lg',
        isMobileChrome
          ? cn('flex-col', miniPlayerChipChromeMobileClass)
          : cn(
              'rounded-xl',
              miniPlayerChipHeightClass,
              miniPlayerChipWidthClass,
              isHeroDock ? miniPlayerChipHeroClass : miniPlayerChipChromeClass
            ),
        panelActive && isHeroDock && 'relative z-[48]',
        className
      )}
      style={style}
    >
      <div
        className={cn(
          'flex w-full items-center',
          isMobileChrome ? 'min-h-[3.75rem] py-2' : miniPlayerChipRowClass
        )}
      >
        <div
          className={cn(
            'flex h-full shrink-0 items-center gap-0.5',
            miniPlayerTransportPadClass,
            isHeroDock ? miniPlayerTransportDividerHero : miniPlayerTransportDividerChrome
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onSkipBack}
            disabled={!canSkipBack}
            className={skipButtonClass}
            aria-label="Previous track"
          >
            <SkipBack className={isMobileChrome ? 'size-5' : 'size-4'} />
          </Button>
          <Button
            type="button"
            size="icon"
            onClick={onPlayPause}
            disabled={!canPlay}
            className={playButtonClass}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className={isMobileChrome ? 'size-4' : 'size-3.5'} />
            ) : (
              <Play className={cn(isMobileChrome ? 'size-4 ml-0.5' : 'size-3.5 ml-0.5')} />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onSkipForward}
            disabled={!canSkipForward}
            className={skipButtonClass}
            aria-label="Next track"
          >
            <SkipForward className={isMobileChrome ? 'size-5' : 'size-4'} />
          </Button>
        </div>

        <button
          type="button"
          onClick={onTogglePanel}
          className={cn(
            miniPlayerMetaButtonClass,
            'transition-colors',
            isHeroDock ? 'hover:bg-white/5' : 'hover:bg-muted/40'
          )}
          aria-expanded={panelOpen}
          aria-label={panelOpen ? 'Close now playing' : `Now playing: ${title}`}
        >
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
            <p className={isHeroDock ? miniPlayerTitleOnDark : miniPlayerTitle}>{title}</p>
            <p className={isHeroDock ? miniPlayerMetaOnDark : miniPlayerMeta}>{subtitle}</p>
          </div>
          <ChevronDown
            className={cn(
              'size-5 shrink-0 transition-transform',
              panelOpen && 'rotate-180',
              isHeroDock ? 'text-signal-purple-bright/80' : 'text-muted-foreground'
            )}
            aria-hidden
          />
        </button>
      </div>

      {isMobileChrome && (
        <div
          className="h-0.5 w-full bg-signal-purple/20"
          role="progressbar"
          aria-valuenow={Math.round(progressPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Playback progress"
        >
          <div
            className="h-full bg-signal-purple-bright transition-[width] duration-300 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}
    </motion.div>
  );
});
