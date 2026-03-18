/**
 * Error Reporting API
 *
 * Vercel serverless function for /api/errors.
 * Receives client-side errors for logging/monitoring.
 * In production, forward to Sentry, LogRocket, or similar.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ErrorPayload {
  message: string;
  stack?: string;
  context?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body as ErrorPayload | undefined;
    if (!body?.message) {
      return res.status(400).json({ error: 'Missing error message' });
    }

    if (process.env.NODE_ENV === 'development') {
      console.error('[Error Report]', body);
    }

    // TODO: Forward to Sentry, LogRocket, etc.
    // await sentry.captureException(new Error(body.message), { extra: body });

    return res.status(204).end();
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
