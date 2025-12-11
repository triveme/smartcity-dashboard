import axios from 'axios';

import { CorporateInfo } from '@/types';

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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
