const MOBILE_BREAKPOINT = 768;

/** True when viewport is below mobile breakpoint (768px). Use for performance optimizations. */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}
