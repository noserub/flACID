import { Play, Ticket } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { DescentToggleButton } from '../DescentModeToggle';
import { SectionNavRailDot } from '../SectionNavRailDot';
import { SectionNavButton } from '../SectionNavButton';
import { cn } from '../ui/utils';
import { INTERACTION_RULES } from '../../lib/designSystemRegistry';

function CompareCard({
  verdict,
  title,
  description,
  children,
}: {
  verdict: 'use' | 'avoid';
  title: string;
  description: string;
  children: React.ReactNode;
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
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export function InteractionSpecimens() {
  return (
    <div className="space-y-10">
      <p className="text-sm text-foreground/80 max-w-2xl">
        Three interaction roles on the live site. Each row shows what it looks like in context,
        not just token names.
      </p>

      {/* Primary CTA */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-neon-green">{INTERACTION_RULES[0].rule}</p>
          <p className="text-xs text-muted-foreground mt-1">{INTERACTION_RULES[0].use}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <CompareCard
            verdict="use"
            title="Play, tickets, newsletter submit"
            description="default button · primary fill · one main action per view"
          >
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
          <CompareCard
            verdict="avoid"
            title="Selection is not a CTA"
            description="Tabs, nav, slider, and toggle on use nav language"
          >
            <div className="space-y-3">
              <Tabs defaultValue="1">
                <TabsList className="grid grid-cols-3 w-full max-w-xs">
                  <TabsTrigger value="0">Photos</TabsTrigger>
                  <TabsTrigger value="1">Visuals</TabsTrigger>
                  <TabsTrigger value="2">BTS</TabsTrigger>
                </TabsList>
              </Tabs>
              <p className="text-[11px] text-destructive/90">
                Wrong: primary fill on active tab
              </p>
              <div className="flex gap-1 max-w-xs">
                <span className="flex-1 rounded-md px-3 py-2 text-sm text-center text-primary-foreground bg-primary opacity-60 line-through">
                  Visuals
                </span>
                <span className="flex-1 rounded-md px-3 py-2 text-sm text-center text-muted-foreground border border-border">
                  Photos
                </span>
              </div>
            </div>
          </CompareCard>
        </div>
      </div>

      {/* Nav active */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-neon-green">{INTERACTION_RULES[1].rule}</p>
          <p className="text-xs text-muted-foreground mt-1">{INTERACTION_RULES[1].use}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CompareCard
            verdict="use"
            title="Gallery tabs"
            description="Green text + purple wash"
          >
            <Tabs defaultValue="1">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="0">Photos</TabsTrigger>
                <TabsTrigger value="1">Visuals</TabsTrigger>
              </TabsList>
            </Tabs>
          </CompareCard>
          <CompareCard
            verdict="use"
            title="Section rail"
            description="Green dot + glow"
          >
            <nav className="flex flex-col items-center gap-2 py-2">
              <SectionNavRailDot label="About" />
              <SectionNavRailDot label="Listen" isActive />
              <SectionNavRailDot label="Tour" />
            </nav>
          </CompareCard>
          <CompareCard
            verdict="use"
            title="Mobile nav"
            description="Green label when active"
          >
            <div className="flex gap-1 rounded-lg border border-signal-purple/30 bg-void/80 p-1">
              <SectionNavButton className="flex-1">About</SectionNavButton>
              <SectionNavButton isActive className="flex-1">
                Listen
              </SectionNavButton>
            </div>
          </CompareCard>
          <CompareCard
            verdict="use"
            title="Descend on"
            description="Green border + glow"
          >
            <DescentToggleButton isDescentMode onClick={() => {}} />
          </CompareCard>
        </div>
      </div>

      {/* Control rest */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-neon-green">{INTERACTION_RULES[2].rule}</p>
          <p className="text-xs text-muted-foreground mt-1">{INTERACTION_RULES[2].use}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <CompareCard
            verdict="use"
            title="Ghost & outline controls"
            description="Purple at rest → green on hover"
          >
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm">
                Skip
              </Button>
              <Button variant="outline" size="sm">
                Volume
              </Button>
              <Button variant="link" size="sm">
                Learn more
              </Button>
            </div>
          </CompareCard>
          <CompareCard
            verdict="use"
            title="Slider is a control"
            description="Purple fill on track, not primary CTA"
          >
            <Slider value={[55]} max={100} className="max-w-xs" aria-label="Volume" />
          </CompareCard>
        </div>
        <CompareCard
          verdict="avoid"
          title="Do not use primary for controls"
          description={INTERACTION_RULES[0].avoid}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-32 h-2 rounded-full bg-primary/80 opacity-70" aria-hidden />
            <span className="text-xs text-muted-foreground">Slider range filled with primary</span>
          </div>
        </CompareCard>
      </div>

      <div className="rounded-lg border border-border/40 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        <p>
          <span className="text-foreground font-medium">Token map: </span>
          CTA → <code className="text-signal-purple-bright">brandPrimaryButtonClass</code>
          {' · '}
          Nav active → <code className="text-signal-purple-bright">brandTabTriggerClass</code>,{' '}
          <code className="text-signal-purple-bright">sectionNavRailDotActiveClass</code>,{' '}
          <code className="text-signal-purple-bright">brandToggleActiveClass</code>
          {' · '}
          Control → <code className="text-signal-purple-bright">brandHoverInteractiveClass</code>,{' '}
          <code className="text-signal-purple-bright">brandSliderRangeClass</code>
        </p>
      </div>
    </div>
  );
}
