/**
 * Tour Dates Data Hook
 *
 * Manages tour dates with Supabase.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { TourDate, TourDateInsert, TourDateUpdate } from '../types/database';

export interface UseTourDatesReturn {
  tourDates: TourDate[];
  loading: boolean;
  error: Error | null;
  fetchTourDates: (options?: { upcomingOnly?: boolean }) => Promise<void>;
  createTourDate: (tourDate: TourDateInsert) => Promise<TourDate>;
  updateTourDate: (id: string, updates: TourDateUpdate) => Promise<TourDate>;
  deleteTourDate: (id: string) => Promise<void>;
}

export function useTourDates(): UseTourDatesReturn {
  const [tourDates, setTourDates] = useState<TourDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTourDates = useCallback(async (options?: { upcomingOnly?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('tour_dates')
        .select('*')
        .order('date', { ascending: true });

      if (options?.upcomingOnly) {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('date', today);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setTourDates(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setTourDates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTourDate = useCallback(async (tourDate: TourDateInsert): Promise<TourDate> => {
    setError(null);
    const { data, error: insertError } = await supabase
      .from('tour_dates')
      .insert(tourDate)
      .select()
      .single();

    if (insertError) {
      const err = new Error(insertError.message);
      setError(err);
      throw err;
    }
    await fetchTourDates();
    return data;
  }, [fetchTourDates]);

  const updateTourDate = useCallback(
    async (id: string, updates: TourDateUpdate): Promise<TourDate> => {
      setError(null);
      const { data, error: updateError } = await supabase
        .from('tour_dates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        const err = new Error(updateError.message);
        setError(err);
        throw err;
      }
      await fetchTourDates();
      return data;
    },
    [fetchTourDates]
  );

  const deleteTourDate = useCallback(
    async (id: string): Promise<void> => {
      setError(null);
      const { error: deleteError } = await supabase.from('tour_dates').delete().eq('id', id);
      if (deleteError) {
        const err = new Error(deleteError.message);
        setError(err);
        throw err;
      }
      await fetchTourDates();
    },
    [fetchTourDates]
  );

  useEffect(() => {
    fetchTourDates();
  }, [fetchTourDates]);

  return useMemo(
    () => ({
      tourDates,
      loading,
      error,
      fetchTourDates,
      createTourDate,
      updateTourDate,
      deleteTourDate,
    }),
    [tourDates, loading, error, fetchTourDates, createTourDate, updateTourDate, deleteTourDate]
  );
}
