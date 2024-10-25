'use client';

import React, { ReactElement } from 'react';
import { AuthProvider, AuthProviderProps } from 'react-oidc-context';
import { env } from 'next-runtime-env';
import { WebStorageStateStore } from 'oidc-client-ts';

import AuthWrapper from './AuthWrapper'; // Make sure the path is correct

export default function AuthenticationProvider({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  const OIDC_AUTHORITY = env('NEXT_PUBLIC_OIDC_AUTHORITY');
  const OIDC_CLIENT_ID = env('NEXT_PUBLIC_OIDC_CLIENT_ID');
  const OIDC_REDIRECT_URI = env('NEXT_PUBLIC_OIDC_REDIRECT_URI');

  if (!OIDC_AUTHORITY) {
    throw new Error('NEXT_PUBLIC_OIDC_AUTHORITY is not set');
  }
  if (!OIDC_CLIENT_ID) {
    throw new Error('NEXT_PUBLIC_OIDC_CLIENT_ID is not set');
  }
  if (!OIDC_REDIRECT_URI) {
    throw new Error('NEXT_PUBLIC_OIDC_REDIRECT_URI is not set');
  }

  const oidcConfig: AuthProviderProps = {
    authority: OIDC_AUTHORITY,
    client_id: OIDC_CLIENT_ID,
    redirect_uri: OIDC_REDIRECT_URI,
  };

  if (typeof window !== 'undefined') {
    oidcConfig.userStore = new WebStorageStateStore({
      store: window.localStorage,
    });
  }

  function onSigninCallback(): void {
    window.location.href = '/';
  }

  return (
    <AuthProvider {...oidcConfig} onSigninCallback={onSigninCallback}>
      <AuthWrapper>{children}</AuthWrapper>
    </AuthProvider>
  );
}
