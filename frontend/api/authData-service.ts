import axios from 'axios';
import { AuthData } from '@/types';
import { getBackendUrl } from '@/utils/envHelper';

export async function getAuthDatasByTenant(
  accessToken: string | undefined,
  tenant: string | undefined,
): Promise<AuthData[]> {
  const backendUrl = getBackendUrl();
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const fetched = await fetch(
    `${backendUrl}/auth-datas/tenant/${tenant}`,
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
  const backendUrl = getBackendUrl();
  try {
    const response = await axios.get(
      `${backendUrl}/auth-datas/${authDataId}`,
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
  const backendUrl = getBackendUrl();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${backendUrl}/auth-datas/${updateAuthData.id}`,
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
  const backendUrl = getBackendUrl();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${backendUrl}/auth-datas`,
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
  const backendUrl = getBackendUrl();
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    await axios.delete(`${backendUrl}/auth-datas/${authDataId}`, {
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
