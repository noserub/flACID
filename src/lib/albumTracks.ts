import type { PlayerTrack } from '../contexts/PlaybackContext';

/** Match a discography track name to a playable index in the music catalog. */
export function findPlayableTrackIndex(
  tracks: PlayerTrack[],
  albumTitle: string,
  trackName: string
): number | null {
  const name = trackName.trim().toLowerCase();
  const album = albumTitle.trim().toLowerCase();
  if (!name) return null;

  const inAlbum = tracks.findIndex(
    (t) =>
      t.title.trim().toLowerCase() === name &&
      (!t.album.trim() || t.album.trim().toLowerCase() === album)
  );
  if (inAlbum >= 0) return inAlbum;

  const byTitle = tracks.findIndex((t) => t.title.trim().toLowerCase() === name);
  return byTitle >= 0 ? byTitle : null;
}

export function isTrackStreamable(tracks: PlayerTrack[], index: number | null): boolean {
  if (index == null || index < 0) return false;
  return Boolean(tracks[index]?.url?.trim());
}

/** First streamable track on an album, in track-list order. */
export function findFirstStreamableTrackIndex(
  tracks: PlayerTrack[],
  albumTitle: string,
  trackNames: string[]
): number | null {
  for (const name of trackNames) {
    const index = findPlayableTrackIndex(tracks, albumTitle, name);
    if (isTrackStreamable(tracks, index)) return index;
  }

  const album = albumTitle.trim().toLowerCase();
  if (album) {
    const byAlbumField = tracks.findIndex(
      (t) => Boolean(t.url?.trim()) && t.album.trim().toLowerCase() === album
    );
    if (byAlbumField >= 0) return byAlbumField;
  }

  return null;
}

export function scrollToHeroStage(behavior: ScrollBehavior = 'smooth') {
  document.getElementById('hero-stage')?.scrollIntoView({ behavior, block: 'start' });
}
