import { VISUALIZATION_NAMES } from './visualizationNames';

export function vizPreviewSlug(index: number): string {
  const name = VISUALIZATION_NAMES[index % VISUALIZATION_NAMES.length]
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${String(index).padStart(2, '0')}-${name}`;
}

export function vizPreviewWebmPath(index: number): string {
  return `/viz-previews/${vizPreviewSlug(index)}.webm`;
}

export function vizPreviewPosterPath(index: number): string {
  return `/viz-previews/${vizPreviewSlug(index)}.png`;
}
