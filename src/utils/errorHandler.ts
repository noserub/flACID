/**
 * Global Error Handler
 *
 * Centralized error logging with development/production behavior.
 * In development: logs to console. In production: sends to error tracking service.
 */

export interface ErrorInfo {
  message: string;
  stack?: string;
  context?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export class ErrorHandler {
  static logError(error: Error, context?: string): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    if (import.meta.env.DEV) {
      console.error('Error:', errorInfo);
    }

    if (import.meta.env.PROD) {
      this.sendToErrorService(errorInfo);
    }
  }

  private static sendToErrorService(errorInfo: ErrorInfo): void {
    // Integrate with Sentry, LogRocket, or custom endpoint
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    if (dsn) {
      // Sentry-style endpoint - implement based on your chosen service
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorInfo),
        keepalive: true,
      }).catch(() => {
        // Fallback: at least log to console if fetch fails
        console.error('Error reporting failed:', errorInfo);
      });
    }
  }
}
