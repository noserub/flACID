/**
 * Performance Monitor
 *
 * Tracks page load time and API response times.
 * Logs warnings when thresholds are exceeded.
 */

const SLOW_PAGE_LOAD_MS = 3000;
const SLOW_API_MS = 5000;

export class PerformanceMonitor {
  static measurePageLoad(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const entries = performance.getEntriesByType('navigation');
      const navigation = entries[0] as PerformanceNavigationTiming | undefined;

      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        if (loadTime > SLOW_PAGE_LOAD_MS) {
          console.warn('Slow page load detected:', loadTime, 'ms');
        }
      }
    });
  }

  static measureAPIResponse(url: string, startTime: number): void {
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (duration > SLOW_API_MS) {
      console.warn('Slow API response detected:', { url, duration: `${duration.toFixed(0)}ms` });
    }
  }
}
