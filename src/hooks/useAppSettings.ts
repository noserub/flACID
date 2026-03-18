/**
 * App Settings Hook
 *
 * Manages application-level settings. Extend with your project's settings schema.
 * Uses localStorage as fallback when Supabase is not configured.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface AppSettings {
  theme?: 'light' | 'dark' | 'system';
  editModeEnabled?: boolean;
  [key: string]: unknown;
}

const SETTINGS_STORAGE_KEY = 'app_settings';
const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  editModeEnabled: false,
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getCurrentUserSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        // TODO: Fetch from profiles or settings table when implemented
        // const { data } = await supabase.from('profiles').select('settings').eq('id', user.id).single();
        // return data?.settings ?? DEFAULT_SETTINGS;
      }
      // Fallback to localStorage
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AppSettings) : DEFAULT_SETTINGS;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AppSettings) : DEFAULT_SETTINGS;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const merged = { ...DEFAULT_SETTINGS, ...settings, ...newSettings };

      if (user) {
        // TODO: Persist to profiles/settings table when implemented
        // await supabase.from('profiles').update({ settings: merged }).eq('id', user.id);
      }
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      setSettings(merged);
      return merged;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }, [settings]);

  useEffect(() => {
    getCurrentUserSettings().then((s) => setSettings(s ?? DEFAULT_SETTINGS));
  }, [getCurrentUserSettings]);

  return {
    settings: settings ?? DEFAULT_SETTINGS,
    updateSettings,
    getCurrentUserSettings,
    loading,
    error,
  };
}
