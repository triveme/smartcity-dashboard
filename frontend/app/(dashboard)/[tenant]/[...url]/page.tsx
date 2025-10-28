import { ReactElement } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { DashboardWithContent } from '@/types';
import Dashboard from '@/components/DashboardElements/Dashboard';
import { Metadata } from 'next';
import { getMenuGroupingElements } from '@/api/menu-service';

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
    console.error(res.statusText);
    redirect('/not-found');
  }

  return res.json();
}

export async function generateMetadata(props: {
  params: Promise<{ tenant: string; url: string }>;
}): Promise<Metadata> {
  const url = (await props.params).url;
  const tenant = (await props.params).tenant;
  const cookieStore = await cookies();
  const cookie = cookieStore.get('access_token');
  const accessToken = cookie && cookie.value ? cookie.value : '';

  const menuGroupElements = await getMenuGroupingElements(tenant, accessToken);

  const title: string[] = [];
  let searchArray = menuGroupElements;
  for (const urlEntry of url) {
    const match = searchArray.find((x) => x.url === urlEntry);
    if (match) {
      if (match.name) {
        title.push(match.name);
      }
      if (match.children && match.children.length > 0) {
        searchArray = match.children;
      } else {
        break;
      }
    }
  }
  if (title.length <= 0) {
    title.push('Smart Region Dashboard');
  }
  return {
    title: title.join(' - '),
  };
}

export default async function DashboardPage(props: {
  params: Promise<{ tenant: string; url: string }>;
}): Promise<ReactElement> {
  const params = await props.params;
  const cookieStore = await cookies();
  const cookie = cookieStore.get('access_token');
  let accessToken = cookie && cookie.value ? cookie.value : '';
  const tenant = params.tenant || undefined;

  if (!accessToken) {
    console.warn('No access token found');
    accessToken = '';
  }

  const dashboard = await getData(
    params.url[params.url.length - 1],
    accessToken,
    tenant || '',
  );
  return (
    <div className="w-full h-full">
      <Dashboard dashboard={dashboard} tenant={tenant} />
    </div>
  );
}
