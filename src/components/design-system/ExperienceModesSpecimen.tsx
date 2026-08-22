import { EXPERIENCE_MODES } from '../../lib/designSystemRegistry';
import { DescentToggleButton } from '../DescentModeToggle';

export function ExperienceModesSpecimen() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {EXPERIENCE_MODES.map((mode) => (
        <div
          key={mode.id}
          className="rounded-xl border border-signal-purple/25 bg-card/80 p-4 space-y-3"
        >
          <div>
            <p className="text-sm font-medium text-neon-green">{mode.name}</p>
            <p className="text-xs text-foreground/80 mt-1">{mode.summary}</p>
          </div>
          <p className="text-[11px] text-muted-foreground">{mode.chrome}</p>
          {mode.id === 'descent' ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <DescentToggleButton isDescentMode={false} onClick={() => {}} />
              <DescentToggleButton isDescentMode onClick={() => {}} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
