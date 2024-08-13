import axios from 'axios';

import { QueryConfig } from '@/types';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function getQueryConfigs(
  accessToken: string | undefined,
): Promise<QueryConfig[]> {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const fetched = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/query-configs`, {
    headers,
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
    });
  return fetched;
}

export async function getQueryConfigById(
  accessToken: string | undefined,
  queryConfigId: string,
): Promise<QueryConfig> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/query-configs/${queryConfigId}`,
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

export async function getQueryConfigByTabId(
  accessToken: string | undefined,
  tabId: string,
): Promise<QueryConfig> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/query-configs/tab/${tabId}`,
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

export async function postQueryConfig(
  accessToken: string | undefined,
  newQueryConfig: QueryConfig,
): Promise<QueryConfig & { queryId: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/query-configs`,
      newQueryConfig,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postQueryConfig:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function updateQueryConfig(
  accessToken: string | undefined,
  updateQueryConfig: QueryConfig,
): Promise<QueryConfig> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${NEXT_PUBLIC_BACKEND_URL}/query-configs/${updateQueryConfig.id}`,
      {
        ...updateQueryConfig,
        createdAt: undefined,
        updatedAt: undefined,
        hash: undefined,
      },
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on updateQueryConfig:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function deleteQueryConfig(
  accessToken: string | undefined,
  queryConfigId: string,
): Promise<QueryConfig> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.delete(
      `${NEXT_PUBLIC_BACKEND_URL}/query-configs/${queryConfigId}`,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on deleteQueryConfig:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
