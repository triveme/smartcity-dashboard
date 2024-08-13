'use client';

import { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useQuery } from '@tanstack/react-query';

import { getCorporateInfosWithLogos } from '@/app/actions';
import PageHeadline from '@/ui/PageHeadline';
import SupportRequestWizard from '@/components/Wizards/SupportRequestWizard';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';

export default function SupportRequest(): ReactElement {
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

  const { data: corporateInfo } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(),
    enabled: false,
  });
  //Dynamic Styling
  const dashboardStyle: CSSProperties = {
    backgroundColor: corporateInfo?.dashboardPrimaryColor || '#2B3244',
    marginLeft: isCollapsed ? '80px' : '256px',
    color: corporateInfo?.dashboardFontColor || '#fff',
    borderColor: corporateInfo?.panelBorderColor || '#fff',
  };

  return (
    <div style={dashboardStyle} className="p-10 h-full flex flex-col ">
      <PageHeadline
        headline="Supportanfrage"
        fontColor={corporateInfo?.dashboardFontColor}
      />
      <SupportRequestWizard
        borderColor={dashboardStyle.borderColor || '#fff'}
        backgroundColor={dashboardStyle.backgroundColor || '#2B3244'}
        iconColor={dashboardStyle.color || '#fff'}
      />
    </div>
  );
}
