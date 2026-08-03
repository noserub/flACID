import { useEffect, useRef, useState } from 'react';
import { useDescentIntensity } from '../contexts/DescentIntensityContext';
import { usePlayback } from '../contexts/PlaybackContext';
import {
  connectAudioElementToAnalyser,
  disconnectAudioElementFromAnalyser,
  getOrCreatePlaybackAudioContext,
} from '../lib/playbackAudioBridge';
import { registerAudioContext } from '../lib/audioContextManager';

/**
 * Wires the *analysis* audio element (not the audible one) to a Web Audio analyser.
 * Audible playback stays on a native HTMLAudioElement so iOS background / lock-screen
 * / CarPlay-style controls keep working when AudioContext suspends.
 */
export function PlaybackAnalyserBridge() {
  const {
    analysisAudioRef,
    currentTrackData,
    isAudioReady,
    isPlaying,
    currentTime,
    currentTrack,
    setAnalyser,
    isAnalysisAudioActive,
    analysisEpoch,
  } = usePlayback();
  const { registerAnalyser, registerPlaybackState } = useDescentIntensity();

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [analyserForViz, setAnalyserForViz] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (!isAnalysisAudioActive) {
      disconnectAudioElementFromAnalyser(sourceRef.current, analyserRef.current);
      sourceRef.current = null;
      analyserRef.current = null;
      audioContextRef.current = null;
      setAnalyserForViz(null);
      setAnalyser(null);
      return;
    }

    const audio = analysisAudioRef?.current;
    const url = currentTrackData?.url?.trim();
    if (!audio || !url || !isAudioReady) {
      setAnalyserForViz(null);
      setAnalyser(null);
      return;
    }

    const ctx = getOrCreatePlaybackAudioContext();
    if (!ctx) {
      setAnalyserForViz(null);
      setAnalyser(null);
      return;
    }

    let analyser = analyserRef.current;
    if (!analyser || audioContextRef.current !== ctx) {
      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      audioContextRef.current = ctx;
      registerAudioContext(ctx);
    }

    const source = connectAudioElementToAnalyser(audio, analyser, ctx);
    if (!source) {
      setAnalyserForViz(null);
      setAnalyser(null);
      return;
    }

    sourceRef.current = source;
    setAnalyserForViz(analyser);
    setAnalyser(analyser);

    return () => {
      try {
        audio.pause();
      } catch {
        /* ignore */
      }
      disconnectAudioElementFromAnalyser(source, analyser);
      sourceRef.current = null;
      setAnalyserForViz(null);
      setAnalyser(null);
    };
  }, [
    analysisAudioRef,
    analysisEpoch,
    currentTrackData?.url,
    isAudioReady,
    isAnalysisAudioActive,
    setAnalyser,
  ]);

  // Start analysis only after MediaElementSource owns the element (silent via gain 0).
  useEffect(() => {
    if (!isAnalysisAudioActive || !analyserForViz) return;
    const audio = analysisAudioRef?.current;
    if (!audio) return;
    if (isPlaying) {
      if (audioContextRef.current?.state === 'suspended') {
        void audioContextRef.current.resume();
      }
      if (audio.paused) {
        void audio.play().catch(() => {});
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, isAnalysisAudioActive, analysisAudioRef, analyserForViz]);

  useEffect(() => {
    registerAnalyser(isAnalysisAudioActive ? analyserForViz ?? analyserRef.current : null, isPlaying);
  }, [isPlaying, registerAnalyser, analyserForViz, isAnalysisAudioActive]);

  useEffect(() => {
    registerPlaybackState(currentTime, currentTrack);
  }, [currentTime, currentTrack, registerPlaybackState]);

  return null;
}
