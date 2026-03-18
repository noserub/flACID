/**
 * Content Mappers
 *
 * Bidirectional mapping between SiteContent (UI) and Supabase database rows.
 */

import type { SiteContent } from '../contexts/EditModeContext';
import type { Track, Album, TourDate, Photo } from '../types/database';

export interface DbSnapshot {
  siteSettings: {
    hero: Record<string, unknown>;
    about: Record<string, unknown>;
    listen_now: Record<string, unknown>;
    footer: Record<string, unknown>;
    discography_title: string;
    tour_title: string;
    gallery_title: string;
    section_visibility: Record<string, boolean>;
    gallery_tabs: Array<{ id: string; name: string; visible: boolean }>;
  };
  tracks: Track[];
  albums: Album[];
  tourDates: TourDate[];
  photos: Photo[];
}

function parseDurationToSeconds(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatDurationFromSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/** Parse visualization_type from DB (handles 'flowField' and non-numeric; returns 0-9). */
export function parseVisualizationId(value: string | undefined): number {
  const n = parseInt(String(value ?? ''), 10);
  return Number.isInteger(n) && n >= 0 && n <= 9 ? n : 0;
}

/** Map database rows to SiteContent */
export function dbToSiteContent(db: DbSnapshot, defaultContent: SiteContent): SiteContent {
  const sectionVisibility = db.siteSettings.section_visibility || {};
  const galleryTabs = db.siteSettings.gallery_tabs || [];

  const hero = (db.siteSettings.hero as SiteContent['hero']) || defaultContent.hero;
  const about = (db.siteSettings.about as SiteContent['about']) || defaultContent.about;
  const listenNow = (db.siteSettings.listen_now as SiteContent['listenNow']) || defaultContent.listenNow;
  const footer = (db.siteSettings.footer as SiteContent['footer']) || defaultContent.footer;

  const albums: SiteContent['discography']['albums'] = db.albums.map((a) => ({
    id: a.id,
    title: a.title,
    year: String(a.year),
    coverImage: a.cover_image_url || '',
    description: a.description || '',
    tracks: Array.isArray(a.track_names) ? a.track_names : [],
  }));

  const tourDates: SiteContent['tour']['dates'] = db.tourDates.map((d) => ({
    id: d.id,
    date: d.date,
    venue: d.venue,
    city: d.city,
    ticketUrl: d.ticket_url || '#',
  }));

  const tabs: SiteContent['gallery']['tabs'] = galleryTabs.length > 0
    ? galleryTabs.map((tab) => {
        const tabPhotos = db.photos.filter((p) => p.tab_id === tab.id);
        return {
          id: tab.id,
          name: tab.name,
          visible: tab.visible,
          images: tabPhotos.map((p) => ({
            id: p.id,
            url: p.url,
            caption: p.caption || p.alt_text || '',
          })),
        };
      })
    : defaultContent.gallery.tabs;

  const tracks: SiteContent['musicPlayer']['tracks'] = db.tracks.map((t, i) => ({
    id: i,
    title: t.title,
    artist: t.artist,
    album: t.album || '',
    duration: formatDurationFromSeconds(t.duration),
    url: t.audio_url,
    visualizationId: parseVisualizationId(t.visualization_type),
  }));

  return {
    hero: { ...defaultContent.hero, ...hero, visible: sectionVisibility.hero ?? hero.visible ?? true },
    about: { ...defaultContent.about, ...about, visible: sectionVisibility.about ?? about.visible ?? true },
    listenNow: { ...defaultContent.listenNow, ...listenNow, visible: sectionVisibility.listenNow ?? true },
    discography: {
      title: db.siteSettings.discography_title || defaultContent.discography.title,
      albums,
      visible: sectionVisibility.discography ?? true,
    },
    tour: {
      title: db.siteSettings.tour_title || defaultContent.tour.title,
      dates: tourDates,
      visible: sectionVisibility.tour ?? true,
    },
    gallery: {
      title: db.siteSettings.gallery_title || defaultContent.gallery.title,
      tabs,
      visible: sectionVisibility.gallery ?? true,
    },
    musicPlayer: { tracks: tracks.length > 0 ? tracks : defaultContent.musicPlayer.tracks },
    footer: { ...defaultContent.footer, ...footer },
  };
}

/** Map SiteContent to database rows for upsert */
export function siteContentToDb(content: SiteContent): {
  siteSettings: Record<string, unknown>;
  tracks: Array<Record<string, unknown>>;
  albums: Array<Record<string, unknown>>;
  tourDates: Array<Record<string, unknown>>;
  photos: Array<Record<string, unknown>>;
} {
  const sectionVisibility = {
    hero: content.hero.visible,
    about: content.about.visible,
    listenNow: content.listenNow.visible,
    discography: content.discography.visible,
    tour: content.tour.visible,
    gallery: content.gallery.visible,
  };

  const galleryTabs = content.gallery.tabs.map((t) => ({
    id: t.id,
    name: t.name,
    visible: t.visible,
  }));

  const tracks = content.musicPlayer.tracks.map((t, i) => ({
    title: t.title,
    artist: t.artist,
    album: t.album || null,
    duration: parseDurationToSeconds(t.duration),
    audio_url: t.url,
    cover_image_url: null,
    visualization_type: String(t.visualizationId || 0),
    order_index: i,
  }));

  const albums = content.discography.albums.map((a, i) => ({
    title: a.title,
    artist: 'FLACID',
    year: parseInt(a.year, 10) || new Date().getFullYear(),
    cover_image_url: a.coverImage || '',
    description: a.description || null,
    track_names: a.tracks || [],
    order_index: i,
  }));

  const tourDates = content.tour.dates.map((d) => ({
    date: d.date,
    venue: d.venue,
    city: d.city,
    country: '',
    ticket_url: d.ticketUrl || null,
    status: 'upcoming' as const,
  }));

  const photos: Array<Record<string, unknown>> = [];
  content.gallery.tabs.forEach((tab) => {
    tab.images.forEach((img, i) => {
      if (img.url) {
        photos.push({
          url: img.url,
          thumbnail_url: img.url,
          alt_text: img.caption || null,
          tab_id: tab.id,
          caption: img.caption || null,
          order_index: i,
        });
      }
    });
  });

  return {
    siteSettings: {
      hero: content.hero,
      about: content.about,
      listen_now: content.listenNow,
      footer: content.footer,
      discography_title: content.discography.title,
      tour_title: content.tour.title,
      gallery_title: content.gallery.title,
      section_visibility: sectionVisibility,
      gallery_tabs: galleryTabs,
    },
    tracks,
    albums,
    tourDates,
    photos,
  };
}
