/**
 * Hex / rgba values mirroring globals.css — for canvas, viz, and runtime JS.
 * CSS remains the styling source of truth; keep these in sync when editing tokens.
 */
export const COLOR_VALUES = {
  void: '#050508',
  background: '#0a0a0f',
  foreground: '#e8e8f0',
  card: '#1a1a24',
  muted: '#2a2a3a',
  mutedForeground: '#a0a0b0',
  signalPurple: '#9333ea',
  signalPurpleBright: '#c084fc',
  signalPurpleGlow: 'rgba(147, 51, 234, 0.35)',
  neonGreen: '#4ade80',
  neonGreenDim: '#22c55e',
  neonGreenGlow: 'rgba(74, 222, 128, 0.22)',
  hotPink: '#f472b6',
  hotPinkBright: '#ec4899',
  hotPinkGlow: 'rgba(244, 114, 182, 0.2)',
  /** CTA / filled buttons — WCAG AA with white text */
  primary: '#a21caf',
  primaryForeground: '#ffffff',
  destructive: '#dc2626',
} as const;

/** @deprecated Use COLOR_VALUES — kept for existing imports */
export const BRAND_COLORS = {
  void: COLOR_VALUES.void,
  background: COLOR_VALUES.background,
  signalPurple: COLOR_VALUES.signalPurple,
  signalPurpleBright: COLOR_VALUES.signalPurpleBright,
  neonGreen: COLOR_VALUES.neonGreen,
  neonGreenDim: COLOR_VALUES.neonGreenDim,
  hotPink: COLOR_VALUES.hotPink,
  hotPinkBright: COLOR_VALUES.hotPinkBright,
} as const;
