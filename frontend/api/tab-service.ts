import axios from 'axios';

import { Tab } from '@/types';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export async function getTabByWidgetId(
  accessToken: string | undefined,
  widgetId: string,
): Promise<Tab> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_BACKEND_URL}/tabs/widget/${widgetId}`,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );
    return response.data[0] || {};
  } catch (err) {
    console.error(err);
    throw err;
  }
}
