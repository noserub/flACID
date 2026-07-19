import { registerAudioContext } from './audioContextManager';

/** Shared AudioContext so analyser stays valid across StrictMode remounts */
let sharedAudioContext: AudioContext | null = null;

/** createMediaElementSource may only be called once per HTMLMediaElement */
const mediaElementSourceByAudio = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();

export function getOrCreatePlaybackAudioContext(): AudioContext | null {
  const AudioContextConstructor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return null;

  const ctx =
    sharedAudioContext && sharedAudioContext.state !== 'closed'
      ? sharedAudioContext
      : new AudioContextConstructor();
  sharedAudioContext = ctx;
  registerAudioContext(ctx);
  return ctx;
}

/**
 * Route playback through Web Audio (analyser → destination).
 * captureStream was tried for Bluetooth pitch stability, but Chrome/mobile often
 * took that branch and stayed silent — MediaElementSource is the reliable path.
 * Volume remains element.volume from PlaybackContext.
 */
export function connectAudioElementToAnalyser(
  audio: HTMLMediaElement,
  analyser: AnalyserNode,
  ctx: AudioContext
): MediaElementAudioSourceNode | null {
  let source = mediaElementSourceByAudio.get(audio) ?? null;
  if (!source) {
    try {
      source = ctx.createMediaElementSource(audio);
      mediaElementSourceByAudio.set(audio, source);
    } catch {
      return null;
    }
  }

  try {
    source.connect(analyser);
    // Always reconnect destination — cleanup disconnects the analyser, and a
    // cached source reconnect without this leaves mobile playback silent.
    analyser.connect(ctx.destination);
  } catch {
    return null;
  }

  return source;
}

export function disconnectAudioElementFromAnalyser(
  source: MediaElementAudioSourceNode | null,
  analyser: AnalyserNode
): void {
  try {
    source?.disconnect();
  } catch {
    /* ignore */
  }
  try {
    analyser.disconnect();
  } catch {
    /* ignore */
  }
}
