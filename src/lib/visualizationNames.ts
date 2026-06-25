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
  'Resonant Cymatics',
  'Prism Spectrum',
  'Metaballs',
  'Reaction Diffusion',
  'Pulse Horizon',
  'Light Speed Warp',
  'Tron Corridor',
  'Lite-Brite Magic',
  'Neon Tunnel 3D',
] as const;

export function normalizeVisualizationId(id: number | undefined): number {
  return (id ?? 0) % VISUALIZATION_NAMES.length;
}

export interface VizTrackRef {
  index: number;
  title: string;
}

/** Tracks assigned to a given visualization index, in playlist order. */
export function getTracksForVisualization(
  tracks: { title?: string; visualizationId?: number }[],
  vizId: number
): VizTrackRef[] {
  return tracks
    .map((track, index) => {
      if (normalizeVisualizationId(track.visualizationId) !== vizId) return null;
      return {
        index,
        title: track.title?.trim() || `Track ${index + 1}`,
      };
    })
    .filter((ref): ref is VizTrackRef => ref !== null);
}

/** Short label for grid cards — one title or "First + N more". */
export function formatVizTrackCardLabel(refs: VizTrackRef[]): string {
  if (refs.length === 0) return '';
  if (refs.length === 1) return refs[0].title;
  return `${refs[0].title} + ${refs.length - 1} more`;
}

/** Unique viz indices assigned to at least one track, in catalog (playlist) order. */
export function getTrackMappedVisualizationIds(
  tracks: { visualizationId?: number }[]
): number[] {
  const seen = new Set<number>();
  const ids: number[] = [];
  for (const track of tracks) {
    const vizId = normalizeVisualizationId(track.visualizationId);
    if (seen.has(vizId)) continue;
    seen.add(vizId);
    ids.push(vizId);
  }
  return ids;
}

export function visualizationHue(index: number): number {
  return (260 + (index * 37) % 120) % 360;
}
