/**
 * Shared AudioContext manager for resuming when tab regains visibility or
 * when playback is triggered from lock screen / Media Session (car display, etc).
 * MusicPlayer registers the context; PlaybackContext calls resume when needed.
 * Notifies when context suspends (e.g. screen lock) so UI can sync to paused state.
 */
let sharedContext: AudioContext | null = null;
let onSuspendCallback: (() => void) | null = null;
let stateChangeHandler: (() => void) | null = null;

function handleStateChange(): void {
  const state = sharedContext?.state;
  if (state === 'suspended' || state === 'interrupted') {
    onSuspendCallback?.();
  }
}

export function registerAudioContext(ctx: AudioContext | null): void {
  if (sharedContext && stateChangeHandler) {
    sharedContext.removeEventListener('statechange', stateChangeHandler);
    stateChangeHandler = null;
  }
  sharedContext = ctx;
  if (ctx) {
    stateChangeHandler = handleStateChange;
    ctx.addEventListener('statechange', stateChangeHandler);
  }
}

export function registerOnSuspend(callback: (() => void) | null): void {
  onSuspendCallback = callback;
}

export async function resumeAudioContext(): Promise<boolean> {
  const state = sharedContext?.state;
  if (state === 'suspended' || state === 'interrupted') {
    await sharedContext!.resume();
    return true;
  }
  return false;
}
