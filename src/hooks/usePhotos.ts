/**
 * Photos Data Hook
 *
 * Manages photo gallery with Supabase.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Photo, PhotoInsert, PhotoUpdate } from '../types/database';

export interface UsePhotosReturn {
  photos: Photo[];
  loading: boolean;
  error: Error | null;
  fetchPhotos: () => Promise<void>;
  createPhoto: (photo: PhotoInsert) => Promise<Photo>;
  updatePhoto: (id: string, updates: PhotoUpdate) => Promise<Photo>;
  deletePhoto: (id: string) => Promise<void>;
}

export function usePhotos(): UsePhotosReturn {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('photos')
        .select('*')
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;
      setPhotos(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPhoto = useCallback(async (photo: PhotoInsert): Promise<Photo> => {
    setError(null);
    const { data, error: insertError } = await supabase
      .from('photos')
      .insert(photo)
      .select()
      .single();

    if (insertError) {
      const err = new Error(insertError.message);
      setError(err);
      throw err;
    }
    await fetchPhotos();
    return data;
  }, [fetchPhotos]);

  const updatePhoto = useCallback(
    async (id: string, updates: PhotoUpdate): Promise<Photo> => {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('photos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        const err = new Error(updateError.message);
        setError(err);
        throw err;
      }
      await fetchPhotos();
      return data;
    },
    [fetchPhotos]
  );

  const deletePhoto = useCallback(
    async (id: string): Promise<void> => {
      setError(null);
      const { error: deleteError } = await supabase.from('photos').delete().eq('id', id);
      if (deleteError) {
        const err = new Error(deleteError.message);
        setError(err);
        throw err;
      }
      await fetchPhotos();
    },
    [fetchPhotos]
  );

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return useMemo(
    () => ({
      photos,
      loading,
      error,
      fetchPhotos,
      createPhoto,
      updatePhoto,
      deletePhoto,
    }),
    [photos, loading, error, fetchPhotos, createPhoto, updatePhoto, deletePhoto]
  );
}
