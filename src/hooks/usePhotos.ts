/**
 * Photos Data Hook
 *
 * Manages photo gallery with Supabase.
 * Uses TanStack Query for caching and deduplication to minimize egress.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { Photo, PhotoInsert, PhotoUpdate } from '../types/database';

const QUERY_KEY = ['photos'] as const;

async function fetchPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('id,url,thumbnail_url,alt_text,photographer,order_index,created_at')
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

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
  const queryClient = useQueryClient();

  const { data: photos = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchPhotos,
  });

  const createMutation = useMutation({
    mutationFn: async (photo: PhotoInsert) => {
      const { data, error: insertError } = await supabase
        .from('photos')
        .insert(photo)
        .select()
        .single();
      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PhotoUpdate }) => {
      const { data, error: updateError } = await supabase
        .from('photos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('photos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    photos,
    loading: isLoading,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    fetchPhotos: refetch,
    createPhoto: (photo) => createMutation.mutateAsync(photo),
    updatePhoto: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deletePhoto: (id) => deleteMutation.mutateAsync(id),
  };
}
