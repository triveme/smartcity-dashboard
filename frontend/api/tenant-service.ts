import axios from 'axios';
import { Tenant } from '@/types';
import { env } from 'next-dynenv';

export async function getTenants(
  accessToken: string | undefined,
): Promise<Tenant[]> {
  const backendUrl = env('NEXT_PUBLIC_BACKEND_URL');
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;
  const fetched = await fetch(`${backendUrl}/tenants`, {
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
  const backendUrl = env('NEXT_PUBLIC_BACKEND_URL');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${backendUrl}/tenants`,
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
  const backendUrl = env('NEXT_PUBLIC_BACKEND_URL');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${backendUrl}/tenants/${updateTenant.id}`,
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
  const backendUrl = env('NEXT_PUBLIC_BACKEND_URL');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.delete(
      `${backendUrl}/tenants/${tenantId}`,
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
