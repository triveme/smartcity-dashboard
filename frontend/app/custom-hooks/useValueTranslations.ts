'use client';

import { getValueTranslations } from '@/api/value-translation-service';
import { useQuery } from '@tanstack/react-query';
import { getTenantOfPage } from '@/utils/tenantHelper';
import { useAuth } from 'react-oidc-context';

const TRANSLATIONS_REFRESH_INTERVAL = 2 * 60 * 1000;

export function useValueTranslations() {
  const tenant = getTenantOfPage();
  const auth = useAuth();
  const accessToken = auth.user?.access_token;

  return useQuery({
    queryKey: ['valueTranslations', tenant],
    queryFn: () =>
      tenant ? getValueTranslations(tenant, accessToken) : Promise.resolve([]),
    enabled: Boolean(tenant && accessToken),
    staleTime: TRANSLATIONS_REFRESH_INTERVAL,
    refetchInterval: TRANSLATIONS_REFRESH_INTERVAL,
    refetchIntervalInBackground: true,
  });
}
