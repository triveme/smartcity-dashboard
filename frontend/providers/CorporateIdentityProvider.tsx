import React, { ReactElement } from 'react';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
// import { getTenantOfPage } from '@/utils/tenantHelper';

// Provider to prefetch corporate info
export default async function CorporateIdentityProvider({
  children,
  tenant,
}: {
  children: React.ReactNode;
  tenant: string | undefined;
}): Promise<ReactElement> {
  const queryClient = new QueryClient();
  // const tenant = getTenantOfPage();

  // Prefetched and put into the cache for queryKey: 'corporateInfo'
  await queryClient.prefetchQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
  });

  return (
    // `HydrationBoundary` helps manage hydration of server-side rendered data in a React application.
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
