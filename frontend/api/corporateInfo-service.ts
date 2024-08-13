import axios from 'axios';

import { CorporateInfo } from '@/types';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');
// see TODO in action.ts
export async function getCorporateInfo(
  accessToken: string | undefined,
  tenant?: string | undefined,
): Promise<CorporateInfo[]> {
  try {
    const tenantParam = tenant && tenant !== '' ? `/tenant/${tenant}` : '';
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/corporate-infos${tenantParam}`,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getCorporateInfosWithLogos(
  accessToken: string | undefined,
  tenant?: string | undefined,
): Promise<CorporateInfo> {
  try {
    const tenantParam = tenant && tenant !== '' ? `/tenant/${tenant}` : '';
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/corporate-infos${tenantParam}?includeLogos=true`,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function updateCorporateInfo(
  accessToken: string | undefined,
  updateCorporateInfo: CorporateInfo,
): Promise<CorporateInfo> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${NEXT_PUBLIC_BACKEND_URL}/corporate-infos/${updateCorporateInfo.id}`,
      updateCorporateInfo,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postCorporateInfo:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function postCorporateInfo(
  accessToken: string | undefined,
  newCorporateInfo: CorporateInfo,
  tenant?: string | undefined,
): Promise<CorporateInfo> {
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/corporate-infos${tenantParam}`,
      { ...newCorporateInfo, tenantId: tenant },
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postCorporateInfo:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function deleteCorporateInfo(
  accessToken: string | undefined,
  id: string,
): Promise<void> {
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    await axios.delete(`${NEXT_PUBLIC_BACKEND_URL}/corporate-infos/${id}`, {
      headers: headers,
    });
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on deleteCorporateInfo:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
