/**
 * Health Check Utilities
 *
 * Verifies database and API connectivity.
 * Use for status pages or startup diagnostics.
 */

import { supabase } from '../lib/supabaseClient';

export class HealthChecker {
  static async checkDatabase(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  static async checkAPI(): Promise<boolean> {
    try {
      const response = await fetch('/api/health');
      return response.ok;
    } catch {
      return false;
    }
  }

  static async runAllChecks(): Promise<{ database: boolean; api: boolean }> {
    const [database, api] = await Promise.all([
      this.checkDatabase(),
      this.checkAPI(),
    ]);

    return { database, api };
  }
}
