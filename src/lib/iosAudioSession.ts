/**
 * Safari / iOS Audio Session helpers.
 * Setting type to "playback" tells the OS this is music (not ambient UI sound)
 * so background / lock-screen continuation is allowed when the platform supports it.
 *
 * @see https://www.w3.org/TR/audio-session/
 */

type AudioSessionType =
  | 'auto'
  | 'playback'
  | 'transient'
  | 'transient-solo'
  | 'ambient'
  | 'play-and-record';

type NavigatorWithAudioSession = Navigator & {
  audioSession?: {
    type: AudioSessionType;
  };
};

/** Call from a user gesture / play() path before starting music. */
export function activatePlaybackAudioSession(): void {
  if (typeof navigator === 'undefined') return;
  const session = (navigator as NavigatorWithAudioSession).audioSession;
  if (!session) return;
  try {
    if (session.type !== 'playback') {
      session.type = 'playback';
    }
  } catch {
    /* API shape may vary by OS version */
  }
}
