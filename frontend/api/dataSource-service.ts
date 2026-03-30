import { DataSource } from '@/types';
import { env } from 'next-dynenv';

export async function getDataSourcesByTenant(
  accessToken: string | undefined,
  tenant: string | undefined,
): Promise<DataSource[]> {
  const backendUrl = env('NEXT_PUBLIC_BACKEND_URL');
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const fetched = await fetch(
    `${backendUrl}/data-sources/tenant/${tenant}`,
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
