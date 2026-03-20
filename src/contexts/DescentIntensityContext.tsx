import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useDescentMode } from './DescentModeContext';

export interface IntensityData {
  baseIntensity: number; // 0-1, from breathing pattern
  musicBoost: number; // 0-1, from music reactivity
  totalIntensity: number; // Combined intensity
  eqBands: {
    subBass: number;
    bass: number;
    lowMid: number;
    mid: number;
    highMid: number;
    presence: number;
    brilliance: number;
  };
  energy: number; // Overall energy level
}

interface DescentIntensityContextType {
  intensity: IntensityData;
  registerAnalyser: (analyser: AnalyserNode | null, isPlaying: boolean) => void;
  /** For CORS fallback: pass playback position so we can use simulated reactivity */
  registerPlaybackState: (currentTimeSeconds: number, trackIndex: number) => void;
}

const DescentIntensityContext = createContext<DescentIntensityContextType | undefined>(undefined);

export function DescentIntensityProvider({ children }: { children: ReactNode }) {
  const { isDescentMode } = useDescentMode();
  const [intensity, setIntensity] = useState<IntensityData>({
    baseIntensity: 0.3,
    musicBoost: 0,
    totalIntensity: 0.3,
    eqBands: {
      subBass: 0,
      bass: 0,
      lowMid: 0,
      mid: 0,
      highMid: 0,
      presence: 0,
      brilliance: 0,
    },
    energy: 0,
  });

  const analyserRef = useRef<AnalyserNode | null>(null);
  const isPlayingRef = useRef(false);
  const playbackStateRef = useRef({ currentTimeSeconds: 0, trackIndex: 0 });
  const animationRef = useRef<number>();
  const zeroCountRef = useRef(0);
  const useSimulationRef = useRef(false);
  /** Smoothed overall energy for transient / “hit” detection */
  const smoothedEnergyRef = useRef(0);
  const transientPeakRef = useRef(0);

  // Register the audio analyser from MusicPlayer
  const registerAnalyser = (analyser: AnalyserNode | null, isPlaying: boolean) => {
    analyserRef.current = analyser;
    isPlayingRef.current = isPlaying;
    if (!analyser) {
      useSimulationRef.current = false;
      zeroCountRef.current = 0;
    }
  };

  const registerPlaybackState = (currentTimeSeconds: number, trackIndex: number) => {
    playbackStateRef.current = { currentTimeSeconds, trackIndex };
  };

  useEffect(() => {
    if (!isDescentMode) {
      // Reset to default when not in descent mode
      setIntensity({
        baseIntensity: 0.3,
        musicBoost: 0,
        totalIntensity: 0.3,
        eqBands: {
          subBass: 0,
          bass: 0,
          lowMid: 0,
          mid: 0,
          highMid: 0,
          presence: 0,
          brilliance: 0,
        },
        energy: 0,
      });
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      smoothedEnergyRef.current = 0;
      transientPeakRef.current = 0;
      zeroCountRef.current = 0;
      useSimulationRef.current = false;
      return;
    }

    smoothedEnergyRef.current = 0;
    transientPeakRef.current = 0;
    zeroCountRef.current = 0;

    const dataArray = analyserRef.current
      ? new Uint8Array(analyserRef.current.frequencyBinCount)
      : null;

    let startTime = Date.now();
    const ZERO_THRESHOLD = 30; // Frames of zeros before switching to simulation

    const computeSimulatedBoost = () => {
      const { currentTimeSeconds, trackIndex } = playbackStateRef.current;
      const musicTime = currentTimeSeconds * 1000;
      const phrase = Math.floor(musicTime / 4000) % 4;
      const beat = (musicTime % 1000) / 1000;
      const tempo = 0.02;
      let dynamicMultiplier = 1.0;
      if (phrase === 0) dynamicMultiplier = 0.7 + beat * 0.3;
      else if (phrase === 1) dynamicMultiplier = 0.7 + (musicTime % 4000) / 4000 * 0.6;
      else if (phrase === 2) dynamicMultiplier = 1.3 + Math.sin(beat * Math.PI * 2) * 0.2;
      else dynamicMultiplier = 0.8 + Math.sin(beat * Math.PI * 4) * 0.4;
      const base = 0.35 * dynamicMultiplier;
      return Math.min(0.6, base);
    };

    const updateIntensity = () => {
      const elapsed = (Date.now() - startTime) / 1000;

      const breathingCycle = 15;
      const breathPhase = (elapsed % breathingCycle) / breathingCycle;
      const baseIntensity = 0.4 + 0.22 * Math.sin(breathPhase * Math.PI * 2);

      let musicBoost = 0;
      let eqBands = {
        subBass: 0,
        bass: 0,
        lowMid: 0,
        mid: 0,
        highMid: 0,
        presence: 0,
        brilliance: 0,
      };
      let energy = 0;

      if (analyserRef.current && isPlayingRef.current && dataArray) {
        analyserRef.current.getByteFrequencyData(dataArray);

        const bufferLength = dataArray.length;
        let totalSum = 0;
        const getRange = (start: number, end: number) => {
          const startIdx = Math.floor(start * bufferLength);
          const endIdx = Math.floor(end * bufferLength);
          let sum = 0;
          for (let i = startIdx; i < endIdx; i++) {
            sum += dataArray[i];
            totalSum += dataArray[i];
          }
          return (sum / (endIdx - startIdx)) / 255;
        };

        eqBands = {
          subBass: getRange(0, 0.05),
          bass: getRange(0.05, 0.15),
          lowMid: getRange(0.15, 0.25),
          mid: getRange(0.25, 0.35),
          highMid: getRange(0.35, 0.50),
          presence: getRange(0.50, 0.70),
          brilliance: getRange(0.70, 1.0),
        };

        const isAllZeros = totalSum < 100;
        if (isAllZeros) {
          zeroCountRef.current += 1;
          if (zeroCountRef.current >= ZERO_THRESHOLD) {
            useSimulationRef.current = true;
          }
        } else {
          zeroCountRef.current = 0;
          useSimulationRef.current = false;
        }

        if (useSimulationRef.current) {
          musicBoost = computeSimulatedBoost();
          energy = musicBoost;
        } else {
          energy = (
            eqBands.subBass * 0.32 +
            eqBands.bass * 0.28 +
            eqBands.lowMid * 0.18 +
            eqBands.mid * 0.12 +
            eqBands.highMid * 0.05 +
            eqBands.presence * 0.03 +
            eqBands.brilliance * 0.02
          );
          const sm = smoothedEnergyRef.current;
          smoothedEnergyRef.current = sm * 0.8 + energy * 0.2;
          const rise = Math.max(0, energy - smoothedEnergyRef.current);
          transientPeakRef.current = Math.max(transientPeakRef.current * 0.86, rise * 1.35);
          const transient = Math.min(0.48, transientPeakRef.current * 2.4);
          musicBoost = Math.min(
            0.78,
            energy * 0.52 + transient + eqBands.bass * 0.22 + eqBands.subBass * 0.12
          );
        }
      } else if (isPlayingRef.current) {
        useSimulationRef.current = true;
        musicBoost = computeSimulatedBoost();
        energy = musicBoost;
      } else {
        smoothedEnergyRef.current *= 0.91;
        transientPeakRef.current *= 0.88;
      }

      // Combine ambient swell with music reactivity
      const totalIntensity = Math.min(baseIntensity + musicBoost, 1.0);

      setIntensity({
        baseIntensity,
        musicBoost,
        totalIntensity,
        eqBands,
        energy,
      });

      animationRef.current = requestAnimationFrame(updateIntensity);
    };

    updateIntensity();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDescentMode]);

  return (
    <DescentIntensityContext.Provider value={{ intensity, registerAnalyser, registerPlaybackState }}>
      {children}
    </DescentIntensityContext.Provider>
  );
}

export function useDescentIntensity() {
  const context = useContext(DescentIntensityContext);
  if (!context) {
    throw new Error('useDescentIntensity must be used within DescentIntensityProvider');
  }
  return context;
}