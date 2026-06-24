/**
 * Z-index ladder while DescentModeEffects are active (effects stay at z-[9990]–z-[9999]).
 * Do not change effect values in DescentModeEffects — lift chrome and content above them instead.
 */
export const DESCENT_EFFECTS_CEILING_Z = 9999;

/** Section copy above Descent overlays. Listen Now skips this. useDescentSectionLiftClass() uses z-0 while music fullscreen so the player shell (9980) isn’t covered by z-10000 sections. */
export const DESCENT_CONTENT_LIFT = 'relative z-[10000]';

/** Fixed header strip (SiteHeader); above page content */
export const DESCENT_CHROME_LIFT = 'z-[10020]';

/** Portaled menus & popovers from header (must beat effects; typically above chrome) */
export const DESCENT_MENU_PORTAL_LIFT = 'z-[10030]';

/** In-section edit chrome (visibility, Edit Hero, etc.) — above fixed header (10020) */
export const EDITOR_CHROME_LIFT = 'z-[10050]';

/** Modals (e.g. NewsletterSignup) — above section content (10000), menus (10030), fullscreen controls (10100) */
export const MODAL_PORTAL_LIFT = 'z-[10200]';

/** Fullscreen player: fixed z-[9980] in-tree, below Descend (~9990–9999). */
