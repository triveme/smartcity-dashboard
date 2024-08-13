'use client';

import { env } from 'next-runtime-env';
import { useParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export function getTenantOfPage(): string | undefined {
  const params = useParams();
  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  return NEXT_PUBLIC_MULTI_TENANCY === 'true'
    ? (params.tenant as string)
    : undefined;
}

export function isUserMatchingTenant(
  bearerToken: string,
  tenant: string,
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decodedToken: any = jwtDecode(bearerToken);

  if (decodedToken?.mandator_code !== tenant) {
    return false;
  } else {
    return true;
  }
}
