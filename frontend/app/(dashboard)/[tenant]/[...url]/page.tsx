import { ReactElement } from 'react';
import { redirect } from 'next/navigation';
import { env } from 'next-runtime-env';
import { cookies } from 'next/headers'; // Edge-compatible cookie handling

import { DashboardWithContent } from '@/types';
import Dashboard from '@/components/DashboardElements/Dashboard';

export const dynamic = 'force-dynamic'; // Needed to avoid data fetching during build
export const runtime = 'edge';

async function getData(
  param: string,
  accessToken: string,
): Promise<DashboardWithContent> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboards/url/${param}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 0 },
    },
  );

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
  let accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    console.error('No access token found');
    accessToken = '';
    // redirect('/login');
  }

  const dashboard = await getData(
    params.url[params.url.length - 1],
    accessToken,
  );

  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  const tenant =
    NEXT_PUBLIC_MULTI_TENANCY === 'true' ? params.tenant : undefined;

  return <Dashboard dashboard={dashboard} tenant={tenant} />;
}
