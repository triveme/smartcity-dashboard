'use client';

import { useParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

export function getTenantOfPage(): string | undefined {
  const params = useParams();
  const tenant = (params.tenant as string) || undefined;
  return tenant;
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
