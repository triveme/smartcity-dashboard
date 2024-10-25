import { PublicEnvScript } from 'next-runtime-env';

import '../globals.css';
import AuthenticationProvider from '@/providers/AuthenticationProvider';
import TanStackQueryProvider from '@/providers/TanStackQueryProvider';
import { SnackbarProvider } from '@/providers/SnackBarFeedbackProvider';

export const dynamic = 'force-dynamic'; // Neeeded to avoid data fetching during build
export const runtime = 'edge';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
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
