'use client';
import { ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

import PageHeadline from '@/ui/PageHeadline';
import MenuWizard from '@/components/Wizards/MenuWizard';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';

export default function Menu(): ReactElement {
  const auth = useAuth();
  const tenant = getTenantOfPage();
  const accessToken = auth.user?.access_token;
  const isPageAllowed = tenant
    ? accessToken
      ? isUserMatchingTenant(accessToken, tenant)
      : false
    : true;

  const unauthorizedView = (
    <div className="pl-64">Nicht authorisiert für diesen Mandanten!</div>
  );

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
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });
  //Dynamic Styling
  const dashboardStyle = {
    backgroundColor: corporateInfo?.dashboardPrimaryColor || '#2B3244',
    marginLeft: isCollapsed ? '80px' : '256px',
  };

  if (!isPageAllowed) {
    return unauthorizedView;
  }

  return (
    <div
      style={dashboardStyle}
      className="flex-grow relative overflow-auto h-full"
    >
      <div className="flex flex-col p-10 w-full">
        <PageHeadline
          headline="Menu"
          fontColor={corporateInfo?.dashboardFontColor || '#FFFFFF'}
        />
        <MenuWizard
          iconColor={corporateInfo?.dashboardFontColor || '#FFFFFF'}
          borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
          backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          fontColor={corporateInfo?.dashboardFontColor || '#FFFFFF'}
          geColor={corporateInfo?.menuFontColor || '#FFFFFF'}
        />
      </div>
    </div>
  );
}
