import axios from 'axios';
import { env } from 'next-runtime-env';

const NEXT_PUBLIC_NGSI_SERVICE_URL = env('NEXT_PUBLIC_NGSI_SERVICE_URL');

export async function getFiwareTypes(
  accessToken: string | undefined,
  fiwareService: string,
  datasourceId: string,
): Promise<string[]> {
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;
    const response = await axios.get(
      `${NEXT_PUBLIC_NGSI_SERVICE_URL}/fiwareWizard/types/${fiwareService}/${datasourceId}`,
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
): Promise<string[]> {
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;
    const response = await axios.get(
      `${NEXT_PUBLIC_NGSI_SERVICE_URL}/fiwareWizard/entityIds/${fiwareService}/${datasourceId}`,
      {
        headers,
        params: {
          fiwareType: args,
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
  args: string[] | undefined,
  accessToken: string | undefined,
  fiwareService: string,
  datasourceId: string,
): Promise<string[]> {
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;
    const response = await axios.get(
      `${NEXT_PUBLIC_NGSI_SERVICE_URL}/fiwareWizard/entityAttributes/${fiwareService}/${datasourceId}`,
      {
        headers,
        params: {
          sensorId: args,
        },
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
