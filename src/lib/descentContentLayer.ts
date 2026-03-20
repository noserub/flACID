/**
 * Z-index ladder while DescentModeEffects are active (effects stay at z-[9990]–z-[9999]).
 * Do not change effect values in DescentModeEffects — lift chrome and content above them instead.
 */
export const DESCENT_EFFECTS_CEILING_Z = 9999;

/** Section copy / interactive blocks above Descent overlays */
export const DESCENT_CONTENT_LIFT = 'relative z-[10000]';

/** Fixed header strip (SiteHeader); above page content */
export const DESCENT_CHROME_LIFT = 'z-[10020]';

/** Portaled menus & popovers from header (must beat effects; typically above chrome) */
export const DESCENT_MENU_PORTAL_LIFT = 'z-[10030]';

/** Fullscreen music player uses createPortal(document.body) + z-[9980] so Descent effects stay visually above the viz */
