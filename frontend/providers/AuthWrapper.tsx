'use client';

import React, { ReactElement, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const AuthWrapper = ({
  children,
}: {
  children: React.ReactNode;
}): ReactElement => {
  const router = useRouter();
  const auth = useAuth();

  const handleSignin = (): void => {
    if (typeof window !== 'undefined' && auth.isAuthenticated && auth.user) {
      const url = sessionStorage.getItem('postLoginRedirectUrl');
      Cookies.set('access_token', auth.user.access_token, {
        secure: true,
        sameSite: 'Strict',
      });
      if (url) {
        router.replace(url);
      } else {
        router.refresh();
      }
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      handleSignin();
    }
  }, [auth.isAuthenticated, auth.user]);

  return <>{children}</>;
};

export default AuthWrapper;
