/**
 * Authentication Hook
 *
 * Manages Supabase auth state with optional bypass for development.
 * Use localStorage key 'auth_bypass' for development without Supabase Auth.
 */

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

const AUTH_BYPASS_KEY = 'auth_bypass';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthState = useCallback(async () => {
    try {
      const bypassAuth = localStorage.getItem(AUTH_BYPASS_KEY) === 'true';
      if (bypassAuth) {
        setIsAuthenticated(true);
        setUser(null);
        setLoading(false);
        return;
      }

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!currentUser);
      setUser(currentUser ?? null);
    } catch (error) {
      console.error('[useAuth] Error checking auth state:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const bypassAuth = localStorage.getItem(AUTH_BYPASS_KEY) === 'true';
      if (bypassAuth) {
        setIsAuthenticated(true);
        setUser(null);
        return;
      }
      setIsAuthenticated(!!session?.user);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [checkAuthState]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    []
  );

  const signOut = useCallback(async () => {
    localStorage.removeItem(AUTH_BYPASS_KEY);
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const setBypassAuth = useCallback((bypass: boolean) => {
    localStorage.setItem(AUTH_BYPASS_KEY, String(bypass));
    setIsAuthenticated(bypass);
    setUser(bypass ? null : user);
  }, [user]);

  return {
    isAuthenticated,
    user,
    loading,
    signIn,
    signOut,
    setBypassAuth,
    refreshAuth: checkAuthState,
  };
}
