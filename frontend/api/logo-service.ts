import axios from 'axios';
import { Logo } from '@/types';
import { getBackendUrl } from '@/utils/envHelper';

export async function getLogos(
  accessToken: string | undefined,
  tenant?: string | undefined,
): Promise<Logo[]> {
  const backendUrl = getBackendUrl();
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const fetched = await fetch(
    `${backendUrl}/logos${tenantParam}`,
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

export async function postLogo(
  accessToken: string | undefined,
  newLogo: Logo,
  tenant?: string | undefined,
): Promise<Logo> {
  const backendUrl = getBackendUrl();
  const tenantParam = tenant && tenant !== '' ? `${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${backendUrl}/logos`,
      { ...newLogo, tenantId: tenantParam },
      {
        headers: headers,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postLogo:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
