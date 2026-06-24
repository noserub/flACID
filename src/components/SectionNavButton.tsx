import type { ComponentProps } from 'react';
import { cn } from './ui/utils';
import { shadow } from '../lib/colors';

interface SectionNavButtonProps extends ComponentProps<'button'> {
  isActive?: boolean;
}

/** Mobile bottom section nav item — purple rest, green active + glow. */
export function SectionNavButton({
  isActive = false,
  className,
  children,
  ...props
}: SectionNavButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-lg px-1 py-2 text-[10px] font-medium uppercase tracking-wide transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/50',
        isActive
          ? cn('text-neon-green', shadow.glowGreenSm)
          : 'text-signal-purple-bright/80 hover:text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
