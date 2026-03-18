/**
 * Tracks Data Hook
 *
 * Manages music tracks with Supabase. Handles fetch, create, update, delete
 * with proper error handling and loading states.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Track, TrackInsert, TrackUpdate } from '../types/database';

export interface UseTracksReturn {
  tracks: Track[];
  loading: boolean;
  error: Error | null;
  fetchTracks: () => Promise<void>;
  createTrack: (track: TrackInsert) => Promise<Track>;
  updateTrack: (id: string, updates: TrackUpdate) => Promise<Track>;
  deleteTrack: (id: string) => Promise<void>;
}

export function useTracks(): UseTracksReturn {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('tracks')
        .select('*')
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;
      setTracks(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTrack = useCallback(async (track: TrackInsert): Promise<Track> => {
    setError(null);
    const { data, error: insertError } = await supabase
      .from('tracks')
      .insert(track)
      .select()
      .single();

    if (insertError) {
      const err = new Error(insertError.message);
      setError(err);
      throw err;
    }
    await fetchTracks();
    return data;
  }, [fetchTracks]);

  const updateTrack = useCallback(
    async (id: string, updates: TrackUpdate): Promise<Track> => {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('tracks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        const err = new Error(updateError.message);
        setError(err);
        throw err;
      }
      await fetchTracks();
      return data;
    },
    [fetchTracks]
  );

  const deleteTrack = useCallback(
    async (id: string): Promise<void> => {
      setError(null);
      const { error: deleteError } = await supabase.from('tracks').delete().eq('id', id);
      if (deleteError) {
        const err = new Error(deleteError.message);
        setError(err);
        throw err;
      }
      await fetchTracks();
    },
    [fetchTracks]
  );

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  return useMemo(
    () => ({
      tracks,
      loading,
      error,
      fetchTracks,
      createTrack,
      updateTrack,
      deleteTrack,
    }),
    [tracks, loading, error, fetchTracks, createTrack, updateTrack, deleteTrack]
  );
}
