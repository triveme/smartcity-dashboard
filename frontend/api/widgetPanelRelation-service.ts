import axios from 'axios';

import { WidgetToPanel } from '@/types';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function postWidgetToPanelRelation(
  accessToken: string | undefined,
  widgetId: string,
  panelId: string,
  position: number,
): Promise<WidgetToPanel> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/widgets-to-panels/`,
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
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await axios.patch(
      `${NEXT_PUBLIC_BACKEND_URL}/widgets-to-panels/bulk-update`,
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
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.delete(
      `${NEXT_PUBLIC_BACKEND_URL}/widgets-to-panels/${widgetId}/${panelId}`,
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
