/**
 * Utility Functions
 *
 * Shared helpers used across the application.
 */

/**
 * Format a date for display (e.g., "Mar 17, 2025" or "March 17, 2025")
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, options);
}

/**
 * Format duration in seconds to "MM:SS" (e.g., 125 → "2:05")
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parse "MM:SS" or "M:SS" duration string to seconds
 */
export function parseDuration(durationStr: string): number {
  const parts = durationStr.trim().split(':').map(Number);
  if (parts.length === 1) return parts[0] ?? 0;
  if (parts.length === 2) return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  if (parts.length === 3) return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  return 0;
}

/**
 * Re-export cn from UI utils for convenience
 * Prefer importing from @/components/ui/utils for component usage
 */
export { cn } from '../components/ui/utils';

export {
  validateEmail,
  validateRequired,
  validateUrl,
  validateMinLength,
  validateMaxLength,
  validateYear,
} from './validation';

export { cacheManager } from './cacheManager';
export type { CacheSource } from './cacheManager';

export { cleanupDuplicates, clearCorruptedData } from './memory';
export { ErrorHandler } from './errorHandler';
export type { ErrorInfo } from './errorHandler';
export { sanitizeInput, validatePassword } from './security';
