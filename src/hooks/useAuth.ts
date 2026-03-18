/**
 * Authentication Hook
 *
 * Manages Supabase auth state. Edit mode is only available when authenticated.
 */

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuthState = useCallback(async () => {
    try {
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
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    signIn,
    signOut,
    refreshAuth: checkAuthState,
  };
}
