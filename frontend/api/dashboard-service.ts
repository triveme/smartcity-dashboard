import axios from 'axios';

import { Dashboard, DashboardWithContent } from '@/types';
import { env } from 'next-runtime-env';
import { PaginatedResult, UserPagination } from '@/types/pagination';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function getDashboardByIdWithContent(
  accessToken: string | undefined,
  dashboardId: string,
): Promise<DashboardWithContent> {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;

  const fetched = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/dashboards/${dashboardId}?includeContent=true`,
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

export async function getDashboardByIdWithStructure(
  accessToken: string | undefined,
  dashboardId: string,
): Promise<DashboardWithContent> {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;

  const fetched = await fetch(
    `${NEXT_PUBLIC_BACKEND_URL}/dashboards/with-widgets/${dashboardId}`,
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

export async function getDashboards(
  accessToken: string | undefined,
  includeContent?: boolean,
  tenant?: string | undefined,
): Promise<Dashboard[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {};
    if (includeContent !== undefined) {
      params.includeContent = includeContent;
    }

    let url = '';
    if (tenant && tenant !== '') {
      url = `${NEXT_PUBLIC_BACKEND_URL}/dashboards/tenant/${tenant}`;
    } else {
      url = `${NEXT_PUBLIC_BACKEND_URL}/dashboards`;
    }

    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    // Perform the GET request with axios
    const response = await axios.get(url, {
      params,
      headers,
    });

    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function searchDashboards(
  accessToken: string | undefined,
  tenant?: string | undefined,
  search?: string | undefined,
  pagination?: UserPagination,
): Promise<PaginatedResult<Dashboard>> {
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {};
    if (tenant && tenant !== '') {
      params.abbreviation = tenant;
    }
    params.search = search;
    if (pagination) {
      params.page = pagination.page;
      params.limit = pagination.limit;
    }

    const url = `${NEXT_PUBLIC_BACKEND_URL}/dashboards/search`;
    // Perform the GET request with axios
    const response = await axios.get(url, {
      params,
      headers,
    });

    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getDashboardDownloadData(
  accessToken: string | undefined,
  widgetsIds?: string[],
  dashboardId?: string,
): Promise<string> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/dashboards/download-data/${dashboardId}`,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
        responseType: 'blob',
        params: { ids: widgetsIds ? widgetsIds : [] },
      },
    );

    const csvData = await response.data.text();

    return csvData;
  } catch (err) {
    console.error('Error fetching CSV data:', err);
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on dashboardDownloadData:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function postDashboard(
  accessToken: string | undefined,
  newDashboard: Dashboard,
  tenant?: string | undefined,
): Promise<Dashboard> {
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/dashboards${tenantParam}`,
      newDashboard,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postDashboard:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function updateDashboard(
  accessToken: string | undefined,
  updateDashboard: Dashboard,
  tenant?: string | undefined,
): Promise<Dashboard> {
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${NEXT_PUBLIC_BACKEND_URL}/dashboards/${updateDashboard.id}${tenantParam}`,
      updateDashboard,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on updateDashboard:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function duplicateDashboard(
  accessToken: string | undefined,
  dashboardId: string,
  tenant?: string | undefined,
): Promise<DashboardWithContent> {
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/dashboards/duplicate/${dashboardId}${tenantParam}`,
      {},
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on duplicateDashboard:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function deleteDashboard(
  accessToken: string | undefined,
  dashboardId: string,
  tenant?: string | undefined,
): Promise<Dashboard> {
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.delete(
      `${NEXT_PUBLIC_BACKEND_URL}/dashboards/${dashboardId}${tenantParam}`,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on deleteDashboard:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
