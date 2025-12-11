import axios from 'axios';

import { Panel } from '@/types';

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getPanelsByDashboardId(
  accessToken: string | undefined,
  dashboardId: string,
): Promise<Panel[]> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/panels/dashboard/${dashboardId}`,
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
      `${NEXT_PUBLIC_BACKEND_URL}/panels/${updatePanel.id}`,
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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/panels`,
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
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    await axios.delete(`${NEXT_PUBLIC_BACKEND_URL}/panels/${id}`, {
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
