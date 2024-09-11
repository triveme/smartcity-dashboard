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
  const widgetWithChildren = await getData(searchParams.id || '');

  const widget: WidgetWithContent = {
    id: widgetWithChildren.widget.id,
    name: widgetWithChildren.widget.name,
    allowShare: widgetWithChildren.widget.allowShare,
    allowDataExport: widgetWithChildren.widget.allowDataExport,
    headlineColor: widgetWithChildren.widget.headlineColor,
    height: widgetWithChildren.widget.height,
    icon: widgetWithChildren.widget.icon,
    readRoles: widgetWithChildren.widget.readRoles,
    showName: widgetWithChildren.widget.showName,
    tabs: [widgetWithChildren.tab],
    visibility: widgetWithChildren.widget.visibility,
    width: widgetWithChildren.widget.width,
    writeRoles: widgetWithChildren.widget.writeRoles,
  };

  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  const tenant =
    NEXT_PUBLIC_MULTI_TENANCY === 'true' ? params.tenant : undefined;

  return (
    <DashboardWidget widget={widget} tenant={tenant} isCombinedWidget={false} />
  );
}
