import { GeneralSettings } from '@/types';
import axios from 'axios';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function getGeneralSettings(
  tenant?: string | undefined,
  accessToken?: string | undefined,
): Promise<GeneralSettings> {
  try {
    const tenantParam = tenant && tenant !== '' ? `/tenant/${tenant}` : '';
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/general-settings${tenantParam}`,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on getGeneralSettings:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function createGeneralSettings(
  newGeneralSettings: GeneralSettings,
  accessToken?: string | undefined,
): Promise<GeneralSettings> {
  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/general-settings`,
      newGeneralSettings,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on createGeneralSettings:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function updateGeneralSettings(
  updatedGeneralSettings: GeneralSettings,
  accessToken?: string | undefined,
): Promise<GeneralSettings> {
  try {
    const response = await axios.patch(
      `${NEXT_PUBLIC_BACKEND_URL}/general-settings/${updatedGeneralSettings.id}`,
      updatedGeneralSettings,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on updateGeneralSettings:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function deleteGeneralSettings(
  id: string,
  accessToken?: string | undefined,
): Promise<void> {
  try {
    await axios.delete(`${NEXT_PUBLIC_BACKEND_URL}/general-settings/${id}`, {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on deleteGeneralSettings:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
