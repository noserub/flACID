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
