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
  let status =
    d.status === 'sold_out' ||
    d.status === 'cancelled' ||
    d.status === 'selling_fast' ||
    d.status === 'upcoming'
      ? d.status
      : 'upcoming';

  // Backward compatibility: projects without migration 004 reject "selling_fast".
  // Downgrade to "upcoming" so tour edits still persist instead of failing publish.
  if (status === 'selling_fast') {
    status = 'upcoming';
  }

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
    // If RETURNING is empty (RLS/PostgREST edge cases), still trust the ids we upserted so we don't orphan-delete everything
    if (data && data.length > 0) {
      keptIds.push(...data.map((r) => r.id));
    } else {
      keptIds.push(...withId.map((d) => d.id));
    }
  }

  for (const d of withoutId) {
    const { data: inserted, error } = await supabase
      .from('tour_dates')
      .insert(tourRowFromSiteDate(d))
      .select('id');
    if (error) throw error;
    const newId = inserted?.[0]?.id;
    if (newId) keptIds.push(newId);
  }

  // Only prune orphans when we have one id per show (otherwise we might delete good rows)
  const canPruneOrphans = dates.length === 0 || keptIds.length === dates.length;

  const { data: allRows, error: listError } = await supabase.from('tour_dates').select('id');
  if (listError) throw listError;

  const orphanIds = (allRows ?? []).map((r) => r.id).filter((id) => !keptIds.includes(id));
  if (canPruneOrphans && orphanIds.length > 0) {
    const { error: deleteError } = await supabase.from('tour_dates').delete().in('id', orphanIds);
    if (deleteError) throw deleteError;
  } else if (!canPruneOrphans && orphanIds.length > 0) {
    console.warn(
      '[contentSync] tour_dates: skipped orphan cleanup (could not confirm all row ids after insert). Check RLS SELECT after INSERT.'
    );
  }
}

/** site_settings columns added in migration 004 — omit if DB not migrated yet */
const SITE_SETTINGS_OPTIONAL_KEYS = ['tour_subtitle', 'tour_footer_note', 'gallery_subtitle'] as const;

function stripOptionalSiteSettingsKeys(
  row: Record<string, unknown>
): Record<string, unknown> {
  const next = { ...row };
  for (const k of SITE_SETTINGS_OPTIONAL_KEYS) {
    delete next[k];
  }
  return next;
}

function isMissingColumnSiteSettingsError(error: {
  message?: string;
  code?: string;
  details?: string;
} | null): boolean {
  if (!error) return false;
  const blob = `${error.message ?? ''} ${error.details ?? ''} ${error.code ?? ''}`.toLowerCase();
  if (blob.includes('tour_subtitle') || blob.includes('gallery_subtitle') || blob.includes('tour_footer_note')) {
    return true;
  }
  if (blob.includes('does not exist') && blob.includes('column')) return true;
  if (blob.includes('could not find') && blob.includes('column')) return true;
  return false;
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

  // 1. Upsert site_settings (retry without 004-only columns if project hasn't run that migration)
  const settingsRow = {
    id: 'default' as const,
    ...siteSettings,
    updated_at: new Date().toISOString(),
  };

  let settingsError = (
    await supabase.from('site_settings').upsert(settingsRow, { onConflict: 'id' })
  ).error;

  if (settingsError && isMissingColumnSiteSettingsError(settingsError)) {
    console.warn(
      '[contentSync] site_settings upsert missing optional columns; retrying without tour_subtitle / tour_footer_note / gallery_subtitle. Run migration 004 for full support.'
    );
    settingsError = (
      await supabase
        .from('site_settings')
        .upsert(stripOptionalSiteSettingsKeys(settingsRow as Record<string, unknown>), {
          onConflict: 'id',
        })
    ).error;
  }

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
