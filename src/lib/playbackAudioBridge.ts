import { registerAudioContext } from './audioContextManager';

/** Shared AudioContext so analyser stays valid across StrictMode remounts */
let sharedAudioContext: AudioContext | null = null;

/** createMediaElementSource may only be called once per HTMLMediaElement */
const mediaElementSourceByAudio = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();

/** Silent sink so the analysis graph runs without producing audible output */
const silentGainByContext = new WeakMap<AudioContext, GainNode>();

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
 * Tear down the analysis graph. The audible HTMLAudioElement is never part of
 * this graph (dual-element architecture), so background / lock-screen playback
 * is unaffected.
 *
 * After close(), createMediaElementSource cannot be reused on the same analysis
 * element — remount that node before reconnecting.
 */
export function resetPlaybackAudioBridge(): void {
  const ctx = sharedAudioContext;
  sharedAudioContext = null;
  registerAudioContext(null);
  if (ctx && ctx.state !== 'closed') {
    try {
      void ctx.close();
    } catch {
      /* ignore */
    }
  }
}

/**
 * Wire an *analysis-only* media element into Web Audio for visualizers.
 * Audible playback must use a separate HTMLAudioElement that is never passed here
 * (iOS suspends AudioContext in background / under lock and kills Web Audio output).
 *
 * Graph: source → analyser → gain(0) → destination
 */
export function connectAudioElementToAnalyser(
  audio: HTMLMediaElement,
  analyser: AnalyserNode,
  ctx: AudioContext
): MediaElementAudioSourceNode | null {
  if (ctx.state === 'closed') return null;

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
    let silentGain = silentGainByContext.get(ctx);
    if (!silentGain) {
      silentGain = ctx.createGain();
      silentGain.gain.value = 0;
      silentGainByContext.set(ctx, silentGain);
      silentGain.connect(ctx.destination);
    }
    analyser.connect(silentGain);
  } catch {
    return null;
  }

  return source;
}

export function disconnectAudioElementFromAnalyser(
  source: MediaElementAudioSourceNode | null,
  analyser: AnalyserNode | null
): void {
  try {
    source?.disconnect();
  } catch {
    /* ignore */
  }
  try {
    analyser?.disconnect();
  } catch {
    /* ignore */
  }
}
