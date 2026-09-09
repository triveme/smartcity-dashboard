import { PublicEnvScript } from 'next-dynenv';
import { JSX } from 'react';
import type { Metadata } from 'next';

import '../globals.css';
import AuthenticationProvider from '@/providers/AuthenticationProvider';
import TanStackQueryProvider from '@/providers/TanStackQueryProvider';
import { SnackbarProvider } from '@/providers/SnackBarFeedbackProvider';

export const dynamic = 'force-dynamic'; // Needed to avoid data fetching during build
export const runtime = 'edge';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <head></head>
      <body>
        <TanStackQueryProvider>
          <PublicEnvScript />
          <SnackbarProvider>
            <AuthenticationProvider>{children}</AuthenticationProvider>
          </SnackbarProvider>
        </TanStackQueryProvider>
      </body>
    </html>
  );
}
