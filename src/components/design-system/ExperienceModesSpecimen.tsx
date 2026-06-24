import { EXPERIENCE_MODES } from '../../lib/designSystemRegistry';
import { cn } from '../ui/utils';

export function ExperienceModesSpecimen() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {EXPERIENCE_MODES.map((mode, i) => (
        <div
          key={mode.id}
          className={cn(
            'rounded-xl border border-signal-purple/25 bg-card/80 p-4 space-y-3',
            i === 0 && 'sm:col-span-2 lg:col-span-1'
          )}
        >
          <div>
            <p className="text-sm font-medium text-neon-green">{mode.name}</p>
            <p className="text-xs text-foreground/80 mt-1">{mode.summary}</p>
          </div>
          <div className="space-y-2 text-[11px]">
            <p>
              <span className="text-signal-purple-bright font-medium">Chrome: </span>
              <span className="text-muted-foreground">{mode.chrome}</span>
            </p>
            <p>
              <span className="text-signal-purple-bright font-medium">Tokens: </span>
              <span className="text-muted-foreground font-mono">{mode.tokens}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
