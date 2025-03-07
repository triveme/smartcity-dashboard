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

  useEffect(() => {
    if (auth.error) {
      openSnackbar(auth.error.toString(), 'error');
    }
  }, [auth.error, openSnackbar]);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      Cookies.set('access_token', auth.user.access_token, {
        secure: true,
        sameSite: 'Strict',
      });
    }
  }, [auth.isAuthenticated, auth.user]);

  if (auth.activeNavigator === 'signinSilent') {
    return <div>Signing you in...</div>;
  }

  if (auth.activeNavigator === 'signoutRedirect') {
    return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default AuthWrapper;
