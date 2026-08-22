import { Play, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '../ui/button';
import { DescentToggleButton } from '../DescentModeToggle';
import { OverlayChromeButton } from '../OverlayChromeButton';
import { SectionNavRailDot } from '../SectionNavRailDot';
import { cn } from '../ui/utils';
import { brandVizSurfaceClass } from '../../lib/brandClasses';
import { onDark } from '../../lib/colors';
import { gradientText } from '../../lib/typography';

const MODES = ['browse', 'hero', 'descent', 'overlay'] as const;
type PressureMode = (typeof MODES)[number];

const MODE_LABEL: Record<PressureMode, string> = {
  browse: 'Browsing',
  hero: 'Listening',
  descent: 'Descent',
  overlay: 'On the viz',
};

function Transport({ variant }: { variant: 'chrome' | 'hero' | 'overlay' }) {
  const onViz = variant === 'hero' || variant === 'overlay';
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-2 py-1.5',
        variant === 'chrome' && 'border border-signal-purple/30 bg-void/85',
        variant === 'hero' && 'bg-void/45 backdrop-blur-sm',
        variant === 'overlay' && 'bg-void/30'
      )}
    >
      {variant === 'overlay' ? (
        <OverlayChromeButton size="sm" aria-label="Previous">
          <SkipBack className="size-3.5" />
        </OverlayChromeButton>
      ) : (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Previous">
          <SkipBack className="size-3.5" />
        </Button>
      )}
      <Button size="sm" className="h-8 rounded-full px-2.5">
        <Play className="size-3.5" />
      </Button>
      {variant === 'overlay' ? (
        <OverlayChromeButton size="sm" aria-label="Next">
          <SkipForward className="size-3.5" />
        </OverlayChromeButton>
      ) : (
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Next">
          <SkipForward className="size-3.5" />
        </Button>
      )}
      <span
        className={cn(
          'ml-1 text-xs truncate max-w-[7rem]',
          onViz ? onDark.heading : 'text-foreground'
        )}
      >
        Neon Tunnel
      </span>
    </div>
  );
}

function PressureFrame({ mode }: { mode: PressureMode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-neon-green mb-2">{MODE_LABEL[mode]}</p>
      <div
        className={cn(
          'relative min-h-[13.5rem] overflow-hidden rounded-xl border border-signal-purple/25',
          brandVizSurfaceClass
        )}
      >
        <div className="absolute inset-0 hero-cosmic-grain pointer-events-none" aria-hidden />
        <div className="absolute inset-0 bg-hero-purple-glow pointer-events-none opacity-50" aria-hidden />
        {mode === 'overlay' ? (
          <div className="absolute inset-0 bg-void/55 pointer-events-none" aria-hidden />
        ) : null}
        {mode === 'descent' ? (
          <div className="absolute inset-0 bg-neon-green/5 pointer-events-none" aria-hidden />
        ) : null}

        <div className="absolute top-2 left-2 right-2 z-10 flex items-start justify-between gap-2">
          <div className={cn(mode === 'browse' ? '' : 'invisible')}>
            <Transport variant="chrome" />
          </div>
          <div className={cn(mode === 'browse' || mode === 'descent' ? '' : 'invisible')}>
            <DescentToggleButton isDescentMode={mode === 'descent'} onClick={() => {}} />
          </div>
        </div>

        <div
          className={cn(
            'absolute inset-0 z-10 flex items-center justify-center pointer-events-none',
            mode === 'browse' ? '' : 'invisible'
          )}
        >
          <p className={cn('font-hero type-display-wordmark tracking-tight text-2xl sm:text-3xl', gradientText)}>
            flACID
          </p>
        </div>

        {mode === 'overlay' ? (
          <p className={cn('absolute top-1/3 left-4 z-10 text-sm', onDark.secondary)}>Neon Tunnel</p>
        ) : null}

        <div className={cn('absolute bottom-3 left-3 right-16 z-10', mode === 'hero' ? '' : 'invisible')}>
          <Transport variant="hero" />
        </div>

        <div className={cn('absolute bottom-3 left-3 right-3 z-10', mode === 'overlay' ? '' : 'invisible')}>
          <Transport variant="overlay" />
        </div>

        <nav
          aria-hidden={mode !== 'browse'}
          className={cn(
            'absolute right-1.5 top-1/2 z-10 -translate-y-1/2',
            mode === 'browse' ? '' : 'invisible'
          )}
        >
          <SectionNavRailDot label="About" />
          <SectionNavRailDot label="Listen" isActive />
          <SectionNavRailDot label="Tour" />
        </nav>
      </div>
    </div>
  );
}

export function PressureSequence() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {MODES.map((mode) => (
        <PressureFrame key={mode} mode={mode} />
      ))}
    </div>
  );
}
