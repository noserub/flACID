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
 * Always-mounted bridge: wires the global audio element to a Web Audio analyser
 * so Hero Stage can share visualization before Discography lazy-loads.
 */
export function PlaybackAnalyserBridge() {
  const { audioRef, currentTrackData, isAudioReady, isPlaying, currentTime, currentTrack, setAnalyser } =
    usePlayback();
  const { registerAnalyser, registerPlaybackState } = useDescentIntensity();

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [analyserForViz, setAnalyserForViz] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (audioContextRef.current && analyserRef.current) return;
    const ctx = getOrCreatePlaybackAudioContext();
    if (!ctx) return;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    audioContextRef.current = ctx;
    analyserRef.current = analyser;

    return () => {
      try {
        analyserRef.current?.disconnect();
      } catch {
        /* ignore */
      }
      registerAudioContext(null);
      audioContextRef.current = null;
      analyserRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef?.current;
    const url = currentTrackData?.url?.trim();
    if (!audio || !url || !analyserRef.current || !audioContextRef.current) {
      setAnalyserForViz(null);
      setAnalyser(null);
      return;
    }

    const ctx = audioContextRef.current;
    const analyser = analyserRef.current;
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
      disconnectAudioElementFromAnalyser(source, analyser);
      sourceRef.current = null;
      setAnalyserForViz(null);
      setAnalyser(null);
    };
  }, [audioRef, currentTrackData?.url, isAudioReady, setAnalyser]);

  useEffect(() => {
    if (isPlaying && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [isPlaying]);

  useEffect(() => {
    registerAnalyser(analyserForViz ?? analyserRef.current, isPlaying);
  }, [isPlaying, registerAnalyser, analyserForViz]);

  useEffect(() => {
    registerPlaybackState(currentTime, currentTrack);
  }, [currentTime, currentTrack, registerPlaybackState]);

  return null;
}
