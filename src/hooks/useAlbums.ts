/**
 * Albums Data Hook
 *
 * Manages discography/albums with Supabase.
 * Uses TanStack Query for caching and deduplication to minimize egress.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { Album, AlbumInsert, AlbumUpdate } from '../types/database';

const QUERY_KEY = ['albums'] as const;

async function fetchAlbums(): Promise<Album[]> {
  const { data, error } = await supabase
    .from('albums')
    .select('id,title,artist,year,cover_image_url,description,spotify_url,apple_music_url,bandcamp_url,order_index,created_at,updated_at')
    .order('year', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

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
  const queryClient = useQueryClient();

  const { data: albums = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAlbums,
  });

  const createMutation = useMutation({
    mutationFn: async (album: AlbumInsert) => {
      const { data, error: insertError } = await supabase
        .from('albums')
        .insert(album)
        .select()
        .single();
      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AlbumUpdate }) => {
      const { data, error: updateError } = await supabase
        .from('albums')
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
      const { error } = await supabase.from('albums').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const sortedAlbums = [...albums].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  return {
    albums: sortedAlbums,
    loading: isLoading,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    fetchAlbums: refetch,
    createAlbum: async (album) => {
      const result = await createMutation.mutateAsync(album);
      return result;
    },
    updateAlbum: async (id, updates) => {
      const result = await updateMutation.mutateAsync({ id, updates });
      return result;
    },
    deleteAlbum: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
  };
}
