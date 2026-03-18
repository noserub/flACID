/**
 * Content Security Policy
 *
 * Sets CSP meta tag for XSS mitigation.
 * Call once at app initialization (e.g., index.html or main.tsx).
 */

export function setContentSecurityPolicy(): void {
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com;
  `
    .replace(/\s+/g, ' ')
    .trim();

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = csp;
  document.head.appendChild(meta);
}
