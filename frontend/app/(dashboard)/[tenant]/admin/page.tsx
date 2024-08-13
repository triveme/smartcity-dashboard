'use client';

import { ReactElement } from 'react';
import { useAuth } from 'react-oidc-context';
import { useQuery } from '@tanstack/react-query';

import '@/components/dependencies/quill.snow.css';
import PageHeadline from '@/ui/PageHeadline';
import BlockContainer from '@/ui/BlockContainer';
import FullSizedLink from '@/ui/FullSizedLink';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';

export default function Home(): ReactElement {
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

  const { data: corporateInfo } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  //Dynamic Styling
  const dashboardStyle = {
    backgroundColor: corporateInfo?.dashboardPrimaryColor || '#2B3244',
    marginLeft: '256px',
  };
  const blockStyle = {
    borderWidth: corporateInfo?.widgetBorderSize || '4px',
    borderRadius: corporateInfo?.widgetBorderRadius || '8px',
    borderColor: corporateInfo?.widgetBorderColor || '#59647D',
    fontColor: corporateInfo?.widgetFontColor || '#fff',
    backgroundColor: corporateInfo?.widgetPrimaryColor || '#1D2330',
  };
  const adminUrl = tenant ? `/${tenant}/admin` : '/admin';

  return (
    <div style={dashboardStyle} className="h-full p-4">
      <div className="flex flex-col">
        <PageHeadline
          headline="General Management View"
          fontColor={corporateInfo?.fontColor}
        />
        <div className="grid grid-cols-12 gap-4">
          <BlockContainer props={blockStyle}>
            <FullSizedLink url={`${adminUrl}/widgets`}>Widgets</FullSizedLink>
          </BlockContainer>
          <BlockContainer props={blockStyle}>
            <FullSizedLink url={`${adminUrl}/pages`}>Seiten</FullSizedLink>
          </BlockContainer>
          <BlockContainer props={blockStyle}>
            <FullSizedLink url={`${adminUrl}/menu`}>Menu</FullSizedLink>
          </BlockContainer>
          <BlockContainer props={blockStyle}>
            <FullSizedLink url={`${adminUrl}/corporateidentity`}>
              Farbgestaltung
            </FullSizedLink>
          </BlockContainer>
          <BlockContainer props={blockStyle}>
            <FullSizedLink url={`${adminUrl}/dataplatform`}>
              Datenanbindung
            </FullSizedLink>
          </BlockContainer>
        </div>
      </div>
    </div>
  );
}
