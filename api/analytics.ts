/**
 * Analytics API
 *
 * Vercel serverless function for /api/analytics.
 * Receives client-side events for custom analytics/logging.
 * In production, integrate with your analytics backend (e.g., PostHog, Mixpanel).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface AnalyticsPayload {
  event: string;
  properties?: Record<string, unknown>;
}

const MAX_BODY_BYTES = 16_384;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
    if (raw.length > MAX_BODY_BYTES) {
      return res.status(413).json({ error: 'Payload too large' });
    }

    const body = req.body as AnalyticsPayload | undefined;
    if (!body?.event) {
      return res.status(400).json({ error: 'Missing event name' });
    }

    // Log in development; in production, send to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', body.event, body.properties);
    }

    // TODO: Forward to analytics service (PostHog, Mixpanel, etc.)
    // await analyticsService.track(body.event, body.properties);

    return res.status(204).end();
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
