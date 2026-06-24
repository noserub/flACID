/**
 * Semantic color tokens — Tailwind class strings backed by CSS variables in globals.css.
 *
 * Roles:
 * - surface.*     — backgrounds
 * - border.*      — borders
 * - shadow.*      — elevation & glow
 * - gradient.*    — fills & text gradients
 * - interactive.* — hover / active / focus patterns
 * - text.*        — semantic text (prefer typography.ts for type ramp)
 */
import { cn } from '../components/ui/utils';

export const surface = {
  void: 'bg-void',
  base: 'bg-background',
  card: 'bg-card',
  cardTranslucent: 'bg-card/80',
  cardGlass: 'bg-card/95 backdrop-blur-md',
  purpleSubtle: 'bg-signal-purple-subtle',
  purpleMuted: 'bg-signal-purple-muted',
  purpleTint: 'bg-signal-purple/10',
} as const;

export const border = {
  brand: 'border-signal-purple/40',
  brandSubtle: 'border-signal-purple/25',
  brandSoft: 'border-signal-purple/30',
  brandHover: 'hover:border-neon-green/50',
  brandHoverMuted: 'hover:border-neon-green/35',
  brandCardHover: 'hover:border-signal-purple-bright/50',
} as const;

export const shadow = {
  glowGreenSm: 'shadow-glow-green-sm',
  glowGreenMd: 'shadow-glow-green-md',
  glowGreenLg: 'shadow-glow-green-lg',
  glowPurpleSm: 'shadow-glow-purple-sm',
  glowPurpleMd: 'shadow-glow-purple-md',
  glowPurpleLg: 'shadow-glow-purple-lg',
  glowPurpleCta: 'shadow-glow-purple-cta',
  elevated: 'shadow-elevated',
  card: 'shadow-card',
  insetHighlight: 'shadow-inset-highlight',
  insetGreenRing: 'shadow-inset-green-ring',
  hoverGreen: 'hover:shadow-glow-green-md',
  hoverGreenLg: 'hover:shadow-glow-green-lg',
  hoverPurple: 'hover:shadow-glow-purple-sm',
} as const;

export const gradient = {
  brandSurface: 'bg-gradient-to-br from-signal-purple-muted via-void to-neon-green-subtle',
  albumCover: 'bg-gradient-to-br from-signal-purple-muted to-neon-green-subtle',
  sectionWash: 'bg-gradient-to-b from-background via-signal-purple-wash to-background',
  newsletterDialog:
    'bg-gradient-to-b from-background via-background to-signal-purple-subtle',
  brandText:
    'bg-gradient-to-r from-signal-purple-bright via-hot-pink to-neon-green bg-clip-text text-transparent',
  cta: 'bg-gradient-to-r from-signal-purple to-hot-pink-bright hover:from-signal-purple-bright hover:to-hot-pink',
} as const;

export const interactive = {
  rest: 'text-signal-purple-bright',
  hover: 'hover:text-neon-green hover:border-neon-green/55 hover:bg-muted',
  hoverShadow: cn(shadow.hoverGreen),
  transition: 'transition-all duration-300',
  headingHover: 'transition-colors group-hover:text-signal-purple-bright',
  link: 'text-signal-purple-bright underline-offset-4 hover:text-neon-green hover:underline',
} as const;

export const text = {
  label: 'text-neon-green',
  success: 'text-neon-green',
  successMuted: 'text-neon-green/95',
  destructive: 'text-destructive',
} as const;

/** Radial ambient washes — use on absolutely positioned overlays */
export const ambientClass = {
  default: 'bg-ambient-default',
  editorial: 'bg-ambient-editorial',
} as const;

/** Scrim and panel overlays on viz, lightbox, modals */
export const overlay = {
  scrim: 'bg-void-scrim',
  scrimLight: 'bg-void-scrim-light',
  scrimHeavy: 'bg-void-scrim-heavy',
  panel: 'bg-void-panel',
  fullscreen: 'bg-void',
  chromeBar: 'bg-void-scrim-heavy backdrop-blur-md',
  pill: 'bg-white/20 backdrop-blur-sm',
} as const;

/** Text on dark viz / lightbox / stage surfaces */
export const onDark = {
  heading: 'text-white/90',
  body: 'text-white/80',
  secondary: 'text-white/70',
  muted: 'text-white/60',
  faint: 'text-white/45',
  accent: 'text-signal-purple-bright',
} as const;
