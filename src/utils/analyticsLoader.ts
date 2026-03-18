/**
 * Analytics Loader
 *
 * Injects Google Analytics (gtag) script when VITE_ANALYTICS_ID is set.
 * Call once at app initialization.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_ANALYTICS_ID as string | undefined;

export function loadAnalytics(): void {
  if (!MEASUREMENT_ID || !import.meta.env.PROD) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID);
}
