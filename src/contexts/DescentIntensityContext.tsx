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
  const animationRef = useRef<number>();

  // Register the audio analyser from MusicPlayer
  const registerAnalyser = (analyser: AnalyserNode | null, isPlaying: boolean) => {
    analyserRef.current = analyser;
    isPlayingRef.current = isPlaying;
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
      return;
    }

    const dataArray = analyserRef.current 
      ? new Uint8Array(analyserRef.current.frequencyBinCount)
      : null;

    let startTime = Date.now();

    const updateIntensity = () => {
      const elapsed = (Date.now() - startTime) / 1000; // seconds

      // BREATHING PATTERN: 15-second wave cycle
      // Uses a smooth sine wave that oscillates between 0.2 and 0.8
      const breathingCycle = 15; // seconds per full breath
      const breathPhase = (elapsed % breathingCycle) / breathingCycle;
      const baseIntensity = 0.5 + 0.3 * Math.sin(breathPhase * Math.PI * 2);

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

      // MUSIC REACTIVITY: Extract EQ data if music is playing
      if (analyserRef.current && isPlayingRef.current && dataArray) {
        analyserRef.current.getByteFrequencyData(dataArray);

        const bufferLength = dataArray.length;

        // Calculate frequency bands (same as visualizer)
        const getRange = (start: number, end: number) => {
          const startIdx = Math.floor(start * bufferLength);
          const endIdx = Math.floor(end * bufferLength);
          let sum = 0;
          for (let i = startIdx; i < endIdx; i++) {
            sum += dataArray[i];
          }
          return (sum / (endIdx - startIdx)) / 255; // Normalize to 0-1
        };

        eqBands = {
          subBass: getRange(0, 0.05),      // 20-60 Hz
          bass: getRange(0.05, 0.15),      // 60-250 Hz
          lowMid: getRange(0.15, 0.25),    // 250-500 Hz
          mid: getRange(0.25, 0.35),       // 500-2k Hz
          highMid: getRange(0.35, 0.50),   // 2k-4k Hz
          presence: getRange(0.50, 0.70),  // 4k-6k Hz
          brilliance: getRange(0.70, 1.0), // 6k-20k Hz
        };

        // Calculate overall energy (weighted towards bass/mids for heavy music)
        energy = (
          eqBands.subBass * 0.3 +
          eqBands.bass * 0.25 +
          eqBands.lowMid * 0.2 +
          eqBands.mid * 0.15 +
          eqBands.highMid * 0.05 +
          eqBands.presence * 0.03 +
          eqBands.brilliance * 0.02
        );

        // Music boost increases intensity based on energy
        musicBoost = energy * 0.4; // Scale to max 0.4 additional intensity
      }

      // Combine breathing pattern with music reactivity
      const totalIntensity = Math.min(baseIntensity + musicBoost, 1.0);

      setIntensity({
        baseIntensity,
        musicBoost,
        totalIntensity,
        eqBands,
        energy,
      });

      // Debug logging (remove after testing)
      if (Date.now() % 2000 < 16) { // Log approximately every 2 seconds
        console.log('Descent Intensity:', {
          breathing: baseIntensity.toFixed(2),
          music: musicBoost.toFixed(2),
          total: totalIntensity.toFixed(2),
          playing: isPlayingRef.current,
          hasAnalyser: !!analyserRef.current
        });
      }

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
    <DescentIntensityContext.Provider value={{ intensity, registerAnalyser }}>
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