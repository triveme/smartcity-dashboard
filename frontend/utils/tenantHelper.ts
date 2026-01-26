'use client';

import { useParams } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { env } from 'next-dynenv';

const NEXT_PUBLIC_IGNORE_TENANT_CHECK = env('NEXT_PUBLIC_IGNORE_TENANT_CHECK');

export function getTenantOfPage(): string | undefined {
  const params = useParams();
  const tenant = (params.tenant as string) || undefined;
  return tenant;
}

export function isUserMatchingTenant(
  bearerToken: string,
  tenant: string,
): boolean {
  console.log('Skip tenant check? :' + NEXT_PUBLIC_IGNORE_TENANT_CHECK);
  if (NEXT_PUBLIC_IGNORE_TENANT_CHECK === 'true') {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decodedToken: any = jwtDecode(bearerToken);
  const mandatorCode = decodedToken?.mandator_code;

  console.log(mandatorCode);
  if (typeof mandatorCode === 'string') {
    const codes = mandatorCode.split(',');
    return codes.includes(tenant);
  }

  if (decodedToken?.mandator_code !== tenant) {
    return false;
  } else {
    return true;
  }
}
