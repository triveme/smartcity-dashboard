/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

import { GroupingElement } from '@/types';
import { env } from 'next-dynenv';

export async function getMenuGroupingElements(
  tenant: string | undefined,
  accessToken: string,
): Promise<GroupingElement[]> {
  const backendUrl = env('NEXT_PUBLIC_BACKEND_URL');
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;

    let url = '';
    if (tenant && tenant !== '') {
      url = `${backendUrl}/groupingElements/tenant/${tenant}`;
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

export async function getMenuGroupingElementByUrl(
  urlParam: string,
  tenant: string,
): Promise<GroupingElement> {
  const backendUrl = env('NEXT_PUBLIC_BACKEND_URL');
  try {
    const params: any = {};
    params.abbreviation = tenant;
    const url = `${backendUrl}/groupingElements/url/${urlParam}`;
    const response = await axios.get(url, {
      params,
    });

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on getMenuGroupingElementByUrl:',
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
  const backendUrl = env('NEXT_PUBLIC_BACKEND_URL');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${backendUrl}/groupingElements`,
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
  const backendUrl = env('NEXT_PUBLIC_BACKEND_URL');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${backendUrl}/groupingElements/${newGroup.id}`,
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
  const backendUrl = env('NEXT_PUBLIC_BACKEND_URL');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.delete(
      `${backendUrl}/groupingElements/${id}`,
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
