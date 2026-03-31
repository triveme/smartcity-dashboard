import axios from 'axios';
import { getOrchideoConnectUrl } from '@/utils/envHelper';

import { DataConfigRequestType } from '@/types/wizard';

export async function getCollections(
  args: string | undefined,
  accessToken: string | undefined,
): Promise<string[]> {
  const orchideoConnectUrl = getOrchideoConnectUrl();
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;
    const response = await axios.get(
      `${orchideoConnectUrl}/wizard/collections`,
      {
        headers,
        params: {
          apiid: args,
        },
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getSourcesForCollection(
  args: DataConfigRequestType,
): Promise<string[]> {
  const orchideoConnectUrl = getOrchideoConnectUrl();
  try {
    const headers = args.accessToken
      ? { Authorization: `Bearer ${args.accessToken}` }
      : undefined;
    const response = await axios.get(
      `${orchideoConnectUrl}/wizard/sources`,
      {
        headers,
        params: {
          collection: args.collection,
          apiid: args.apiId,
        },
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getAttributeForSource(
  args: DataConfigRequestType,
): Promise<string[]> {
  const orchideoConnectUrl = getOrchideoConnectUrl();
  const headers = args.accessToken
    ? { Authorization: `Bearer ${args.accessToken}` }
    : undefined;
  try {
    const response = await axios.get(
      `${orchideoConnectUrl}/wizard/attributes`,
      {
        headers,
        params: {
          collection: args.collection,
          source: args.source,
          apiid: args.apiId,
        },
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getSensorsForSource(
  args: DataConfigRequestType,
): Promise<string[]> {
  const orchideoConnectUrl = getOrchideoConnectUrl();
  try {
    const headers = args.accessToken
      ? { Authorization: `Bearer ${args.accessToken}` }
      : undefined;
    const response = await axios.get(
      `${orchideoConnectUrl}/wizard/entities`,
      {
        headers,
        params: {
          collection: args.collection,
          source: args.source,
          attribute: args.attribute,
          apiid: args.apiId,
        },
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
