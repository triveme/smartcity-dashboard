import axios from 'axios';

import { CorporateInfo } from '@/types';
import { env } from 'next-runtime-env';
import Cookies from 'js-cookie';
import { DEFAULT_CI } from '@/utils/objectHelper';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function getCorporateInfosWithLogos(
  accessToken: string | undefined,
  tenant?: string | undefined,
): Promise<CorporateInfo> {
  try {
    const isLightTheme = Cookies.get('isLightTheme') === 'true';
    const tenantParam = tenant && tenant !== '' ? `/tenant/${tenant}` : '';

    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/corporate-infos${tenantParam}?includeLogos=true`,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    const data = response.data;

    if (Array.isArray(data) && data.length > 0) {
      return isLightTheme ? data[0] : data[1];
    }
    throw new Error('Unexpected data format');
  } catch (err) {
    console.error('Failed to fetch corporate info:', err);
    return DEFAULT_CI;
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
