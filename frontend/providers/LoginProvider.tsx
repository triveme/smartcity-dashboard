'use client';

import { ReactElement, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function LoginProvider({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  const { isAuthenticated, isLoading, signinRedirect } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated && !isLoading) {
        signinRedirect();
      }
    }
  }, [isAuthenticated, isLoading, pathname]);

  return <>{isAuthenticated ? children : null}</>;
}
