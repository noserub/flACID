import { registerAudioContext } from './audioContextManager';

/** Shared AudioContext so analyser stays valid across StrictMode remounts */
let sharedAudioContext: AudioContext | null = null;

/** One analyser tap per HTMLMediaElement (captureStream or legacy element source). */
const analyserSourceByAudio = new WeakMap<HTMLMediaElement, AudioNode>();

type CaptureStreamCapable = HTMLMediaElement & {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
};

function getCaptureStream(audio: HTMLMediaElement): MediaStream | null {
  const el = audio as CaptureStreamCapable;
  try {
    if (typeof el.captureStream === 'function') return el.captureStream();
    if (typeof el.mozCaptureStream === 'function') return el.mozCaptureStream();
  } catch {
    /* ignore */
  }
  return null;
}

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
 * Tap the media element for visualization without routing audible output through Web Audio.
 * Native element playback avoids Bluetooth / car-audio sample-rate resampling (pitch shift).
 */
export function connectAudioElementToAnalyser(
  audio: HTMLMediaElement,
  analyser: AnalyserNode,
  ctx: AudioContext
): AudioNode | null {
  let source = analyserSourceByAudio.get(audio) ?? null;
  if (source) {
    try {
      source.connect(analyser);
    } catch {
      return null;
    }
    return source;
  }

  const stream = getCaptureStream(audio);
  if (stream) {
    try {
      source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserSourceByAudio.set(audio, source);
      return source;
    } catch {
      /* fall through to legacy path */
    }
  }

  // Legacy fallback: audible output must pass through the AudioContext graph.
  try {
    const elementSource = ctx.createMediaElementSource(audio);
    elementSource.connect(analyser);
    analyser.connect(ctx.destination);
    analyserSourceByAudio.set(audio, elementSource);
    return elementSource;
  } catch {
    return null;
  }
}

export function disconnectAudioElementFromAnalyser(
  source: AudioNode | null,
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
