/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child component tree and displays a fallback UI.
 * Use to prevent the entire app from crashing on component errors.
 * Integrates with ErrorHandler for logging and supports recovery via reload.
 */

import React, { type ErrorInfo, type ReactNode } from 'react';
import { ErrorHandler } from '../utils/errorHandler';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorId: '' };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substring(2, 11),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    ErrorHandler.logError(error, 'ErrorBoundary');
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="error-fallback min-h-[200px] flex flex-col items-center justify-center p-8 bg-destructive/10 border border-destructive/20 rounded-lg">
          <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-2">Error ID: {this.state.errorId}</p>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            An unexpected error occurred. Please refresh the page or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Reload Page
          </button>
          {import.meta.env.DEV && (
            <details className="w-full max-w-2xl text-xs text-muted-foreground bg-muted/50 p-4 rounded overflow-auto max-h-40 mt-4">
              <summary className="cursor-pointer font-medium mb-2">Error details</summary>
              <pre className="whitespace-pre-wrap break-words">{this.state.error.stack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
