import { cn } from '../components/ui/utils';

/**
 * Core interactive hover: purple/pink at rest → teal on hover.
 * Hover uses opaque fills so chrome does not wash out over the hero art.
 */
export const brandHoverInteractiveClass = cn(
  'text-signal-purple-bright',
  'hover:text-neon-green hover:border-neon-green/55',
  'hover:bg-muted',
  'hover:shadow-lg hover:shadow-[rgba(74,222,128,0.18)]',
  'transition-all duration-300'
);

/** Ghost / outline controls — header Descend (idle), overflow menu, etc. */
export const brandControlClass = cn(
  'bg-card/95 backdrop-blur-md text-signal-purple-bright',
  'border border-signal-purple/40',
  'hover:text-neon-green hover:border-neon-green/55',
  'hover:bg-muted',
  'hover:shadow-lg hover:shadow-[rgba(74,222,128,0.18)]',
  'transition-all duration-300'
);

/** Filled primary CTAs — play, Descend (active), tickets */
export const brandPrimaryButtonClass = cn(
  'bg-primary text-primary-foreground',
  'shadow-lg shadow-[rgba(147,51,234,0.45)]',
  'hover:bg-signal-purple-bright',
  'transition-all duration-300'
);

/** Dropdown / popover menu rows */
export const brandMenuItemClass = cn(
  'text-signal-purple-bright/95',
  'data-[highlighted]:bg-muted data-[highlighted]:text-neon-green',
  'transition-colors duration-300'
);

/** Menu rows that perform a positive commit action */
export const brandMenuItemSuccessClass = cn(
  'text-green-400/95',
  'data-[highlighted]:bg-green-950/80 data-[highlighted]:text-green-300',
  'transition-colors duration-300'
);

/** Menu rows that perform a destructive action */
export const brandMenuItemDestructiveClass = cn(
  'text-red-400/95',
  'data-[highlighted]:bg-red-950/80 data-[highlighted]:text-red-300',
  'transition-colors duration-300'
);

/** Icon-only buttons inside the player chrome */
export const brandIconButtonClass = cn(
  brandHoverInteractiveClass,
  'disabled:text-muted-foreground disabled:hover:text-muted-foreground disabled:hover:bg-transparent disabled:hover:shadow-none'
);

/** Active / connected state (e.g. AirPlay) */
export const brandActiveAccentClass = 'text-hot-pink';

/** Viz / media surface backdrop */
export const brandVizSurfaceClass =
  'bg-gradient-to-br from-[rgba(88,28,135,0.25)] via-void to-[rgba(74,222,128,0.08)]';

/** Section ambient wash */
export const brandSectionWashClass =
  'bg-gradient-to-b from-background via-[rgba(88,28,135,0.06)] to-background';

/** Spinners & loading accents */
export const brandSpinnerClass = 'text-signal-purple-bright';
