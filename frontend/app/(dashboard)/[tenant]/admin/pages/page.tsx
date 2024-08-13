'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';

import Table from '@/components/Table';
import PageHeadline from '@/ui/PageHeadline';
import CreateButton from '@/ui/Buttons/CreateButton';
import { getDashboards } from '@/api/dashboard-service';
import { Dashboard, TableConfig } from '@/types';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';

const tableConfig: TableConfig<Dashboard> = {
  columns: ['url', 'name', 'visibility'],
  viewsPerPage: 10,
  maxPages: 1,
};

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
    marginLeft: isCollapsed ? '80px' : '250px',
    color: corporateInfo?.dashboardFontColor || '#FFFFFF',
  };

  const { data, refetch, isSuccess, isError, error, isPending } = useQuery({
    queryKey: ['dashboards'],
    queryFn: () => getDashboards(auth?.user?.access_token, false, tenant),
  });

  useEffect(() => {
    if (isError) {
      openSnackbar('Fehler beim Abfragen der Dashboardseiten!', 'error');
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
      <div
        style={dashboardStyle}
        className="flex flex-row min-h-screen justify-center items-center text-2xl"
      >
        <DashboardIcons iconName="Spinner" color={dashboardStyle.color} />
      </div>
    );
  }
  return (
    <div style={dashboardStyle} className="h-full p-10">
      <div className="flex justify-between items-center content-center">
        <PageHeadline
          headline="Dashboardseiten"
          fontColor={dashboardStyle.color}
        />
        <CreateButton />
      </div>
      <Table
        tableConfig={tableConfig}
        tableContent={data || []}
        contentType="dashboard"
        refetchData={refetch}
        iconColor={corporateInfo?.dashboardFontColor || '#fff'}
        backgroundColor={corporateInfo?.headerPrimaryColor || '#2B3244'}
        hoverColor={corporateInfo?.menuHoverColor || '#fff'}
        borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
      />
    </div>
  );
}
