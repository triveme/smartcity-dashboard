import axios from 'axios';

import { ChartData } from '@/types';

const NEXT_PUBLIC_NGSI_SERVICE_URL = process.env.NEXT_PUBLIC_NGSI_SERVICE_URL;

export async function getFiwareTypes(
  accessToken: string | undefined,
  fiwareService: string,
  datasourceId: string,
  ngsiVersion: 'v2' | 'ld',
): Promise<string[]> {
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;
    const response = await axios.get(
      `${NEXT_PUBLIC_NGSI_SERVICE_URL}/fiwareWizard/types/${ngsiVersion}/${fiwareService}/${datasourceId}`,
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

export async function getEntityIds(
  args: string | undefined,
  accessToken: string | undefined,
  fiwareService: string,
  datasourceId: string,
  ngsiVersion: 'v2' | 'ld',
): Promise<string[]> {
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;
    const response = await axios.get(
      `${NEXT_PUBLIC_NGSI_SERVICE_URL}/fiwareWizard/entityIds/${ngsiVersion}/${fiwareService}/${datasourceId}`,
      {
        headers,
        params: {
          type: args,
        },
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getAttributes(
  args: string | undefined,
  accessToken: string | undefined,
  fiwareService: string,
  datasourceId: string,
  ngsiVersion: 'v2' | 'ld',
): Promise<string[]> {
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;
    const response = await axios.get(
      `${NEXT_PUBLIC_NGSI_SERVICE_URL}/fiwareWizard/entityAttributes/${ngsiVersion}/${fiwareService}/${datasourceId}`,
      {
        headers,
        params: {
          entityType: args,
        },
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function fetchOnDemandChartData(
  queryId: string,
  entityId: string,
  attribute: string,
): Promise<ChartData> {
  try {
    const response = await fetch(
      `${NEXT_PUBLIC_NGSI_SERVICE_URL}/ngsi/on-demand-data/${queryId}?entityId=${entityId}&attribute=${attribute}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error fetching chart data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch on-demand chart data:', error);
    throw error;
  }
}
