import axios from 'axios';

import { Tab } from '@/types';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function getTabs(accessToken: string | undefined): Promise<Tab[]> {
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};
    const response = await axios.get(`${NEXT_PUBLIC_BACKEND_URL}/tabs`, {
      headers,
    });
    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postTab:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function getTabById(
  accessToken: string | undefined,
  tabId: string,
): Promise<Tab> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/tabs/${tabId}`,
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
      console.error('HTTP Error on postTab:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function getTabByWidgetId(
  accessToken: string | undefined,
  widgetId: string,
): Promise<Tab> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/tabs/widget/${widgetId}`,
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

export async function postTab(
  accessToken: string | undefined,
  newTab: Tab,
): Promise<Tab> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/tabs`,
      newTab,
      {
        headers: headers,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postTab:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function updateTab(
  accessToken: string | undefined,
  updateTab: Tab,
): Promise<Tab> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${NEXT_PUBLIC_BACKEND_URL}/tabs/${updateTab.id}`,
      updateTab,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on updateTab:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function deleteTab(
  accessToken: string | undefined,
  tabId: string,
): Promise<Tab> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.delete(
      `${NEXT_PUBLIC_BACKEND_URL}/tabs/${tabId}`,
      {
        headers: headers,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on deleteTab:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
