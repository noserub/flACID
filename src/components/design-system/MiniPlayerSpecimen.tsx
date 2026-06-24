import { useState } from 'react';
import { ListMusic } from 'lucide-react';
import { MiniPlayerChip } from '../MiniPlayerChip';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { cn } from '../ui/utils';
import { brandVizSurfaceClass } from '../../lib/brandClasses';
import { label } from '../../lib/typography';

/**
 * Design system specimen: MiniPlayer is the primary transport UI (hero viz + header chrome).
 */
export function MiniPlayerSpecimen() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [playing, setPlaying] = useState(true);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-2">
        <p className={cn(label, 'mb-0')}>Hero dock</p>
        <p className="text-[11px] text-muted-foreground mb-3">
          Primary control on the visualization surface. Same width as chrome dock (280-400px).
        </p>
        <div
          className={cn(
            'relative overflow-hidden rounded-xl p-4 min-h-[7rem] flex items-end',
            brandVizSurfaceClass
          )}
        >
          <MiniPlayerChip
            dock="hero"
            title="Neon Tunnel"
            subtitle="Chronicles Vol. I"
            isPlaying={playing}
            panelOpen={false}
            canPlay
            canSkipBack
            canSkipForward
            onPlayPause={() => setPlaying((p) => !p)}
            onSkipBack={() => {}}
            onSkipForward={() => {}}
            onTogglePanel={() => {}}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className={cn(label, 'mb-0')}>Chrome dock</p>
        <p className="text-[11px] text-muted-foreground mb-3">
          Header (desktop) or fixed bottom bar (mobile) when scrolled past hero.
        </p>
        <div className="rounded-xl border border-signal-purple/20 bg-void p-4 flex justify-center">
          <MiniPlayerChip
            dock="chrome"
            title="Neon Tunnel"
            subtitle="Chronicles Vol. I"
            isPlaying={playing}
            panelOpen={panelOpen}
            canPlay
            canSkipBack
            canSkipForward
            onPlayPause={() => setPlaying((p) => !p)}
            onSkipBack={() => {}}
            onSkipForward={() => {}}
            onTogglePanel={() => setPanelOpen((o) => !o)}
            className="lg:min-w-[280px] lg:max-w-[400px]"
          />
        </div>
      </div>

      <div className="space-y-2 lg:col-span-2">
        <p className={cn(label, 'mb-0')}>Now playing panel</p>
        <p className="text-[11px] text-muted-foreground mb-3">
          Expands from chip: progress, viz sensitivity, track list.
        </p>
        <div className="max-w-sm overflow-hidden rounded-xl border border-signal-purple/25 bg-background shadow-xl shadow-black/30">
          <div className="border-b border-signal-purple/10 px-4 pt-3 pb-3 space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <ListMusic className="size-3.5" aria-hidden />
              Now playing
            </div>
            <Slider value={[92]} max={240} step={1} className="cursor-default" aria-label="Progress demo" />
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>1:32</span>
              <span>4:00</span>
            </div>
          </div>
          <div className="border-b border-signal-purple/10 px-4 pt-3 pb-3 space-y-2">
            <Label className="text-xs text-muted-foreground">Visualizer reactivity</Label>
            <Slider value={[65]} max={100} className="cursor-default" aria-label="Sensitivity demo" />
          </div>
          <div className="px-2 py-2 space-y-0.5">
            <div className="w-full rounded-lg bg-signal-purple/20 px-3 py-2 text-sm text-foreground">
              <span className="font-medium block truncate">Neon Tunnel</span>
              <span className="text-xs opacity-70 block truncate">Chronicles Vol. I</span>
            </div>
            <div className="w-full rounded-lg px-3 py-2 text-sm text-muted-foreground">
              <span className="font-medium block truncate">Void Signal</span>
              <span className="text-xs opacity-70 block truncate">Chronicles Vol. I</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
