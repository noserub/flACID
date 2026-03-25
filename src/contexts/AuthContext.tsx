/**
 * Single auth subscription for the app — avoids duplicate getUser + onAuthStateChange
 * when multiple components need sign-in state.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export interface AuthContextValue {
  isAuthenticated: boolean;
  /** True when this user is in `site_admins` (CMS publish, storage uploads). */
  isAdmin: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<unknown>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAdminFlag = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('site_admins')
        .select('user_id')
        .eq('user_id', currentUser.id)
        .maybeSingle();
      if (error) {
        console.warn('[Auth] site_admins check failed (run migration 005?):', error.message);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const checkAuthState = useCallback(async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!currentUser);
      setUser(currentUser ?? null);
      await refreshAdminFlag(currentUser ?? null);
    } catch (error) {
      console.error('[Auth] Error checking auth state:', error);
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [refreshAdminFlag]);

  useEffect(() => {
    void checkAuthState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setIsAuthenticated(!!u);
      setUser(u);
      void refreshAdminFlag(u);
    });

    return () => subscription.unsubscribe();
  }, [checkAuthState]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    isAuthenticated,
    isAdmin,
    user,
    loading,
    signIn,
    signOut,
    refreshAuth: checkAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
