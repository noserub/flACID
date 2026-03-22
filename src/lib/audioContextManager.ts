/**
 * Shared AudioContext manager for resuming when tab regains visibility or
 * when playback is triggered from lock screen / Media Session (car display, etc).
 * MusicPlayer registers the context; PlaybackContext calls resume when needed.
 */
let sharedContext: AudioContext | null = null;

export function registerAudioContext(ctx: AudioContext | null): void {
  sharedContext = ctx;
}

export async function resumeAudioContext(): Promise<boolean> {
  if (sharedContext?.state === 'suspended') {
    await sharedContext.resume();
    return true;
  }
  return false;
}
