/**
 * Content Security Policy
 *
 * Sets CSP meta tag for XSS mitigation.
 * Call once at app initialization (e.g., index.html or main.tsx).
 */

export function setContentSecurityPolicy(): void {
  const csp = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.gstatic.com https://vercel.live;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' data: https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    media-src 'self' blob: https://*.supabase.co;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://region1.google-analytics.com https://vitals.vercel-insights.com https://www.gstatic.com https://vercel.live wss://vercel.live;
  `
    .replace(/\s+/g, ' ')
    .trim();

  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = csp;
  document.head.appendChild(meta);
}
