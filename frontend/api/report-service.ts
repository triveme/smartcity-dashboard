import axios from 'axios';
import { env } from 'next-runtime-env';

import { ReportConfig } from '@/types';

const NEXT_PUBLIC_REPORT_SERVICE_URL = env('NEXT_PUBLIC_REPORT_SERVICE_URL');

export async function getReportConfigByQueryId(
  accessToken: string | undefined,
  queryId: string | undefined,
): Promise<ReportConfig> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_REPORT_SERVICE_URL}/configs/${queryId}`,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error(
        'HTTP Error on getReportConfigByQueryId:',
        err.response?.status,
      );
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function postReportConfig(
  accessToken: string | undefined,
  reportConfig: Partial<ReportConfig>,
): Promise<ReportConfig> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.post(
      `${NEXT_PUBLIC_REPORT_SERVICE_URL}/configs/`,
      reportConfig,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postReportConfig:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}

export async function updateReportConfig(
  accessToken: string | undefined,
  id: string,
  reportConfig: Partial<ReportConfig>,
): Promise<ReportConfig> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await axios.patch(
      `${NEXT_PUBLIC_REPORT_SERVICE_URL}/configs/${id}`,
      reportConfig,
      { headers: headers },
    );

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on postReportConfig:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
