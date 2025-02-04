import { DataSource } from '@/types';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function getDataSourcesByTenant(
  accessToken: string | undefined,
  tenant: string | undefined,
): Promise<DataSource[]> {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const fetched = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/data-sources/tenant/${tenant}`,
    {
      headers,
    },
  )
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
    });
  return fetched;
}
