/**
 * Public mailing list signup (anon insert via RLS).
 */

import { supabase } from '../lib/supabaseClient';
import { isSupabaseConfigured } from '../lib/supabase';

export type NewsletterSignupResult =
  | { ok: true; alreadySubscribed?: boolean }
  | { ok: false; code: 'not_configured' | 'invalid_email' | 'duplicate' | 'unknown'; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function subscribeToNewsletter(rawEmail: string): Promise<NewsletterSignupResult> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      code: 'not_configured',
      message: 'Newsletter signup is not available right now.',
    };
  }

  const email = normalizeEmail(rawEmail);
  if (!email || email.length < 5 || !EMAIL_RE.test(email)) {
    return {
      ok: false,
      code: 'invalid_email',
      message: 'Enter a valid email address.',
    };
  }

  const { error } = await supabase.from('newsletter_subscribers').insert({ email });

  if (!error) {
    return { ok: true };
  }

  // Unique violation on email (case-insensitive index)
  if (error.code === '23505') {
    return { ok: true, alreadySubscribed: true };
  }

  console.error('[newsletter] insert failed:', error);
  return {
    ok: false,
    code: 'unknown',
    message: 'Something went wrong. Try again in a moment.',
  };
}
