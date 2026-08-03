const MOBILE_BREAKPOINT = 768;

/** True when viewport is below mobile breakpoint (768px). Use for performance optimizations. */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

/**
 * iPhone / iPad / iPod (including iPadOS desktop UA).
 * WebKit restricts background WebAudio; keep audible playback on a plain
 * HTMLAudioElement and skip createMediaElementSource on these devices.
 */
export function isAppleTouchDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ may report as MacIntel with touch
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
}
