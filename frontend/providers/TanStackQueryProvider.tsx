'use client';

import { ReactElement, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function TanStackQueryProvider({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
