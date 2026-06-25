import { VISUALIZATION_NAMES } from './visualizationNames';

/** Older slug filenames still on disk after a viz rename (index → slug without extension). */
const LEGACY_VIZ_PREVIEW_SLUGS: Partial<Record<number, string>> = {
  11: '11-ifs-kaleidoscope',
};

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

export function vizPreviewPosterFallbackPath(index: number): string | null {
  const legacy = LEGACY_VIZ_PREVIEW_SLUGS[index];
  return legacy ? `/viz-previews/${legacy}.png` : null;
}
