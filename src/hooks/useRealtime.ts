/**
 * Real-time Subscriptions Hook
 *
 * Subscribes to Supabase Postgres changes for a table.
 * Automatically unsubscribes on unmount.
 */

import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimePayload<T = unknown> = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
};

export function useRealtime<T = Record<string, unknown>>(
  table: string,
  callback: (payload: RealtimePayload<T>) => void,
  options?: { schema?: string }
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const schema = options?.schema ?? 'public';

  useEffect(() => {
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
  }, [table, schema]);
}
