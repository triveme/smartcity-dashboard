import { CustomMapImage } from '@/types';
import axios from 'axios';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function getCustomMapImages(
  accessToken: string | undefined,
  tenant?: string | undefined,
): Promise<CustomMapImage[]> {
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const fetched = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/custom-map-image${tenantParam}`,
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

export async function getCustomMapImageById(
  accessToken: string | undefined,
  id: string,
): Promise<CustomMapImage | undefined> {
  const uri = `${NEXT_PUBLIC_BACKEND_URL}/custom-map-image/${id}`;
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const result = await axios.get(uri, { headers: headers });
  if (result.status === 200) {
    return result.data as CustomMapImage;
  } else {
    return undefined;
  }
}

export async function deleteCustomMapImage(
  accessToken: string | undefined,
  id: string,
): Promise<void> {
  const uri = `${NEXT_PUBLIC_BACKEND_URL}/custom-map-image/${id}`;
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;

  await axios.delete(uri, { headers: headers });
}

export async function postCustomMapImage(
  accessToken: string | undefined,
  newCustomMapImage: CustomMapImage,
  tenant?: string | undefined,
): Promise<CustomMapImage> {
  const tenantParam = tenant && tenant !== '' ? `${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/custom-map-image`,
      { ...newCustomMapImage, tenantId: tenantParam },
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
