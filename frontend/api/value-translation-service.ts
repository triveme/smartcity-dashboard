import { ValueTranslation } from '@/types';
import axios from 'axios';
import { env } from 'next-dynenv';

type CreateTenantTranslation = {
  category: string;
  rawValue: string;
  label: string;
};

type UpdateValueTranslation = Pick<ValueTranslation, 'label'> & {
  label: string;
};

const NEXT_PUBLIC_BACKEND_URL = env('NEXT_PUBLIC_BACKEND_URL');

export const getValueTranslations = async (
  tenant: string,
  accessToken?: string,
): Promise<ValueTranslation[]> => {
  try {
    const { data } = await axios.get<ValueTranslation[]>(
      `${NEXT_PUBLIC_BACKEND_URL}/value-translation/${tenant}`,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createTranslation = async (
  tenant: string,
  body: CreateTenantTranslation,
  accessToken?: string,
): Promise<ValueTranslation> => {
  try {
    const { data } = await axios.post<ValueTranslation>(
      `${NEXT_PUBLIC_BACKEND_URL}/value-translation/${tenant}`,
      body,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateTranslation = async (
  tenant: string,
  id: string,
  body: UpdateValueTranslation,
  accessToken?: string,
): Promise<ValueTranslation> => {
  try {
    const { data } = await axios.patch<ValueTranslation>(
      `${NEXT_PUBLIC_BACKEND_URL}/value-translation/${tenant}/${id}`,
      body,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteTranslation = async (
  tenant: string,
  id: string,
  accessToken?: string,
): Promise<ValueTranslation> => {
  try {
    const { data } = await axios.delete<ValueTranslation>(
      `${NEXT_PUBLIC_BACKEND_URL}/value-translation/${tenant}/${id}`,
      {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : undefined,
      },
    );

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
