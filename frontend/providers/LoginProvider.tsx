'use client';

import { ReactElement, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function LoginProvider({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  const { isAuthenticated, isLoading, signinRedirect, error } = useAuth();
  const pathname = usePathname();

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

  if (error) {
    return <div>Authentication error: {error.message}</div>;
  }

  return <>{isAuthenticated ? children : null}</>;
}
