/**
 * Analytics Component
 *
 * Tracks page views when mounted. Place in route-level or page components.
 */

import { useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';

interface AnalyticsProps {
  pageName: string;
}

export function Analytics({ pageName }: AnalyticsProps): null {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(pageName);
  }, [pageName, trackPageView]);

  return null;
}
