import { ReactElement } from 'react';
import { redirect } from 'next/navigation';
import { env } from 'next-runtime-env';
import { cookies } from 'next/headers';

import { DashboardWithContent } from '@/types';
import Dashboard from '@/components/DashboardElements/Dashboard';

export const dynamic = 'force-dynamic'; // Needed to avoid data fetching during build
export const runtime = 'edge';

async function getData(
  param: string,
  accessToken: string,
  tenantAbbreviation: string,
): Promise<DashboardWithContent> {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboards/url/${param}`,
  );

  url.searchParams.append('abbreviation', tenantAbbreviation);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    console.error(`Unauthorized to access dashboard page ${param}`);
    redirect('/not-found');
  }

  return res.json();
}

export default async function DashboardPage({
  params,
}: {
  params: { tenant: string; url: string };
}): Promise<ReactElement> {
  const cookieStore = cookies();
  const cookie = cookieStore.get('access_token');
  let accessToken = cookie && cookie.value ? cookie.value : '';

  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  const tenant =
    NEXT_PUBLIC_MULTI_TENANCY === 'true' ? params.tenant : undefined;

  if (!accessToken) {
    console.error('No access token found');
    accessToken = '';
    // redirect('/login');
  }

  const dashboard = await getData(
    params.url[params.url.length - 1],
    accessToken,
    tenant || '',
  );
  return <Dashboard dashboard={dashboard} tenant={tenant} />;
}
