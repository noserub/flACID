import { ReactNode } from 'react';
import { useAuth } from '../hooks';
import { SignInScreen } from './SignInScreen';

interface AdminGateProps {
  children: ReactNode;
}

/**
 * Gates the app behind authentication. Unauthenticated users see the sign-in screen.
 * Use this when the entire site is admin-only (e.g. staging, internal tools).
 * For public site + admin edit mode, do not use AdminGate - use SignInDialog in header instead.
 */
export function AdminGate({ children }: AdminGateProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInScreen />;
  }

  return <>{children}</>;
}
