/**
 * TanStack Query Client Configuration
 *
 * Optimized for Supabase free tier egress limits (5GB cached + 5GB uncached):
 * - Long staleTime: reduces refetches when navigating
 * - Request deduplication: multiple components share one fetch
 * - gcTime: keeps cache for background tabs
 */

import { QueryClient } from '@tanstack/react-query';

/** 5 min - data considered fresh, no refetch */
const STALE_TIME = 5 * 60 * 1000;
/** 30 min - cache retained after unmount */
const GC_TIME = 30 * 60 * 1000;
/** 3 retries with exponential backoff */
const RETRY = 3;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      gcTime: GC_TIME,
      retry: RETRY,
      refetchOnWindowFocus: false, // avoid extra egress on tab switch
      refetchOnReconnect: false,   // avoid burst on reconnect
    },
  },
});
