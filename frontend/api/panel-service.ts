import axios from 'axios';

import { Panel } from '@/types';
import { getBackendUrl } from '@/utils/envHelper';

export async function getPanelsByDashboardId(
  accessToken: string | undefined,
  dashboardId: string,
): Promise<Panel[]> {
  const backendUrl = getBackendUrl();
  try {
    const response = await axios.get(
      `${backendUrl}/panels/dashboard/${dashboardId}`,
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

export async function updatePanel(
  accessToken: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatePanel: Panel & { [key: string]: any },
): Promise<Panel> {
  const backendUrl = getBackendUrl();
  if (updatePanel.widgets) {
    delete updatePanel.widgets;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${backendUrl}/panels/${updatePanel.id}`,
      updatePanel,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postPanel:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function postPanel(
  accessToken: string | undefined,
  newPanel: Panel,
): Promise<Panel> {
  const backendUrl = getBackendUrl();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${backendUrl}/panels`,
      newPanel,
      {
        headers: headers,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postPanel:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function deletePanel(
  accessToken: string | undefined,
  id: string,
): Promise<void> {
  const backendUrl = getBackendUrl();
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    await axios.delete(`${backendUrl}/panels/${id}`, {
      headers: headers,
    });
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on deletePanel:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
