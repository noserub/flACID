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
