import { ReactElement } from 'react';
import { getDashboardUrlByTenantAbbreviation } from '../actions';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import { env } from 'next-runtime-env';

export const dynamic = 'force-dynamic'; // Neeeded to avoid data fetching during build
export const runtime = 'edge';

// Tenant for redirection
const NEXT_PUBLIC_TENANT = env('NEXT_PUBLIC_TENANT');

const isSafeEnvMandant = (val?: string): boolean =>
  !!val && /^[a-z0-9-]{1,32}$/.test(val);

export default async function DashboardPageGeneral(): Promise<ReactElement> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  // Try auto redirect for logged in users
  if (token) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decodedToken: any = jwtDecode(token);
    const mandatorCode = decodedToken?.mandator_code;
    let primaryMandator = mandatorCode;
    if (typeof mandatorCode === 'string') {
      const codes = mandatorCode.split(',');
      if (codes.length > 1) {
        primaryMandator = codes[0];
      }
    }

    const url = await getDashboardUrlByTenantAbbreviation(primaryMandator);

    redirect(`${primaryMandator}/${url}`);
  }

  // Redirect to tenant if there aren't logged in users and tenant exists
  if (isSafeEnvMandant(NEXT_PUBLIC_TENANT)) {
    redirect(`/${NEXT_PUBLIC_TENANT}`);
  }

  return <div className="p-4">Bitte geben Sie einen Mandanten an.</div>;
}
