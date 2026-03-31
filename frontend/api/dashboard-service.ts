import axios from 'axios';

import { Dashboard, DashboardWithContent } from '@/types';
import { getBackendUrl } from '@/utils/envHelper';
import { PaginatedResult, UserPagination } from '@/types/pagination';

export async function getDashboardByIdWithContent(
  accessToken: string | undefined,
  dashboardId: string,
): Promise<DashboardWithContent> {
  const backendUrl = getBackendUrl();
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;

  const fetched = await fetch(
    `${backendUrl}/dashboards/${dashboardId}?includeContent=true`,
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
  const backendUrl = getBackendUrl();
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;

  const fetched = await fetch(
    `${backendUrl}/dashboards/with-widgets/${dashboardId}`,
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
  const backendUrl = getBackendUrl();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {};
    if (includeContent !== undefined) {
      params.includeContent = includeContent;
    }

    let url = '';
    if (tenant && tenant !== '') {
      url = `${backendUrl}/dashboards/tenant/${tenant}`;
    } else {
      url = `${backendUrl}/dashboards`;
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
  const backendUrl = getBackendUrl();
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

    const url = `${backendUrl}/dashboards/search`;
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
  const backendUrl = getBackendUrl();
  try {
    const response = await axios.get(
      `${backendUrl}/dashboards/download-data/${dashboardId}`,
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
  const backendUrl = getBackendUrl();
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${backendUrl}/dashboards${tenantParam}`,
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
  const backendUrl = getBackendUrl();
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${backendUrl}/dashboards/${updateDashboard.id}${tenantParam}`,
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
  const backendUrl = getBackendUrl();
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${backendUrl}/dashboards/duplicate/${dashboardId}${tenantParam}`,
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
  const backendUrl = getBackendUrl();
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.delete(
      `${backendUrl}/dashboards/${dashboardId}${tenantParam}`,
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
