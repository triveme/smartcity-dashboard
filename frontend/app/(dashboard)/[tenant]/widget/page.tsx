import { ReactElement } from 'react';
import { redirect } from 'next/navigation';

import { WidgetWithChildren, WidgetWithContent } from '@/types';
import DashboardWidget from '@/components/DashboardElements/DashboardWidget';
import { env } from 'next-runtime-env';

export const dynamic = 'force-dynamic'; // Neeeded to avoid data fetching during build
export const runtime = 'edge';

async function getData(param: string): Promise<WidgetWithChildren> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/widgets/with-children/${param}`,
  );
  if (!res.ok) {
    console.error(process.env.NEXT_PUBLIC_BACKEND_URL);
    redirect('/not-found');
  }

  return res.json();
}

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: { tenant: string };
  searchParams: { id: string };
}): Promise<ReactElement> {
  console.log('params', params);
  console.log('searchParams', searchParams);
  const widgetWithChildren = await getData(searchParams.id || '');

  const widget: WidgetWithContent = {
    name: widgetWithChildren.widget.name,
    height: widgetWithChildren.widget.height,
    width: widgetWithChildren.widget.width,
    icon: widgetWithChildren.widget.icon,
    visibility: widgetWithChildren.widget.visibility,
    readRoles: widgetWithChildren.widget.readRoles,
    writeRoles: widgetWithChildren.widget.writeRoles,
    tabs: [widgetWithChildren.tab],
  };

  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  const tenant =
    NEXT_PUBLIC_MULTI_TENANCY === 'true' ? params.tenant : undefined;

  return <DashboardWidget widget={widget} tenant={tenant} />;
}
