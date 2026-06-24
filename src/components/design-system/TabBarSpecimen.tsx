import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../ui/utils';
import { label } from '../../lib/typography';
import { brandTabListClass, brandTabTriggerClass } from '../../lib/brandClasses';

const DEMO_TABS = ['Photos', 'Visuals', 'BTS'] as const;

/**
 * Gallery tab bar — uses the same Tabs primitives and brand classes as PhotoGallery.
 */
export function TabBarSpecimen() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-signal-purple/20 bg-void/40 p-6 sm:p-8">
        <p className={cn(label, 'mb-4 text-center')}>Gallery</p>
        <Tabs defaultValue="1" className="w-full">
          <TabsList
            className="grid w-full max-w-2xl mx-auto"
            style={{ gridTemplateColumns: `repeat(${DEMO_TABS.length}, 1fr)` }}
          >
            {DEMO_TABS.map((name, index) => (
              <TabsTrigger key={name} value={index.toString()}>
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-3">
        <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
          <p className="font-medium text-foreground mb-1">Rest</p>
          <p>signal-purple-bright text</p>
        </div>
        <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
          <p className="font-medium text-neon-green mb-1">Active</p>
          <p>neon-green text, purple wash, green glow</p>
        </div>
        <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
          <p className="font-medium text-foreground mb-1">Not used</p>
          <p>primary CTA fill (reserved for Play, tickets)</p>
        </div>
      </div>

      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer text-signal-purple-bright hover:text-neon-green transition-colors">
          Class reference
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-lg border border-border/40 bg-muted/20 p-3 font-mono text-[10px] text-foreground/70">
          {brandTabListClass}
          {'\n'}
          {brandTabTriggerClass}
        </pre>
      </details>
    </div>
  );
}
