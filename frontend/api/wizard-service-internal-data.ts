import axios from 'axios';

import { DataConfigRequestType } from '@/types/wizard';

const NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL =
  process.env.NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL;

export async function getCollections(
  args: string | undefined,
  accessToken: string | undefined,
): Promise<string[]> {
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;
    const response = await axios.get(
      `${NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL}/wizard/collections`,
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
  tenant?: string,
): Promise<string[]> {
  try {
    const headers = args.accessToken
      ? { Authorization: `Bearer ${args.accessToken}` }
      : undefined;
    const response = await axios.get(
      `${NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL}/wizard/sources`,
      {
        headers,
        params: {
          collection: args.collection,
          tenant: tenant,
        },
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getEntitiesForSource(
  args: DataConfigRequestType,
): Promise<string[]> {
  try {
    const headers = args.accessToken
      ? { Authorization: `Bearer ${args.accessToken}` }
      : undefined;
    const response = await axios.get(
      `${NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL}/wizard/entities`,
      {
        headers,
        params: {
          collection: args.collection,
          source: args.source,
          attribute: args.attribute,
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
  const headers = args.accessToken
    ? { Authorization: `Bearer ${args.accessToken}` }
    : undefined;
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_INTERNAL_DATA_SERVICE_URL}/wizard/attributes`,
      {
        headers,
        params: {
          collection: args.collection,
          source: args.source,
        },
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
