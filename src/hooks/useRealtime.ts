/**
 * Real-time Subscriptions Hook
 *
 * Subscribes to Supabase Postgres changes for a table.
 * Automatically unsubscribes on unmount.
 *
 * Egress note: Realtime consumes bandwidth. Only enable when needed (e.g. edit mode).
 * Pass enabled: true to subscribe; default is false to preserve free tier egress.
 */

import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimePayload<T = unknown> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
};

export interface UseRealtimeOptions {
  schema?: string;
  /** Set true to subscribe. Default false to avoid egress on free tier. */
  enabled?: boolean;
}

export function useRealtime<T = Record<string, unknown>>(
  table: string,
  callback: (payload: RealtimePayload<T>) => void,
  options?: UseRealtimeOptions
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const schema = options?.schema ?? 'public';
  const enabled = options?.enabled ?? false;

  useEffect(() => {
    if (!enabled) return;

    const channelName = `${table}_changes`;
    let channel: RealtimeChannel;

    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema,
          table,
        },
        (payload) => {
          callbackRef.current({
            eventType: payload.eventType as RealtimePayload['eventType'],
            new: payload.new as T | null,
            old: payload.old as T | null,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, enabled]);
}
