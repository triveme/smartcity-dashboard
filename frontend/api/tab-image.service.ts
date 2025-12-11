import { TabImage } from '@/types';
import axios from 'axios';

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getTabImages(
  accessToken: string | undefined,
  tenant?: string | undefined,
): Promise<TabImage[]> {
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const fetched = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/tab-image${tenantParam}`,
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

export async function getTabImageById(
  accessToken: string | undefined,
  id: string,
): Promise<TabImage | undefined> {
  const uri = `${NEXT_PUBLIC_BACKEND_URL}/tab-image/${id}`;
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const result = await axios.get(uri, { headers: headers });
  if (result.status === 200) {
    return result.data as TabImage;
  } else {
    return undefined;
  }
}

export async function deleteTabImage(
  accessToken: string | undefined,
  id: string,
): Promise<void> {
  const uri = `${NEXT_PUBLIC_BACKEND_URL}/tab-image/${id}`;
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;

  await axios.delete(uri, { headers: headers });
}

export async function postTabImage(
  accessToken: string | undefined,
  newTabImage: TabImage,
  tenant?: string | undefined,
): Promise<TabImage> {
  const tenantParam = tenant && tenant !== '' ? `${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/tab-image`,
      { ...newTabImage, tenantId: tenantParam },
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
