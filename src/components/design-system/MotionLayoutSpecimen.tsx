import { MOTION_POLICY, RESPONSIVE_BEHAVIOR } from '../../lib/designSystemRegistry';

const MOTION_LABELS: Record<string, string> = {
  'motion.fast': 'Fast',
  'motion.base': 'Base',
  'motion.slow': 'Slow',
};

export function MotionLayoutSpecimen() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-foreground/80 max-w-2xl">{MOTION_POLICY.summary}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {MOTION_POLICY.tokens.map(({ name, use }) => (
            <div key={name} className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
              <p className="text-sm font-medium text-foreground">{MOTION_LABELS[name] ?? name}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{use}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{MOTION_POLICY.reducedMotion}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border/40">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">Pattern</th>
              <th className="px-3 py-2 font-medium">Mobile</th>
              <th className="px-3 py-2 font-medium">Desktop</th>
              <th className="px-3 py-2 font-medium hidden md:table-cell">Hidden when</th>
            </tr>
          </thead>
          <tbody>
            {RESPONSIVE_BEHAVIOR.map((row) => (
              <tr key={row.pattern} className="border-b border-border/30 last:border-0 align-top">
                <td className="px-3 py-3 font-medium text-neon-green whitespace-nowrap">{row.pattern}</td>
                <td className="px-3 py-3 text-muted-foreground">{row.mobile}</td>
                <td className="px-3 py-3 text-muted-foreground">{row.desktop}</td>
                <td className="px-3 py-3 text-muted-foreground hidden md:table-cell">{row.hidden}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
