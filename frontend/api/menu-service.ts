import axios from 'axios';

import { GroupingElement } from '@/types';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function getMenuGroupingElements(
  tenant: string | undefined,
  accessToken: string,
): Promise<GroupingElement[]> {
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;

    let url = '';
    if (tenant && tenant !== '') {
      url = `${NEXT_PUBLIC_BACKEND_URL}/groupingElements/tenant/${tenant}`;
    }

    const response = await axios.get(url, { headers });

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on getMenuGroupingElements:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function postMenuGroupingElement(
  accessToken: string | undefined,
  newGroup: GroupingElement,
): Promise<GroupingElement> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/groupingElements`,
      newGroup,
      { headers: headers },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on postMenuGroupingElement:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function updateMenuGroupingElement(
  accessToken: string | undefined,
  newGroup: Partial<GroupingElement>,
): Promise<GroupingElement> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${NEXT_PUBLIC_BACKEND_URL}/groupingElements/${newGroup.id}`,
      newGroup,
      { headers: headers },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on updateMenuGroupingElement:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function deleteMenuGroupingElement(
  accessToken: string | undefined,
  id: string,
): Promise<GroupingElement> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.delete(
      `${NEXT_PUBLIC_BACKEND_URL}/groupingElements/${id}`,
      {
        headers: headers,
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on deletePanel:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
