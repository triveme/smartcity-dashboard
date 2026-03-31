import axios from 'axios';

import { Tab } from '@/types';
import { getBackendUrl } from '@/utils/envHelper';

export async function getTabByWidgetId(
  accessToken: string | undefined,
  widgetId: string,
): Promise<Tab> {
  const backendUrl = getBackendUrl();
  try {
    const response = await axios.get(
      `${backendUrl}/tabs/widget/${widgetId}`,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );
    return response.data[0] || {};
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getTabByComponentTypeByTenant(
  accessToken: string | undefined,
  tenant: string,
  componentType: string,
): Promise<Tab> {
  const backendUrl = getBackendUrl();
  try {
    const response = await axios.get(
      `${backendUrl}/tabs/tenant/${tenant}?type=${componentType}`,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );
    return response.data[0] || {};
  } catch (err) {
    console.error(err);
    throw err;
  }
}
