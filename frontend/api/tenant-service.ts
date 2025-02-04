import axios from 'axios';
import { Tenant } from '@/types';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function getTenants(
  accessToken: string | undefined,
): Promise<Tenant[]> {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const fetched = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/tenants`, {
    headers,
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
    });
  return fetched;
}

export async function postTenant(
  accessToken: string | undefined,
  newTenant: Tenant,
): Promise<Tenant> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/tenants`,
      newTenant,
      {
        headers: headers,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postTenant:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function updateTenant(
  accessToken: string | undefined,
  updateTenant: Tenant,
): Promise<Tenant> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${NEXT_PUBLIC_BACKEND_URL}/tenants/${updateTenant.id}`,
      updateTenant,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on updateTenant:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function deleteTenant(
  accessToken: string | undefined,
  tenantId: string,
): Promise<Tenant> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.delete(
      `${NEXT_PUBLIC_BACKEND_URL}/tenants/${tenantId}`,
      {
        headers: headers,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on deleteTenant:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
