/**
 * Content Sync Service
 *
 * Loads and publishes SiteContent to/from Supabase.
 */

import { supabase } from '../lib/supabaseClient';
import { isSupabaseConfigured } from '../lib/supabase';
import type { SiteContent } from '../contexts/EditModeContext';
import { dbToSiteContent, siteContentToDb, type DbSnapshot } from '../lib/contentMappers';

/** Postgres UUID (avoids treating legacy numeric string ids like "1" as UUIDs). */
function isDatabaseUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Ensure DATE column always gets YYYY-MM-DD (invalid/empty was breaking publish after delete-all). */
function normalizeTourDateForDb(raw: string): string {
  const t = (raw || '').trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  const parsed = new Date(raw.includes('T') ? raw : `${raw}T12:00:00`);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function tourRowFromSiteDate(d: SiteContent['tour']['dates'][number]) {
  const status =
    d.status === 'sold_out' ||
    d.status === 'cancelled' ||
    d.status === 'selling_fast' ||
    d.status === 'upcoming'
      ? d.status
      : 'upcoming';

  return {
    date: normalizeTourDateForDb(d.date),
    venue: (d.venue ?? '').trim() || 'TBA',
    city: (d.city ?? '').trim() || 'TBA',
    country: '',
    ticket_url:
      d.ticketUrl && d.ticketUrl.trim() && d.ticketUrl !== '#' ? d.ticketUrl.trim() : null,
    status,
  };
}

/**
 * Sync tour_dates without delete-all-first (which wiped rows when insert failed).
 * Upsert rows with real UUIDs; insert new rows for legacy string ids; remove orphans.
 */
async function replaceTourDatesFromSiteContent(content: SiteContent): Promise<void> {
  const dates = content.tour.dates;
  const keptIds: string[] = [];

  const withId = dates.filter((d) => isDatabaseUuid(d.id));
  const withoutId = dates.filter((d) => !isDatabaseUuid(d.id));

  if (withId.length > 0) {
    const rows = withId.map((d) => ({ id: d.id, ...tourRowFromSiteDate(d) }));
    const { data, error } = await supabase.from('tour_dates').upsert(rows, { onConflict: 'id' }).select('id');
    if (error) throw error;
    keptIds.push(...(data ?? []).map((r) => r.id));
  }

  for (const d of withoutId) {
    const { data, error } = await supabase
      .from('tour_dates')
      .insert(tourRowFromSiteDate(d))
      .select('id')
      .single();
    if (error) throw error;
    if (data?.id) keptIds.push(data.id);
  }

  const { data: allRows, error: listError } = await supabase.from('tour_dates').select('id');
  if (listError) throw listError;

  const orphanIds = (allRows ?? []).map((r) => r.id).filter((id) => !keptIds.includes(id));
  if (orphanIds.length > 0) {
    const { error: deleteError } = await supabase.from('tour_dates').delete().in('id', orphanIds);
    if (deleteError) throw deleteError;
  }
}

export async function loadContentFromSupabase(
  defaultContent: SiteContent
): Promise<SiteContent> {
  if (!isSupabaseConfigured) return defaultContent;

  try {
    const [settingsRes, tracksRes, albumsRes, tourRes, photosRes] = await Promise.all([
      supabase.from('site_settings').select('*').eq('id', 'default').single(),
      supabase.from('tracks').select('*').order('order_index'),
      supabase.from('albums').select('*').order('order_index'),
      supabase.from('tour_dates').select('*').order('date'),
      supabase.from('photos').select('*').order('order_index'),
    ]);

    if (settingsRes.error && settingsRes.error.code !== 'PGRST116') {
      console.error('[contentSync] Failed to load site_settings:', settingsRes.error);
      return defaultContent;
    }

    const siteSettings = settingsRes.data || {
      hero: {},
      about: {},
      listen_now: {},
      footer: {},
      discography_title: 'Journey',
      tour_title: 'Tour Dates',
      tour_subtitle: '',
      tour_footer_note: 'More dates to be announced soon',
      gallery_title: 'Gallery',
      gallery_subtitle: '',
      section_visibility: {},
      gallery_tabs: [],
    };

    const db: DbSnapshot = {
      siteSettings: siteSettings as DbSnapshot['siteSettings'],
      tracks: tracksRes.data || [],
      albums: albumsRes.data || [],
      tourDates: tourRes.data || [],
      photos: photosRes.data || [],
    };

    return dbToSiteContent(db, defaultContent);
  } catch (err) {
    console.error('[contentSync] Load failed:', err);
    return defaultContent;
  }
}

export async function publishContentToSupabase(content: SiteContent): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured');
  }

  const { siteSettings, tracks, albums, photos } = siteContentToDb(content);

  // 1. Upsert site_settings
  const { error: settingsError } = await supabase
    .from('site_settings')
    .upsert(
      {
        id: 'default',
        ...siteSettings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

  if (settingsError) throw settingsError;

  // 2. Replace tracks (delete all, insert new)
  const { data: existingTracks } = await supabase.from('tracks').select('id');
  if (existingTracks?.length) {
    const { error: deleteTracksError } = await supabase
      .from('tracks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteTracksError) throw deleteTracksError;
  }

  if (tracks.length > 0) {
    const tracksToInsert = tracks.map((t) => ({
      title: t.title,
      artist: t.artist,
      album: t.album,
      duration: t.duration,
      audio_url: (t.audio_url as string) || '',
      visualization_type: (t.visualization_type as string) || 'flowField',
      order_index: t.order_index,
    }));
    const { error: insertTracksError } = await supabase.from('tracks').insert(tracksToInsert);
    if (insertTracksError) throw insertTracksError;
  }

  // 3. Replace albums
  const { data: existingAlbums } = await supabase.from('albums').select('id');
  if (existingAlbums?.length) {
    const { error: deleteAlbumsError } = await supabase
      .from('albums')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteAlbumsError) throw deleteAlbumsError;
  }

  if (albums.length > 0) {
    const albumsToInsert = albums.map((a) => ({
      title: a.title,
      artist: a.artist,
      year: a.year,
      cover_image_url: (a.cover_image_url as string) || '',
      description: a.description,
      track_names: a.track_names,
      order_index: a.order_index,
    }));
    const { error: insertAlbumsError } = await supabase.from('albums').insert(albumsToInsert);
    if (insertAlbumsError) throw insertAlbumsError;
  }

  // 4. Sync tour_dates (upsert + insert + orphan delete — avoids empty table on failed insert)
  await replaceTourDatesFromSiteContent(content);

  // 5. Replace photos
  const { data: existingPhotos } = await supabase.from('photos').select('id');
  if (existingPhotos?.length) {
    const { error: deletePhotosError } = await supabase
      .from('photos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deletePhotosError) throw deletePhotosError;
  }

  if (photos.length > 0) {
    const photosToInsert = photos.map((p) => ({
      url: p.url as string,
      thumbnail_url: (p.thumbnail_url as string) || (p.url as string),
      alt_text: p.alt_text,
      tab_id: p.tab_id,
      caption: p.caption,
      order_index: p.order_index,
    }));
    const { error: insertPhotosError } = await supabase.from('photos').insert(photosToInsert);
    if (insertPhotosError) throw insertPhotosError;
  }
}
