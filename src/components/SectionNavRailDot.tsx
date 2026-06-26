import type { ComponentProps } from 'react';
import { cn } from './ui/utils';
import {
  sectionNavRailDotActiveClass,
  sectionNavRailDotRestClass,
  sectionNavRailLabelActiveClass,
  sectionNavRailLabelRestClass,
} from '../lib/brandClasses';
import { motion, zIndex } from '../lib/layoutTokens';

interface SectionNavRailDotProps extends Omit<ComponentProps<'button'>, 'children'> {
  label: string;
  isActive?: boolean;
}

/** Desktop right-rail section indicator — scroll-spy dot + label (lg+ only on site). */
export function SectionNavRailDot({
  label,
  isActive = false,
  className,
  type = 'button',
  ...props
}: SectionNavRailDotProps) {
  return (
    <button
      type={type}
      aria-label={`Go to ${label}`}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'group/row relative flex w-full min-h-10 items-center justify-end gap-2.5',
        'rounded-lg py-1.5 pl-4 pr-2',
        motion.transition,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-purple-bright/60',
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          motion.transition,
          isActive ? sectionNavRailLabelActiveClass : sectionNavRailLabelRestClass
        )}
      >
        {label}
      </span>
      <span
        aria-hidden
        className={cn(
          'relative z-10 shrink-0 rounded-full border',
          motion.transition,
          isActive ? sectionNavRailDotActiveClass : sectionNavRailDotRestClass
        )}
      />
    </button>
  );
}

/** Fixed right column container — matches SectionNavRail placement. */
export const sectionNavRailClass = cn(
  'fixed right-[max(0.5rem,env(safe-area-inset-right))] top-1/2 -translate-y-1/2',
  'hidden lg:flex flex-col items-stretch gap-0.5',
  'py-3 pl-2 pr-1 -my-3 rounded-l-2xl',
  'pointer-events-auto',
  zIndex.nav
);
