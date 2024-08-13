'use server';

import { CorporateInfo } from '@/types';
import { DEFAULT_CI } from '@/utils/objectHelper';

export async function getCorporateInfosWithLogos(
  tenant?: string | undefined,
): Promise<CorporateInfo> {
  try {
    let ciColors = DEFAULT_CI;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/corporate-infos/tenant/${tenant}?includeLogos=true`,
      { next: { revalidate: 0 } },
    );
    if (!response.ok) {
      throw new Error(
        `Network response was not ok: ${response.status} ${response.statusText}`,
      );
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    // Stream the response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      if (value) {
        result += decoder.decode(value, { stream: !streamDone });
      }
      done = streamDone;
    }

    const data = JSON.parse(result);

    if (Array.isArray(data) && data.length > 0) {
      ciColors = data[0];
    } else {
      ciColors = data;
    }
    return ciColors;
  } catch (error) {
    console.error('Failed to fetch corporate info:', error);
    return DEFAULT_CI;
  }
}

export async function getTenantExists(
  tenantAbbreviation: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/tenants/exists/${tenantAbbreviation}`,
      {
        headers: undefined,
      },
    );
    return await response.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getDashboardUrlByTenantAbbreviation(
  tenantAbbreviation: string,
): Promise<string> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboards/tenant/url/${tenantAbbreviation}`,
      {
        headers: undefined,
      },
    );
    const urls = await response.json(); // Assuming the response is JSON encoded

    if (urls.length > 0) {
      return urls[0]; // Return the first URL from the array
    } else {
      return '/not-found';
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getFirstDashboardUrl(): Promise<string> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/dashboards/first/url/`,
      {
        headers: undefined,
      },
    );
    const urls = await response.json(); // Assuming the response is JSON encoded

    if (urls.length > 0) {
      return urls[0]; // Return the first URL from the array
    } else {
      return '/not-found';
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}
