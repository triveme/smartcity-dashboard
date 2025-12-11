import { InternalData } from '@/types';
import axios from 'axios';

const NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL =
  process.env.NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL;

type IntenalDataUpload = {
  collection: string;
  type: string;
  data: string;
  source: string;
  firstDataColIndex?: number;
  firstDataRowIndex?: number;
  timeGroupRowCount?: number;
  tenantAbbreviation: string;
};

export async function checkAvailability(): Promise<boolean> {
  try {
    const r = await axios.head(`${NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL}/data`);
    if (r) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
export async function postData(
  accessToken: string | undefined,
  data: IntenalDataUpload,
): Promise<string[]> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const response = await axios.post(
      `${NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL}/data`,
      data,
      {
        headers,
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function updateData(
  id: string | undefined,
  accessToken: string | undefined,
  data: Partial<IntenalDataUpload>,
): Promise<string[]> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    const response = await axios.patch(
      `${NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL}/data/${id}`,
      data,
      {
        headers,
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getInternalDataByTenant(
  accessToken: string | undefined,
  tenant: string | undefined,
): Promise<InternalData[]> {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;

  try {
    const fetched = await axios.get(
      `${NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL}/data`,
      {
        headers,
        params: {
          tenant, // Assuming the API accepts
        },
      },
    );
    return fetched.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getInternalDataById(
  accessToken: string | undefined,
  id: string | undefined,
): Promise<InternalData> {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;

  try {
    const fetched = await axios.get(
      `${NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL}/data/${id}`,
      {
        headers,
      },
    );
    return fetched.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function deleteData(
  accessToken: string | undefined,
  id: string,
): Promise<InternalData> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.delete(
      `${NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL}/data/${id}`,
      {
        headers: headers,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on deleteDataSource:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
