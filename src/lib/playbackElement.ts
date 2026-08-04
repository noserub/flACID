/**
 * Document-owned audible media element.
 *
 * Lives outside React so visibility re-renders / StrictMode remounts cannot
 * destroy or replace the node iOS is using for lock-screen / background audio.
 */

let playbackEl: HTMLAudioElement | null = null;

export function getPlaybackElement(): HTMLAudioElement {
  if (typeof document === 'undefined') {
    throw new Error('getPlaybackElement() requires a document');
  }
  if (playbackEl && playbackEl.isConnected) return playbackEl;

  const el = document.createElement('audio');
  el.setAttribute('playsinline', '');
  el.setAttribute('webkit-playsinline', '');
  el.preload = 'auto';
  el.style.display = 'none';
  el.setAttribute('aria-hidden', 'true');
  // Keep in the document for iOS media session association.
  document.body.appendChild(el);
  playbackEl = el;
  return el;
}

export function getPlaybackElementIfAny(): HTMLAudioElement | null {
  return playbackEl;
}
