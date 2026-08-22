import type { ReactNode } from 'react';
import { Play, Ticket } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../ui/utils';
import { INTERACTION_RULES, PRODUCTION_BUTTON_VARIANTS } from '../../lib/designSystemRegistry';

function CompareCard({
  verdict,
  title,
  children,
}: {
  verdict: 'use' | 'avoid';
  title: string;
  children: ReactNode;
}) {
  const isUse = verdict === 'use';
  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden',
        isUse ? 'border-neon-green/35 bg-neon-green/5' : 'border-destructive/35 bg-destructive/5'
      )}
    >
      <div
        className={cn(
          'px-4 py-2 border-b text-[11px] font-semibold uppercase tracking-wide',
          isUse
            ? 'border-neon-green/25 text-neon-green bg-neon-green/10'
            : 'border-destructive/25 text-destructive bg-destructive/10'
        )}
      >
        {isUse ? 'Use' : 'Avoid'}
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {children}
      </div>
    </div>
  );
}

export function InteractionSpecimens() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <p className="text-sm font-medium text-neon-green">{INTERACTION_RULES[0].rule}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <CompareCard verdict="use" title="Play, tickets, newsletter">
            <div className="flex flex-wrap gap-2">
              <Button size="sm">
                <Play className="size-4" />
                Play
              </Button>
              <Button size="sm">
                <Ticket className="size-4" />
                Tickets
              </Button>
            </div>
          </CompareCard>
          <CompareCard verdict="avoid" title="Selection is not a CTA">
            <div className="flex gap-1 max-w-xs">
              <span className="flex-1 rounded-md px-3 py-2 text-sm text-center text-primary-foreground bg-primary opacity-60 line-through">
                Visuals
              </span>
              <span className="flex-1 rounded-md px-3 py-2 text-sm text-center text-muted-foreground border border-border">
                Photos
              </span>
            </div>
          </CompareCard>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-neon-green">{INTERACTION_RULES[1].rule}</p>
        <CompareCard verdict="use" title="Tabs, section nav, Descend on">
          <Tabs defaultValue="1">
            <TabsList className="grid grid-cols-2 w-full max-w-xs">
              <TabsTrigger value="0">Photos</TabsTrigger>
              <TabsTrigger value="1">Visuals</TabsTrigger>
            </TabsList>
          </Tabs>
        </CompareCard>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-neon-green">{INTERACTION_RULES[2].rule}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <CompareCard verdict="use" title="Ghost and outline">
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm">
                Skip
              </Button>
              <Button variant="outline" size="sm">
                Volume
              </Button>
            </div>
          </CompareCard>
          <CompareCard verdict="avoid" title="Primary on a slider">
            <div className="flex flex-wrap items-center gap-4">
              <Slider value={[55]} max={100} className="max-w-xs" aria-label="Volume" />
              <div className="w-32 h-2 rounded-full bg-primary/80 opacity-70" aria-hidden />
            </div>
          </CompareCard>
        </div>
      </div>

      <div className="space-y-3">
        {PRODUCTION_BUTTON_VARIANTS.map((variant) => (
          <div key={variant} className="flex flex-wrap items-center gap-2">
            <span className="w-16 text-[11px] uppercase tracking-wide text-muted-foreground">
              {variant}
            </span>
            <Button variant={variant} size="sm">
              Small
            </Button>
            <Button variant={variant}>Default</Button>
            <Button variant={variant} disabled>
              Disabled
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
