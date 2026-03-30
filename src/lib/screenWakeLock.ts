/**
 * Screen Wake Lock — keeps the display on while playing or fullscreen (Chrome, Edge, Firefox, Safari where supported).
 * Browsers release the lock when the tab is hidden; callers should re-request when visible again.
 */

export function isScreenWakeLockSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

export async function requestScreenWakeLock(): Promise<WakeLockSentinel | null> {
  if (!isScreenWakeLockSupported()) return null;
  try {
    return await navigator.wakeLock.request('screen');
  } catch {
    return null;
  }
}

export async function releaseScreenWakeLock(sentinel: WakeLockSentinel | null): Promise<void> {
  if (!sentinel) return;
  try {
    await sentinel.release();
  } catch {
    /* already released */
  }
}
