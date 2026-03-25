/**
 * Tracks Data Hook
 *
 * Manages music tracks with Supabase.
 * Uses TanStack Query for caching and deduplication to minimize egress.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { Track, TrackInsert, TrackUpdate } from '../types/database';

/** Shared with EditModeContext — hydrate after bulk load to avoid duplicate tracks requests */
export const TRACKS_QUERY_KEY = ['tracks'] as const;

async function fetchTracks(): Promise<Track[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('id,title,artist,album,duration,audio_url,cover_image_url,visualization_type,order_index,created_at,updated_at')
    .order('order_index', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

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
  const queryClient = useQueryClient();

  const { data: tracks = [], isLoading, error, refetch } = useQuery({
    queryKey: TRACKS_QUERY_KEY,
    queryFn: fetchTracks,
  });

  const createMutation = useMutation({
    mutationFn: async (track: TrackInsert) => {
      const { data, error: insertError } = await supabase
        .from('tracks')
        .insert(track)
        .select()
        .single();
      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TRACKS_QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TrackUpdate }) => {
      const { data, error: updateError } = await supabase
        .from('tracks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TRACKS_QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tracks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TRACKS_QUERY_KEY }),
  });

  return {
    tracks,
    loading: isLoading,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    fetchTracks: refetch,
    createTrack: (track) => createMutation.mutateAsync(track),
    updateTrack: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteTrack: (id) => deleteMutation.mutateAsync(id),
  };
}
