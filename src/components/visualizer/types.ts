/**
 * Visualizer Types
 */

import type { Particle } from './Particle';

export interface EQBands {
  subBass: number;
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  high: number;
  presence: number;
  energy: number;
}

/**
 * Shared rhythm / intensity signals for all visualizations (Direction A: music motion bus).
 * Updated each frame while playing; optional when idle.
 */
export interface MusicMotionSnapshot {
  /** 0–1 linear phase since last detected onset (groove-locked when confident) */
  beatPhase: number;
  /** Estimated ms between beats — clamped for stability */
  groovePeriodMs: number;
  /** 0–1 stability of recent inter-onset spacing (higher = trust beatPhase) */
  grooveConfidence: number;
  /** 0–1 loudness context (smoothed band mean) */
  intensityNorm: number;
  /** 0–1 slow spectral envelope */
  slowIntensity: number;
  /** 0–1 fast spectral envelope */
  fastIntensity: number;
  /** 0–1 transient accent (same family as former beatPulse) */
  pulse: number;
}

export interface VisualizerDrawOptions {
  particles?: Particle[];
  isPlaying?: boolean;
  /** Rhythm + intensity bus — use for tempo-feel without duplicating logic per viz */
  motion?: MusicMotionSnapshot;
}

export type DrawVisualization = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dataArray: Uint8Array,
  eq: EQBands,
  time: number,
  bufferLength: number,
  options?: VisualizerDrawOptions
) => void;
