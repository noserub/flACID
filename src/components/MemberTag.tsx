import { cn } from './ui/utils';

interface MemberTagProps {
  name: string;
  role?: string;
}

export function MemberTag({ name, role }: MemberTagProps) {
  return (
    <li
      className={cn(
        'rounded-full border border-signal-purple/55 bg-card px-3.5 py-2 text-sm',
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_0_0_1px_rgba(74,222,128,0.06)]',
        'transition-all duration-300',
        'hover:border-neon-green/55 hover:bg-muted/80',
        'hover:shadow-[0_0_18px_rgba(74,222,128,0.2),inset_0_1px_0_rgba(255,255,255,0.06)]'
      )}
    >
      <span className="font-medium text-foreground">{name}</span>
      {role && <span className="text-foreground/65"> · {role}</span>}
    </li>
  );
}
