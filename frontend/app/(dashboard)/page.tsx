import { env } from 'next-runtime-env';
import { ReactElement } from 'react';
import { getFirstDashboardUrl } from '../actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'; // Neeeded to avoid data fetching during build
export const runtime = 'edge';

export default async function DashboardPageGeneral(): Promise<ReactElement> {
  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  if (NEXT_PUBLIC_MULTI_TENANCY === 'true') {
    return <div className="p-4">Bitte geben Sie einen Mandanten an.</div>;
  } else {
    const url = await getFirstDashboardUrl();
    redirect(url);
  }
}
