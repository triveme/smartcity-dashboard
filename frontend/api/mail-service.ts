import axios from 'axios';
import { Mail } from '@/types';

const NEXT_PUBLIC_MAIL_SERVICE_URL = process.env.NEXT_PUBLIC_MAIL_SERVICE_URL;

export async function sendMail(
  accessToken: string | undefined,
  emailContent: Mail,
): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const url = `${NEXT_PUBLIC_MAIL_SERVICE_URL}/mail/send`;

  try {
    const response = await axios.post(url, emailContent, { headers: headers });

    return response.data;
  } catch (err) {
    console.error(err);
    if (axios.isAxiosError(err)) {
      console.error('HTTP Error on sendMail:', err.response?.status);
      console.error('Response body:', err.response?.data);
    }
    throw err;
  }
}
