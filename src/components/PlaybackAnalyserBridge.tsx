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
 *
 * While AirPlay / Remote Playback is active, Web Audio is intentionally skipped
 * so the <audio> element keeps its native output path (avoids pitch/speed drift).
 */
export function PlaybackAnalyserBridge() {
  const {
    audioRef,
    currentTrackData,
    isAudioReady,
    isPlaying,
    currentTime,
    currentTrack,
    setAnalyser,
    isExternalAudioRoute,
    audioRouteEpoch,
  } = usePlayback();
  const { registerAnalyser, registerPlaybackState } = useDescentIntensity();

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [analyserForViz, setAnalyserForViz] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (isExternalAudioRoute) {
      disconnectAudioElementFromAnalyser(sourceRef.current, analyserRef.current);
      sourceRef.current = null;
      analyserRef.current = null;
      audioContextRef.current = null;
      setAnalyserForViz(null);
      setAnalyser(null);
      return;
    }

    const audio = audioRef?.current;
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
      disconnectAudioElementFromAnalyser(source, analyser);
      sourceRef.current = null;
      setAnalyserForViz(null);
      setAnalyser(null);
    };
  }, [
    audioRef,
    audioRouteEpoch,
    currentTrackData?.url,
    isAudioReady,
    isExternalAudioRoute,
    setAnalyser,
  ]);

  useEffect(() => {
    if (isExternalAudioRoute) return;
    if (isPlaying && audioContextRef.current?.state === 'suspended') {
      void audioContextRef.current.resume();
    }
  }, [isPlaying, isExternalAudioRoute]);

  useEffect(() => {
    registerAnalyser(isExternalAudioRoute ? null : analyserForViz ?? analyserRef.current, isPlaying);
  }, [isPlaying, registerAnalyser, analyserForViz, isExternalAudioRoute]);

  useEffect(() => {
    registerPlaybackState(currentTime, currentTrack);
  }, [currentTime, currentTrack, registerPlaybackState]);

  return null;
}
