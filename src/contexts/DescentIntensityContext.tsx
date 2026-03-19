import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
  useRef,
  type MutableRefObject,
} from 'react';
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
  /** Updated every animation frame — use inside RAF loops (canvas) instead of React state. */
  intensityRef: MutableRefObject<IntensityData>;
  registerAnalyser: (analyser: AnalyserNode | null, isPlaying: boolean) => void;
  /**
   * Ref whose `.current` is set each frame by PsychedelicVisualizer (same buffer length as analyser).
   * When set, Descent skips a duplicate getByteFrequencyData and copies this buffer instead.
   */
  registerSharedSpectrum: (ref: MutableRefObject<Uint8Array | null> | null) => void;
}

const DEFAULT_INTENSITY: IntensityData = {
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
};

/** Throttle React re-renders from FFT; RAF readers use intensityRef every frame. */
const REACT_INTENSITY_MIN_MS = 34;

const DescentIntensityContext = createContext<DescentIntensityContextType | undefined>(undefined);

export function DescentIntensityProvider({ children }: { children: ReactNode }) {
  const { isDescentMode } = useDescentMode();
  const [intensity, setIntensity] = useState<IntensityData>(DEFAULT_INTENSITY);
  const intensityRef = useRef<IntensityData>(DEFAULT_INTENSITY);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const isPlayingRef = useRef(false);
  /** Parent-owned ref; `.current` updated by visualizer with latest spectrum bytes */
  const sharedSpectrumBridgeRef = useRef<MutableRefObject<Uint8Array | null> | null>(null);
  const animationRef = useRef<number>();
  /** Smoothed overall energy for transient / “hit” detection */
  const smoothedEnergyRef = useRef(0);
  const transientPeakRef = useRef(0);

  const registerAnalyser = useCallback((analyser: AnalyserNode | null, isPlaying: boolean) => {
    analyserRef.current = analyser;
    isPlayingRef.current = isPlaying;
  }, []);

  const registerSharedSpectrum = useCallback((ref: MutableRefObject<Uint8Array | null> | null) => {
    sharedSpectrumBridgeRef.current = ref;
  }, []);

  useEffect(() => {
    if (!isDescentMode) {
      intensityRef.current = DEFAULT_INTENSITY;
      setIntensity(DEFAULT_INTENSITY);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      smoothedEnergyRef.current = 0;
      transientPeakRef.current = 0;
      return;
    }

    smoothedEnergyRef.current = 0;
    transientPeakRef.current = 0;

    const dataArray = analyserRef.current 
      ? new Uint8Array(analyserRef.current.frequencyBinCount)
      : null;

    let startTime = Date.now();
    // Allow first frame to always emit so UI isn’t stuck on defaults for one throttle window
    let lastReactPush = -REACT_INTENSITY_MIN_MS;

    const updateIntensity = () => {
      const elapsed = (Date.now() - startTime) / 1000; // seconds

      // Ambient swell — slightly narrower range so music reads louder by comparison
      const breathingCycle = 15; // seconds per full breath
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

      // MUSIC REACTIVITY: reuse visualizer spectrum when bridged (one FFT / sim fill per frame)
      if (analyserRef.current && isPlayingRef.current && dataArray) {
        const bridged = sharedSpectrumBridgeRef.current?.current;
        if (bridged && bridged.length === dataArray.length) {
          dataArray.set(bridged);
        } else {
          analyserRef.current.getByteFrequencyData(dataArray);
        }

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

        // Overall energy (weighted toward bass / low-mid for punch)
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

        // Stronger sustained + transient response; extra bass emphasis
        musicBoost = Math.min(
          0.78,
          energy * 0.52 + transient + eqBands.bass * 0.22 + eqBands.subBass * 0.12
        );
      } else {
        smoothedEnergyRef.current *= 0.91;
        transientPeakRef.current *= 0.88;
      }

      // Combine ambient swell with music reactivity
      const totalIntensity = Math.min(baseIntensity + musicBoost, 1.0);

      const packet: IntensityData = {
        baseIntensity,
        musicBoost,
        totalIntensity,
        eqBands,
        energy,
      };
      intensityRef.current = packet;

      const now = performance.now();
      if (now - lastReactPush >= REACT_INTENSITY_MIN_MS) {
        lastReactPush = now;
        setIntensity(packet);
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

  const contextValue = useMemo(
    () => ({
      intensity,
      intensityRef,
      registerAnalyser,
      registerSharedSpectrum,
    }),
    [intensity, registerAnalyser, registerSharedSpectrum]
  );

  return (
    <DescentIntensityContext.Provider value={contextValue}>
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