/**
 * Analytics Hook
 *
 * Tracks page views and custom events.
 * Only sends data in production. Supports Google Analytics (gtag) and custom endpoint.
 */

import { useCallback } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function useAnalytics() {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    if (import.meta.env.PROD) {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', eventName, properties);
      }

      // Custom analytics endpoint
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventName, properties }),
        keepalive: true,
      }).catch(() => {
        // Silently fail - analytics should not break the app
      });
    }
  }, []);

  const trackPageView = useCallback(
    (pageName: string) => {
      trackEvent('page_view', { page: pageName });
    },
    [trackEvent]
  );

  return { trackEvent, trackPageView };
}
