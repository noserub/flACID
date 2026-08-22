import type { ReactNode } from 'react';
import { Play } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
function LawCell({
  law,
  children,
}: {
  law: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-signal-purple/25 bg-muted/15 px-4 py-4 space-y-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{law}</p>
      <div className="min-h-[3rem] min-w-0 flex items-center">{children}</div>
    </div>
  );
}

export function LawsSpecimen() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <LawCell law="Rest is purple">
          <Button variant="ghost" size="sm">
            Skip
          </Button>
        </LawCell>
        <LawCell law="Here is green">
          <Tabs defaultValue="1" className="w-full max-w-[11rem]">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="0">Photos</TabsTrigger>
              <TabsTrigger value="1">Visuals</TabsTrigger>
            </TabsList>
          </Tabs>
        </LawCell>
        <LawCell law="Titles stay pink">
          <p className="font-hero text-2xl tracking-tight text-hot-pink-bright">Discography</p>
        </LawCell>
        <LawCell law="The fill is Play">
          <Button size="sm">
            <Play className="size-4" />
            Play
          </Button>
        </LawCell>
      </div>
      <p className="text-xs text-muted-foreground">Gradient only on Gallery and the wordmark.</p>
    </div>
  );
}
