import { ReactElement } from 'react';
import { getDashboardUrlByTenantAbbreviation } from '../actions';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

export const dynamic = 'force-dynamic'; // Neeeded to avoid data fetching during build
export const runtime = 'edge';

export default async function DashboardPageGeneral(): Promise<ReactElement> {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;

  // Try auto redirect for logged in users
  if (token) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decodedToken: any = jwtDecode(token);
    const mandatorCode = decodedToken.mandator_code;
    const url = await getDashboardUrlByTenantAbbreviation(mandatorCode);
    redirect(`${mandatorCode}/${url}`);
  }

  return <div className="p-4">Bitte geben Sie einen Mandanten an.</div>;
}
