'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

import PageHeadline from '@/ui/PageHeadline';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';
import InternalDataUploadWizard from '@/components/Wizards/InternalDataUploadWizard';

export default function Pages(): ReactElement {
  const auth = useAuth();
  const tenant = getTenantOfPage();
  let isPageAllowed = true;

  if (tenant) {
    isPageAllowed = isUserMatchingTenant(auth.user!.access_token, tenant);
  }

  if (!isPageAllowed) {
    return (
      <div className="pl-64">Nicht authorisiert für diesen Mandanten!</div>
    );
  }
  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Tracking window size and adjust sidebar visibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = (): void => {
        setIsCollapsed(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  //Dynamic Styling
  const dashboardStyle = {
    backgroundColor: data?.dashboardPrimaryColor || '#2B3244',
    marginLeft: isCollapsed ? '80px' : '250px',
    color: data?.dashboardFontColor,
  };
  return (
    <div
      style={dashboardStyle}
      className="h-full flex flex-col justify-start p-10"
    >
      <div>
        <PageHeadline
          headline="Interne Datenverwaltung"
          fontColor={data?.dashboardFontColor || '#FFFFFF'}
        />
      </div>
      <InternalDataUploadWizard
        borderColor={data?.panelBorderColor || '#2B3244'}
        backgroundColor={data?.dashboardPrimaryColor || '#2B3244'}
        tenant={tenant!}
      />
    </div>
  );
}
