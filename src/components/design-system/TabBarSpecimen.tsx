import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../ui/utils';
import { label } from '../../lib/typography';

const DEMO_TABS = ['Photos', 'Visuals', 'BTS'] as const;

export function TabBarSpecimen() {
  return (
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
  );
}
