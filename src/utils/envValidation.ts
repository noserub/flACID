/**
 * Environment Validation
 *
 * Validates required environment variables at app startup.
 * Call from main.tsx before rendering.
 */

export function validateEnvironment(): void {
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const;
  const missing = requiredVars.filter((varName) => !import.meta.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Validates env in production only; logs a warning instead of throwing.
 * Safe to call at startup - won't break the app.
 */
export function validateEnvironmentWarn(): void {
  if (!import.meta.env.PROD) return;

  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const;
  const missing = requiredVars.filter((varName) => !import.meta.env[varName]);

  if (missing.length > 0) {
    console.warn(
      `[Env] Missing recommended environment variables: ${missing.join(', ')}. ` +
        'Some features may not work. See .env.production.example'
    );
  }
}
