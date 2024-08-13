'use client';

import { ReactElement, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function LoginProvider({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  const { isAuthenticated, isLoading, signinRedirect } = useAuth();
  const pathname = usePathname();
  const { push } = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = sessionStorage.getItem('postLoginRedirectUrl');

      if (isAuthenticated) {
        if (url) {
          push(url); // Redirect to the stored URL
          sessionStorage.removeItem('postLoginRedirectUrl'); // Clean up
        }
      } else if (!isLoading) {
        // Set the redirect URL if it's not the login page and not empty
        if (pathname !== '/login' && pathname) {
          sessionStorage.setItem('postLoginRedirectUrl', window.location.href);
        }
        signinRedirect(); // Redirect to Keycloak login
        // signinPopup(); // Redirect to Keycloak login option if redirect is causing issues
      }
    }
  }, [isAuthenticated, isLoading, pathname]);

  return <>{isAuthenticated ? children : null}</>;
}
