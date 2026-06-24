import { cn } from '../components/ui/utils';
import { border, gradient, interactive, onDark, overlay, shadow, surface, text } from './colors';
import { motion } from './layoutTokens';

/**
 * Composed brand patterns — built from semantic tokens in colors.ts / globals.css.
 */
export const brandHoverInteractiveClass = cn(
  interactive.rest,
  interactive.hover,
  shadow.hoverGreen,
  interactive.transition
);

export const brandControlClass = cn(
  surface.cardGlass,
  interactive.rest,
  border.brand,
  interactive.hover,
  shadow.hoverGreen,
  interactive.transition
);

export const brandPrimaryButtonClass = cn(
  'bg-primary text-primary-foreground',
  shadow.glowPurpleLg,
  'hover:bg-signal-purple-bright',
  interactive.transition
);

export const brandMenuItemClass = cn(
  'text-signal-purple-bright/95',
  'data-[highlighted]:bg-muted data-[highlighted]:text-neon-green',
  'transition-colors duration-300'
);

export const brandMenuItemSuccessClass = cn(
  text.successMuted,
  'data-[highlighted]:bg-success-muted data-[highlighted]:text-neon-green',
  'transition-colors duration-300'
);

export const brandMenuItemDestructiveClass = cn(
  'text-destructive/95',
  'data-[highlighted]:bg-destructive/15 data-[highlighted]:text-destructive',
  'transition-colors duration-300'
);

export const brandIconButtonClass = cn(
  brandHoverInteractiveClass,
  'disabled:text-muted-foreground disabled:hover:text-muted-foreground disabled:hover:bg-transparent disabled:hover:shadow-none'
);

export const brandActiveAccentClass = 'text-hot-pink';

export const brandVizSurfaceClass = gradient.brandSurface;

export const brandSectionWashClass = gradient.sectionWash;

export const brandSpinnerClass = interactive.rest;

/** Segmented tab bar container (Gallery, etc.) */
export const brandTabListClass = cn(
  'flex h-auto w-fit items-center justify-center gap-0.5 rounded-lg p-1',
  'bg-card/90 border border-signal-purple/25 backdrop-blur-sm',
  shadow.glowPurpleSm
);

/** Tab trigger: purple rest → green active (nav language, not CTA) */
export const brandTabTriggerClass = cn(
  'inline-flex flex-1 items-center justify-center rounded-md px-3 py-2',
  'text-sm font-medium whitespace-nowrap',
  interactive.rest,
  'hover:text-neon-green hover:bg-muted/40',
  'data-[state=active]:text-neon-green data-[state=active]:bg-signal-purple/20',
  'data-[state=active]:shadow-glow-green-sm',
  interactive.transition,
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/50'
);

/** Mode toggle on (Descend, etc.): nav language + stronger active affordance */
export const brandToggleActiveClass = cn(
  surface.cardGlass,
  'font-semibold text-neon-green',
  'bg-signal-purple/25 border border-neon-green/50',
  shadow.glowGreenSm,
  'hover:bg-signal-purple/35 hover:text-neon-green',
  interactive.transition,
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-green/50'
);

/** Modal / dialog backdrop */
export const brandOverlayScrimClass = cn(
  overlay.scrim,
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0'
);

/** Gallery lightbox surface */
export const brandLightboxSurfaceClass = cn(
  overlay.panel,
  '!max-w-[98vw] w-[98vw] h-[98vh] min-h-[80vh] p-0',
  border.brandSoft
);

/** Circular control on viz / lightbox (close, prev, next) */
export const brandOverlayChromeButtonClass = cn(
  'rounded-full flex items-center justify-center text-white',
  overlay.scrim,
  'border border-signal-purple/30',
  'hover:bg-void-scrim-heavy hover:border-signal-purple/50',
  motion.transition
);

/** Lightbox caption chip */
export const brandLightboxCaptionClass = cn(
  onDark.heading,
  'text-lg drop-shadow-lg rounded-lg px-4 py-2 inline-block',
  overlay.scrim
);

/** Branded form input */
export const brandInputClass = cn(
  'border-signal-purple/40 bg-input-background',
  'focus-visible:border-neon-green/50 focus-visible:ring-neon-green/30'
);

/** Slider track fill — control, not CTA */
export const brandSliderRangeClass = 'bg-signal-purple-bright';

export const brandSliderThumbClass = cn(
  'border-signal-purple-bright bg-card',
  'ring-neon-green/30 hover:ring-neon-green/40 focus-visible:ring-neon-green/50'
);

/** Desktop section nav rail dots */
export const sectionNavRailDotActiveClass = cn(
  'h-2.5 w-2.5 border-neon-green/70 bg-neon-green',
  shadow.glowGreenMd
);

export const sectionNavRailDotRestClass = cn(
  'h-2 w-2 border-signal-purple/40 bg-signal-purple/45',
  'hover:h-2.5 hover:w-2.5 hover:border-neon-green/55 hover:bg-signal-purple-bright/90',
  shadow.hoverGreen
);

/** Stage / projection settings panel */
export const brandStagePanelClass = cn(
  overlay.scrimHeavy,
  'backdrop-blur-md rounded-lg p-4'
);

export const brandStageOutlineButtonClass = cn(
  onDark.heading,
  'border-white/30 hover:bg-white/20'
);

export const brandStageSelectTriggerClass = cn(
  'bg-white/10 border-white/20 text-white'
);

export const brandStageSelectContentClass = cn(
  'bg-void-panel border-white/20 text-white'
);
