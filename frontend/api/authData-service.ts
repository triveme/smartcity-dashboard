import axios from 'axios';
import { AuthData } from '@/types';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function getAuthDatas(
  accessToken: string | undefined,
): Promise<AuthData[]> {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const fetched = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/auth-datas`, {
    headers,
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
    });
  return fetched;
}

export async function getAuthDatasByTenant(
  accessToken: string | undefined,
  tenant: string | undefined,
): Promise<AuthData[]> {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const fetched = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/auth-datas/tenant/${tenant}`,
    {
      headers,
    },
  )
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
    });
  return fetched;
}

export async function getAuthDataById(
  accessToken: string | undefined,
  authDataId: string,
): Promise<AuthData> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/auth-datas/${authDataId}`,
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

export async function updateAuthData(
  accessToken: string | undefined,
  updateAuthData: AuthData,
): Promise<AuthData> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${NEXT_PUBLIC_BACKEND_URL}/auth-datas/${updateAuthData.id}`,
      updateAuthData,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on updateAuthData:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function postAuthData(
  accessToken: string | undefined,
  newAuthData: AuthData,
): Promise<AuthData> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/auth-datas`,
      newAuthData,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postAuthData:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function deleteAuthData(
  accessToken: string | undefined,
  authDataId: string,
): Promise<void> {
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    await axios.delete(`${NEXT_PUBLIC_BACKEND_URL}/auth-datas/${authDataId}`, {
      headers: headers,
    });
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on deleteAuthData:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
