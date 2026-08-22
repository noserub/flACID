import { Play, SkipBack, SkipForward, Maximize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { MiniPlayerChip } from '../MiniPlayerChip';
import { MiniPlayerSpecimen } from './MiniPlayerSpecimen';
import { OverlayChromeButton } from '../OverlayChromeButton';
import { cn } from '../ui/utils';
import { brandVizSurfaceClass } from '../../lib/brandClasses';
import { onDark, overlay } from '../../lib/colors';
import { gradientText } from '../../lib/typography';

export function PlaybackSpecimens() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-signal-purple/30 overflow-hidden">
        <p className="border-b border-signal-purple/15 bg-muted/30 px-4 py-2 text-xs font-medium text-neon-green">
          Hero
        </p>
        <div
          className={cn(
            'relative min-h-[14rem] p-4 flex flex-col items-center justify-between',
            brandVizSurfaceClass
          )}
        >
          <div className="absolute inset-0 hero-cosmic-grain pointer-events-none" aria-hidden />
          <div className="absolute inset-0 bg-hero-purple-glow pointer-events-none opacity-60" aria-hidden />
          <p className={cn('relative z-10 font-hero type-display-wordmark tracking-tight', gradientText)}>
            flACID
          </p>
          <div className="relative z-10 w-full max-w-md">
            <MiniPlayerChip
              dock="hero"
              title="Neon Tunnel"
              subtitle="Chronicles Vol. I"
              isPlaying
              panelOpen={false}
              canPlay
              canSkipBack
              canSkipForward
              onPlayPause={() => {}}
              onSkipBack={() => {}}
              onSkipForward={() => {}}
              onTogglePanel={() => {}}
            />
          </div>
        </div>
      </div>

      <MiniPlayerSpecimen />

      <div className="rounded-xl border border-signal-purple/30 overflow-hidden">
        <p className="border-b border-signal-purple/15 bg-muted/30 px-4 py-2 text-xs font-medium text-neon-green">
          Fullscreen player
        </p>
        <div className={cn('relative min-h-[12rem] p-4 flex flex-col justify-end', overlay.fullscreen)}>
          <div
            className="absolute inset-0 bg-gradient-to-br from-signal-purple/40 via-void to-neon-green/20"
            aria-hidden
          />
          <div className="relative z-10 space-y-3">
            <div>
              <p className={onDark.heading}>Neon Tunnel</p>
              <p className={cn(onDark.secondary, 'text-sm')}>Chronicles Vol. I</p>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <OverlayChromeButton size="sm" aria-label="Previous">
                  <SkipBack className="size-4" />
                </OverlayChromeButton>
                <Button size="sm" className="rounded-full">
                  <Play className="size-4" />
                </Button>
                <OverlayChromeButton size="sm" aria-label="Next">
                  <SkipForward className="size-4" />
                </OverlayChromeButton>
              </div>
              <OverlayChromeButton size="sm" aria-label="Exit fullscreen">
                <Maximize2 className="size-4" />
              </OverlayChromeButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
