import { DataConfigRequestType } from '@/types/wizard';
import axios from 'axios';
import { env } from 'next-dynenv';

const NEXT_PUBLIC_PLANBAR_SERVICE_URL = env('NEXT_PUBLIC_PLANBAR_SERVICE_URL');

export type PlanbarEventType = {
  name: string;
  sensors: string[];
  attributes: string[];
};

export async function getCollections(
  args: string | undefined,
  accessToken: string | undefined,
): Promise<string[]> {
  try {
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;
    const response = await axios.get(
      `${NEXT_PUBLIC_PLANBAR_SERVICE_URL}/wizard/collections`,
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

export async function getSources(
  args: DataConfigRequestType,
): Promise<string[]> {
  try {
    const headers = args.accessToken
      ? { Authorization: `Bearer ${args.accessToken}` }
      : undefined;
    const response = await axios.get(
      `${NEXT_PUBLIC_PLANBAR_SERVICE_URL}/wizard/sources`,
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

export async function getAttributes(
  args: DataConfigRequestType,
): Promise<string[]> {
  const headers = args.accessToken
    ? { Authorization: `Bearer ${args.accessToken}` }
    : undefined;
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_PLANBAR_SERVICE_URL}/wizard/attributes`,
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

export async function getEntities(
  args: DataConfigRequestType,
): Promise<string[]> {
  try {
    const headers = args.accessToken
      ? { Authorization: `Bearer ${args.accessToken}` }
      : undefined;
    const response = await axios.get(
      `${NEXT_PUBLIC_PLANBAR_SERVICE_URL}/wizard/entities`,
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
