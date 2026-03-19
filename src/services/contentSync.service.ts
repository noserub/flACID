/**
 * Content Sync Service
 *
 * Loads and publishes SiteContent to/from Supabase.
 */

import { supabase } from '../lib/supabaseClient';
import { isSupabaseConfigured } from '../lib/supabase';
import type { SiteContent } from '../contexts/EditModeContext';
import { dbToSiteContent, siteContentToDb, type DbSnapshot } from '../lib/contentMappers';

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

  const { siteSettings, tracks, albums, tourDates, photos } = siteContentToDb(content);

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

  // 4. Replace tour_dates
  const { data: existingTour } = await supabase.from('tour_dates').select('id');
  if (existingTour?.length) {
    const { error: deleteTourError } = await supabase
      .from('tour_dates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteTourError) throw deleteTourError;
  }

  if (tourDates.length > 0) {
    const tourToInsert = tourDates.map((d) => ({
      date: d.date,
      venue: d.venue,
      city: d.city,
      country: d.country || '',
      ticket_url: d.ticket_url,
      status: d.status || 'upcoming',
    }));
    const { error: insertTourError } = await supabase.from('tour_dates').insert(tourToInsert);
    if (insertTourError) throw insertTourError;
  }

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
