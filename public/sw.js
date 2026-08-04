/* Minimal service worker — installability only; v20260804a
 *
 * Do NOT intercept fetch. On iOS, a fetch handler that wraps media requests
 * can stall or abort HTMLAudioElement streaming when the PWA is backgrounded,
 * which stops playback under lock / in the app switcher.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
