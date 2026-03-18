/**
 * Tour Dates Data Hook
 *
 * Manages tour dates with Supabase.
 * Uses TanStack Query for caching and deduplication to minimize egress.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { TourDate, TourDateInsert, TourDateUpdate } from '../types/database';

const QUERY_KEY = ['tour_dates'] as const;

async function fetchTourDates(options?: { upcomingOnly?: boolean }): Promise<TourDate[]> {
  let query = supabase
    .from('tour_dates')
    .select('id,date,venue,city,country,ticket_url,status,created_at,updated_at')
    .order('date', { ascending: true });

  if (options?.upcomingOnly) {
    const today = new Date().toISOString().split('T')[0];
    query = query.gte('date', today);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export interface UseTourDatesReturn {
  tourDates: TourDate[];
  loading: boolean;
  error: Error | null;
  fetchTourDates: (options?: { upcomingOnly?: boolean }) => Promise<void>;
  createTourDate: (tourDate: TourDateInsert) => Promise<TourDate>;
  updateTourDate: (id: string, updates: TourDateUpdate) => Promise<TourDate>;
  deleteTourDate: (id: string) => Promise<void>;
}

export function useTourDates(options?: { upcomingOnly?: boolean }): UseTourDatesReturn {
  const queryClient = useQueryClient();
  const upcomingOnly = options?.upcomingOnly ?? false;

  const { data: tourDates = [], isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEY, { upcomingOnly }],
    queryFn: () => fetchTourDates({ upcomingOnly }),
  });

  const createMutation = useMutation({
    mutationFn: async (tourDate: TourDateInsert) => {
      const { data, error: insertError } = await supabase
        .from('tour_dates')
        .insert(tourDate)
        .select()
        .single();
      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TourDateUpdate }) => {
      const { data, error: updateError } = await supabase
        .from('tour_dates')
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
      const { error } = await supabase.from('tour_dates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    tourDates,
    loading: isLoading,
    error: error ? (error instanceof Error ? error : new Error(String(error))) : null,
    fetchTourDates: (opts) => refetch(),
    createTourDate: (tourDate) => createMutation.mutateAsync(tourDate),
    updateTourDate: (id, updates) => updateMutation.mutateAsync({ id, updates }),
    deleteTourDate: (id) => deleteMutation.mutateAsync(id),
  };
}
