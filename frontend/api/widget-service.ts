import axios from 'axios';

import { Widget, WidgetWithChildren } from '@/types';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function getWidgets(
  accessToken: string | undefined,
  tenant?: string | undefined,
): Promise<Widget[]> {
  const headers = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;

  let url = '';
  if (tenant && tenant !== '') {
    url = `${NEXT_PUBLIC_BACKEND_URL}/widgets/tenant/${tenant}`;
  } else {
    url = `${NEXT_PUBLIC_BACKEND_URL}/widgets`;
  }

  const fetched = await fetch(url, {
    headers,
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
    });
  return fetched;
}

export async function getWidgetById(
  accessToken: string | undefined,
  widgetId: string,
): Promise<Widget> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/widgets/${widgetId}`,
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

export async function getWidgetsByPanelId(
  accessToken: string | undefined,
  widgetId: string,
): Promise<Widget[]> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/widgets/panel/${widgetId}`,
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

export async function getWidgetDownloadData(
  accessToken: string | undefined,
  widgetId?: string,
): Promise<string> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/widgets/download-data/${widgetId}`,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
        responseType: 'blob',
      },
    );

    const csvData = await response.data.text();
    return csvData;
  } catch (err) {
    console.error('Error fetching CSV data:', err);
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on getWidgetDownloadData:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function postWidget(
  accessToken: string | undefined,
  newWidget: Widget,
  tenant?: string | undefined,
): Promise<Widget> {
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/widgets${tenantParam}`,
      newWidget,
      {
        headers: headers,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postWidget:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function updateWidget(
  accessToken: string | undefined,
  updateWidget: Widget,
): Promise<Widget> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${NEXT_PUBLIC_BACKEND_URL}/widgets/${updateWidget.id}`,
      updateWidget,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on updateWidget:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function deleteWidget(
  accessToken: string | undefined,
  widgetId: string,
): Promise<Widget> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.delete(
      `${NEXT_PUBLIC_BACKEND_URL}/widgets/${widgetId}`,
      {
        headers: headers,
      },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on deleteWidget:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function postWidgetWithChildren(
  accessToken: string | undefined,
  newWidgetWithChildren: WidgetWithChildren,
  tenant?: string | undefined,
): Promise<WidgetWithChildren> {
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/widgets/with-children${tenantParam}`,
      newWidgetWithChildren,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on postWidgetWithChildren:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function updateWidgetWithChildren(
  accessToken: string | undefined,
  updateWidgetWithChildren: WidgetWithChildren,
  tenant?: string | undefined,
): Promise<WidgetWithChildren> {
  const tenantParam = tenant && tenant !== '' ? `?tenant=${tenant}` : '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const widgetId = updateWidgetWithChildren.widget.id;
    const response = await axios.patch(
      `${NEXT_PUBLIC_BACKEND_URL}/widgets/with-children/${widgetId}${tenantParam}`,
      updateWidgetWithChildren,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on updateWidgetWithChildren:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function getWidgetWithChildrenById(
  accessToken: string | undefined,
  widgetId: string,
): Promise<WidgetWithChildren> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/widgets/with-children/${widgetId}`,
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
