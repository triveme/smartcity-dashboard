import { GeneralSettings } from '@/types';
import axios from 'axios';
import { getBackendUrl } from '@/utils/envHelper';

export async function getGeneralSettingsByTenant(
  tenant?: string | undefined,
): Promise<GeneralSettings> {
  const backendUrl = getBackendUrl();
  try {
    const tenantParam = tenant && tenant !== '' ? `/tenant/${tenant}` : '';
    const response = await axios.get(
      `${backendUrl}/general-settings${tenantParam}`,
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on getGeneralSettingsByTenant:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function createGeneralSettings(
  newGeneralSettings: GeneralSettings,
  accessToken?: string | undefined,
): Promise<GeneralSettings> {
  const backendUrl = getBackendUrl();
  try {
    const response = await axios.post(
      `${backendUrl}/general-settings`,
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
  const backendUrl = getBackendUrl();
  try {
    const response = await axios.patch(
      `${backendUrl}/general-settings/${updatedGeneralSettings.id}`,
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
