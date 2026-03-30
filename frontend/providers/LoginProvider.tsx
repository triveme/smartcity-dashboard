'use client';

import { ReactElement, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function LoginProvider({
  children,
}: Readonly<{ children: React.ReactNode }>): ReactElement {

  const { isAuthenticated, isLoading, signinRedirect, error, removeUser } =
    useAuth();
  const pathname = usePathname();

  const clearStaleSessionAndRetry = useCallback(async () => {
    // Remove stale user/session data and re-trigger login
    await removeUser();
    signinRedirect({
      state: pathname,
    }).catch((err) => {
      console.error('Failed to redirect to login after clearing session:', err);
    });
  }, [removeUser, signinRedirect, pathname]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated && !isLoading) {
        signinRedirect({
          state: pathname,
        }).catch((err) => {
          console.error('Failed to redirect to login:', err);
        });
      }
    }
  }, [isAuthenticated, isLoading, pathname]);

  useEffect(() => {
    if (error) {
      console.error('Authentication error:', error.message);
      void clearStaleSessionAndRetry();
    }
  }, [error, clearStaleSessionAndRetry]);

  if (error) {
    return <div>Authentication error: {error.message}</div>;
  }

  return <>{isAuthenticated ? children : null}</>;
}
