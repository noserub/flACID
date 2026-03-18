/**
 * Albums Data Hook
 *
 * Manages discography/albums with Supabase.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Album, AlbumInsert, AlbumUpdate } from '../types/database';

export interface UseAlbumsReturn {
  albums: Album[];
  loading: boolean;
  error: Error | null;
  fetchAlbums: () => Promise<void>;
  createAlbum: (album: AlbumInsert) => Promise<Album>;
  updateAlbum: (id: string, updates: AlbumUpdate) => Promise<Album>;
  deleteAlbum: (id: string) => Promise<void>;
}

export function useAlbums(): UseAlbumsReturn {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('albums')
        .select('*')
        .order('year', { ascending: false });

      if (fetchError) throw fetchError;
      setAlbums(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlbum = useCallback(async (album: AlbumInsert): Promise<Album> => {
    setError(null);
    const { data, error: insertError } = await supabase
      .from('albums')
      .insert(album)
      .select()
      .single();

    if (insertError) {
      const err = new Error(insertError.message);
      setError(err);
      throw err;
    }
    await fetchAlbums();
    return data;
  }, [fetchAlbums]);

  const updateAlbum = useCallback(
    async (id: string, updates: AlbumUpdate): Promise<Album> => {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('albums')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        const err = new Error(updateError.message);
        setError(err);
        throw err;
      }
      await fetchAlbums();
      return data;
    },
    [fetchAlbums]
  );

  const deleteAlbum = useCallback(
    async (id: string): Promise<void> => {
      setError(null);
      const { error: deleteError } = await supabase.from('albums').delete().eq('id', id);
      if (deleteError) {
        const err = new Error(deleteError.message);
        setError(err);
        throw err;
      }
      await fetchAlbums();
    },
    [fetchAlbums]
  );

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const sortedAlbums = useMemo(() => {
    return [...albums].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  }, [albums]);

  return useMemo(
    () => ({
      albums: sortedAlbums,
      loading,
      error,
      fetchAlbums,
      createAlbum,
      updateAlbum,
      deleteAlbum,
    }),
    [sortedAlbums, loading, error, fetchAlbums, createAlbum, updateAlbum, deleteAlbum]
  );
}
