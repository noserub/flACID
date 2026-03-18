/**
 * Test Utilities
 *
 * Custom render with providers for React Testing Library.
 * Use for consistent test setup across components.
 *
 * Mock implementations for Supabase - use with vi.mock() to isolate components.
 */

import {
  render as rtlRender,
  screen,
  type RenderOptions,
} from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

function AllTheProviders({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  rtlRender(ui, {
    wrapper: AllTheProviders,
    ...options,
  });

export { customRender as render, screen };

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
