/**
 * Environment Configuration
 *
 * Centralized access to environment variables.
 * Use import.meta.env for Vite; this provides typed access and defaults.
 */

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_ANALYTICS_ID?: string;
  VITE_SENTRY_DSN?: string;
}

export const env: EnvironmentConfig = {
  NODE_ENV: (import.meta.env.MODE ?? 'development') as EnvironmentConfig['NODE_ENV'],
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ?? '',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  VITE_ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
};

export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
