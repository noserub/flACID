/**
 * Test Utilities
 *
 * Mock implementations for unit testing.
 * Use with vi.mock() or jest.mock() to isolate components from Supabase.
 *
 * Example (Vitest):
 *   import { vi } from 'vitest';
 *   vi.mock('../lib/supabaseClient', () => ({ supabase: mockSupabaseClient }));
 */

const noop = () => {};

function createChainable() {
  const chain = {
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    delete: () => chain,
    eq: () => chain,
    order: () => chain,
    gte: () => chain,
    single: async () => ({ data: null, error: null }),
  };
  return chain;
}

export const mockSupabaseClient = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: noop } } }),
  },
  from: () => createChainable(),
  channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: noop }) }) }),
  removeChannel: noop,
};
