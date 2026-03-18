/**
 * Supabase Client Configuration
 *
 * Centralized Supabase client with auth and session management.
 * Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local
 *
 * When env vars are missing, a no-op mock is used so the app still runs.
 * Copy .env.local.example to .env.local and add your credentials.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

const isConfigured =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'));

if (!isConfigured && import.meta.env.DEV) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.local.example to .env.local and add your credentials.'
  );
}

function createSupabaseClient(): SupabaseClient<Database> {
  if (!isConfigured) {
    // Return a mock client that never throws - avoids "Invalid supabaseUrl" error
    const noop = () => {};
    const mockChain = {
      select: () => mockChain,
      insert: () => mockChain,
      update: () => mockChain,
      delete: () => mockChain,
      eq: () => mockChain,
      order: () => mockChain,
      limit: () => mockChain,
      single: async () => ({ data: null, error: null }),
    };
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: noop } } }),
      },
      from: () => mockChain as any,
      channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: noop }) }) }),
      removeChannel: noop,
    } as unknown as SupabaseClient<Database>;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = createSupabaseClient();

/** True when Supabase env vars are configured */
export const isSupabaseConfigured = isConfigured;
