import { ReactElement } from 'react';
import { redirect } from 'next/navigation';

import { DashboardWithContent } from '@/types';
import Dashboard from '@/components/DashboardElements/Dashboard';

export const dynamic = 'force-dynamic'; // Needed to avoid data fetching during build
export const runtime = 'edge';

async function getData(param: string): Promise<DashboardWithContent> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboards/${param}?includeContent=true`,
  );
  if (!res.ok) {
    console.error(process.env.NEXT_PUBLIC_BACKEND_URL);
    redirect('/not-found');
  }

  return res.json();
}

export default async function DashboardPage(props: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ id: string }>;
}): Promise<ReactElement> {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const dashboardWithChildren = await getData(searchParams.id || '');

  const tenant = params.tenant || undefined;

  return (
    <div className="w-full h-full">
      <Dashboard dashboard={dashboardWithChildren} tenant={tenant} />
    </div>
  );
}
