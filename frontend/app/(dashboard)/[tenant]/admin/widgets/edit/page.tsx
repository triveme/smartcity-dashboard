'use client';

import { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useQuery } from '@tanstack/react-query';

import PageHeadline from '@/ui/PageHeadline';
import WidgetWizard from '@/components/Wizards/WidgetWizard';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';

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
  const dashboardStyle: CSSProperties = {
    backgroundColor: corporateInfo?.dashboardPrimaryColor || '#2B3244',
    minHeight: '100vh',
    flexGrow: 1,
    marginLeft: isCollapsed ? '80px' : '250px',
    maxWidth: 'auto',
    width: 'auto',
    color: corporateInfo?.dashboardFontColor || '#fff',
    borderColor: corporateInfo?.panelBorderColor || '#2B3244',
    borderRadius: corporateInfo?.panelBorderRadius || '4px',
    borderWidth: corporateInfo?.panelBorderSize || '8px',
  };

  return (
    <div
      style={dashboardStyle}
      className="h-full flex flex-col justify-start p-10 overflow-auto"
    >
      <div>
        <PageHeadline
          headline="Widget Wizard"
          fontColor={corporateInfo?.dashboardFontColor}
        ></PageHeadline>
      </div>
      <WidgetWizard
        iconColor={corporateInfo?.dashboardFontColor || '#fff'}
        borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
        backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
        hoverColor={corporateInfo?.menuHoverColor || '#FFFFFF50'}
      />
    </div>
  );
}
