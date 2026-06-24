import type { ComponentProps } from 'react';
import { cn } from './ui/utils';
import {
  sectionNavRailDotActiveClass,
  sectionNavRailDotRestClass,
} from '../lib/brandClasses';
import { motion, zIndex } from '../lib/layoutTokens';

interface SectionNavRailDotProps extends Omit<ComponentProps<'button'>, 'children'> {
  label: string;
  isActive?: boolean;
}

/** Desktop right-rail section indicator — scroll-spy dot (lg+ only on site). */
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
      title={label}
      aria-label={`Go to ${label}`}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'pointer-events-auto rounded-full border',
        motion.transition,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-purple-bright/60',
        isActive ? sectionNavRailDotActiveClass : sectionNavRailDotRestClass,
        className
      )}
      {...props}
    />
  );
}

/** Fixed right column container — matches SectionNavRail placement. */
export const sectionNavRailClass = cn(
  'fixed right-[max(1rem,env(safe-area-inset-right))] top-1/2 -translate-y-1/2',
  'hidden lg:flex flex-col items-center gap-2.5 pointer-events-none',
  zIndex.nav
);
