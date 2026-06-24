/** Human-readable labels for each visualization mode (index-aligned). */
export const VISUALIZATION_NAMES = [
  'Organic Flow',
  'Depth Layers',
  'Waveform Interference',
  'Minimal Geometric',
  'Atmospheric Noise',
  'Kaleidoscope Fractals',
  'Liquid Plasma',
  'Neon Grid',
  'Spiral Galaxy',
  'Crystal Lattice',
  'Breathing Mandala',
  'IFS Kaleidoscope',
  'Prism Spectrum',
  'Metaballs',
  'Reaction Diffusion',
  'Pulse Horizon',
  'Light Speed Warp',
  'Tron Corridor',
  'Lite-Brite Magic',
  'Neon Tunnel 3D',
] as const;

export function visualizationHue(index: number): number {
  return (260 + (index * 37) % 120) % 360;
}
