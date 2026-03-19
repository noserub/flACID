/**
 * DescentModeEffects use fixed layers at z-[20]–z-[30] (see DescentModeEffects.tsx).
 * Apply this to headings, body copy, media, and primary actions so they stay readable
 * and clickable while full-bleed effects remain visible behind/around them.
 * Stays below SiteHeader (z-100+) and portaled modals.
 */
export const DESCENT_CONTENT_LIFT = 'relative z-[35]';
