import { cn } from './ui/utils';
import { inlineSecondary } from '../lib/typography';

interface MemberTagProps {
  name: string;
  role?: string;
}

export function MemberTag({ name, role }: MemberTagProps) {
  return (
    <li
      className={cn(
        'rounded-full border border-signal-purple/55 bg-card px-3.5 py-2 text-sm',
        'shadow-member-tag',
        'transition-all duration-300',
        'hover:border-neon-green/55 hover:bg-muted/80'
      )}
    >
      <span className="font-medium text-foreground">{name}</span>
      {role && <span className={inlineSecondary}> · {role}</span>}
    </li>
  );
}
