import axios from 'axios';

import { WidgetToPanel } from '@/types';
import { getBackendUrl } from '@/utils/envHelper';

export async function postWidgetToPanelRelation(
  accessToken: string | undefined,
  widgetId: string,
  panelId: string,
  position: number,
): Promise<WidgetToPanel> {
  const backendUrl = getBackendUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${backendUrl}/widgets-to-panels/`,
      {
        widgetId: widgetId,
        panelId: panelId,
        position: position,
      },
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on postWidgetToPanelRelation:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
export async function bulkUpdateWidgetToPanelRelations(
  accessToken: string | undefined,
  updates: WidgetToPanel[],
): Promise<WidgetToPanel[]> {
  const backendUrl = getBackendUrl();

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.patch(
      `${backendUrl}/widgets-to-panels/bulk-update`,
      updates,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on bulkUpdateWidgetToPanelRelations:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function deleteWidgetToPanelRelation(
  accessToken: string | undefined,
  widgetId: string,
  panelId: string,
): Promise<WidgetToPanel> {
  const backendUrl = getBackendUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.delete(
      `${backendUrl}/widgets-to-panels/${widgetId}/${panelId}`,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on postWidgetToPanelRelation:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function patchWidgetToPanelRelation(
  accessToken: string | undefined,
  widgetId: string,
  newWidgetId: string,
  panelId: string,
): Promise<WidgetToPanel> {
  const backendUrl = getBackendUrl();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${backendUrl}/widgets-to-panels/${widgetId}/${panelId}`,
      {
        widgetId: newWidgetId,
      },
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on patchWidgetToPanelRelation:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
