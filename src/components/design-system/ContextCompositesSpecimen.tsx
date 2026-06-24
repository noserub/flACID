import { Play, SkipBack, SkipForward, Maximize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { MiniPlayerChip } from '../MiniPlayerChip';
import { TextLabel } from '../TextLabel';
import { cn } from '../ui/utils';
import { brandVizSurfaceClass } from '../../lib/brandClasses';
import { border as borderTokens, onDark, overlay, shadow as shadowColors } from '../../lib/colors';
import { gradientText, titleSection, vizCardName } from '../../lib/typography';
import { OverlayChromeButton } from '../OverlayChromeButton';

function Annotation({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] text-signal-purple-bright/90 border-l-2 border-neon-green/40 pl-2 mt-2">
      {children}
    </p>
  );
}

export function ContextCompositesSpecimen() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Hero composite */}
      <div className="lg:col-span-2 rounded-xl border border-signal-purple/30 overflow-hidden">
        <div className="border-b border-signal-purple/15 bg-muted/30 px-4 py-2">
          <p className="text-xs font-medium text-neon-green">In context · Hero</p>
          <p className="text-[11px] text-muted-foreground">Viz surface, grain, logo, hero player dock</p>
        </div>
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
        <div className="px-4 py-3 bg-card/50 grid sm:grid-cols-3 gap-2 text-[11px] text-muted-foreground">
          <Annotation>brandVizSurfaceClass + hero grain overlays</Annotation>
          <Annotation>gradientText wordmark; stutter on live site</Annotation>
          <Annotation>Mini player dock: primary CTA on viz</Annotation>
        </div>
      </div>

      {/* Gallery viz card */}
      <div className="rounded-xl border border-signal-purple/30 overflow-hidden">
        <div className="border-b border-signal-purple/15 bg-muted/30 px-4 py-2">
          <p className="text-xs font-medium text-neon-green">In context · Gallery viz card</p>
        </div>
        <div className="p-5 flex justify-center">
          <div
            className={cn(
              'group relative w-full max-w-[11rem] aspect-[4/3] overflow-hidden rounded-xl',
              'border border-signal-purple/40 bg-void',
              shadowColors.card,
              borderTokens.brandHover
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-signal-purple-muted to-neon-green-subtle opacity-80" />
            <div className="relative flex h-full flex-col justify-end p-3">
              <TextLabel as="span" className="mb-0.5 font-medium">
                Viz 3
              </TextLabel>
              <span className={vizCardName}>Lite Brite Magic</span>
            </div>
          </div>
        </div>
        <div className="px-4 pb-3">
          <Annotation>label + vizCardName; purple border → green hover shadow</Annotation>
        </div>
      </div>

      {/* Fullscreen player */}
      <div className="rounded-xl border border-signal-purple/30 overflow-hidden">
        <div className="border-b border-signal-purple/15 bg-muted/30 px-4 py-2">
          <p className="text-xs font-medium text-neon-green">In context · Player fullscreen</p>
        </div>
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
        <div className="px-4 pb-3">
          <Annotation>onDark type on void; primary play CTA; ghost chrome for skip/exit</Annotation>
        </div>
      </div>
    </div>
  );
}
