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

export interface VisualizerDrawOptions {
  particles?: Particle[];
  isPlaying?: boolean;
  /** 0–1, spikes on transients (kicks, snare) — use for rhythmic accents */
  beatPulse?: number;
  /** 0–1, higher = softer moment — use for breath/calm modulation */
  calm?: number;
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
