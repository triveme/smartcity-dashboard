'use client';

import React, { ReactElement, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useSnackbar } from './SnackBarFeedbackProvider';
import Cookies from 'js-cookie';

const AuthWrapper = ({
  children,
}: {
  children: React.ReactNode;
}): ReactElement => {
  const auth = useAuth();
  const { openSnackbar } = useSnackbar();

  switch (auth.activeNavigator) {
    case 'signinSilent':
      return <div>Signing you in...</div>;
    case 'signoutRedirect':
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    openSnackbar(auth.error.toString(), 'error');
  }

  const handleSignin = (): void => {
    Cookies.set('access_token', auth.user!.access_token, {
      secure: true,
      sameSite: 'Strict',
    });
  };

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      handleSignin();
    }
  }, [auth.isAuthenticated, auth.user]);
  return <>{children}</>;
};

export default AuthWrapper;
