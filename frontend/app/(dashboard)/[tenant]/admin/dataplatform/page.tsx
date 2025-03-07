'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';

import PageHeadline from '@/ui/PageHeadline';
import CreateButton from '@/ui/Buttons/CreateButton';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import Table from '@/components/Table';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { TableConfig, AuthData } from '@/types';
import { getAuthDatasByTenant } from '@/api/authData-service';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';

const tableConfig: TableConfig<AuthData> = {
  columns: [{ name: 'name', displayName: 'Name' }],
  viewsPerPage: 10,
  maxPages: 1,
};

export default function DataPlatform(): ReactElement {
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

  const { openSnackbar } = useSnackbar();
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
    color: corporateInfo?.dashboardFontColor || '#FFFFFF',
  };

  const { data, refetch, isError, error, isPending, isSuccess } = useQuery({
    queryKey: ['auth-datas'],
    queryFn: () => getAuthDatasByTenant(auth?.user?.access_token, tenant),
  });

  // Use useEffect for handling the snackbar
  useEffect(() => {
    if (isError) {
      openSnackbar('Fehler beim Abfragen der Dataplattform!', 'error');
    }
  }, [isSuccess, isError, openSnackbar]);

  if (isError) {
    return (
      <div style={dashboardStyle} className="p-2">
        Error: {error.message}{' '}
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-row min-h-screen justify-center items-center text-2xl">
        <DashboardIcons iconName="Spinner" color={dashboardStyle.color} />
      </div>
    );
  }

  return (
    <div style={dashboardStyle} className="p-10 h-full">
      <div className="flex justify-between items-center content-center">
        <PageHeadline
          headline="Dataplattform"
          fontColor={corporateInfo?.dashboardFontColor}
        />
        <CreateButton />
      </div>
      <Table
        tableConfig={tableConfig}
        tableContent={data && data.length > 0 ? data : []}
        contentType="AuthData"
        refetchData={refetch}
        iconColor={corporateInfo?.dashboardFontColor || '#fff'}
        backgroundColor={corporateInfo?.headerPrimaryColor || '#2B3244'}
        hoverColor={corporateInfo?.menuHoverColor || '#fff'}
        borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
        showSuffixText={true}
      />
    </div>
  );
}
