/**
 * Supabase - Re-exports for backward compatibility
 *
 * Use supabaseClient.ts for the client, types/database.ts for types.
 * Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
 */

export { supabase, isSupabaseConfigured } from './supabaseClient';
export type { Database } from '../types/database';
