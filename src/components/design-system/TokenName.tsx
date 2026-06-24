import { cn } from '../ui/utils';

/** Static mono token label for foundation reference — not interactive. */
export function TokenName({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        'font-mono text-[11px] text-signal-purple-bright/90',
        className
      )}
    >
      {name}
    </span>
  );
}
