import { PublicEnvScript } from 'next-runtime-env';
import { JSX } from 'react';

import '../globals.css';
import AuthenticationProvider from '@/providers/AuthenticationProvider';
import TanStackQueryProvider from '@/providers/TanStackQueryProvider';
import { SnackbarProvider } from '@/providers/SnackBarFeedbackProvider';
import Script from 'next/script';

export const dynamic = 'force-dynamic'; // Needed to avoid data fetching during build
export const runtime = 'edge';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <head>
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid={process.env.NEXT_PUBLIC_COOKIEBOT_ID}
          data-blockingmode="auto"
          type="text/javascript"
        ></Script>
      </head>
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
