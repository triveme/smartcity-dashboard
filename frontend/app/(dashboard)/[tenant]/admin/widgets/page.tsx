'use client';

import { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useQuery } from '@tanstack/react-query';

import PageHeadline from '@/ui/PageHeadline';
import CreateButton from '@/ui/Buttons/CreateButton';
import Table from '@/components/Table';
import { getWidgets } from '@/api/widget-service';
import { TableConfig, Widget } from '@/types';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';

const tableConfig: TableConfig<Widget> = {
  columns: ['name', 'height', 'width', 'visibility'],
  viewsPerPage: 10,
  maxPages: 1,
};

export default function Widgets(): ReactElement {
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
  const dashboardStyle: CSSProperties = {
    backgroundColor: corporateInfo?.dashboardPrimaryColor || '#2B3244',
    marginLeft: isCollapsed ? '80px' : '250px',
    color: corporateInfo?.dashboardFontColor || '#FFFFFF',
  };

  const { data, refetch, isError, error, isPending, isSuccess } = useQuery({
    queryKey: ['widgets'],
    queryFn: () => getWidgets(auth?.user?.access_token, tenant),
  });

  // Use useEffect for handling the snackbar
  useEffect(() => {
    if (isError) {
      openSnackbar('Fehler beim Abfragen der Widgets!', 'error');
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
        <DashboardIcons iconName="Spinner" color={dashboardStyle.color!} />
      </div>
    );
  }

  return (
    <div style={dashboardStyle} className="h-full p-10 overflow-y-auto">
      <div className="flex justify-between items-center content-center">
        <PageHeadline headline="Widgets" fontColor={dashboardStyle.color} />
        <CreateButton />
      </div>
      <Table
        tableConfig={tableConfig}
        tableContent={data || []}
        contentType="widget"
        refetchData={refetch}
        iconColor={corporateInfo?.dashboardFontColor || '#fff'}
        backgroundColor={corporateInfo?.headerPrimaryColor || '#2B3244'}
        hoverColor={corporateInfo?.menuHoverColor || '#fff'}
        borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
      />
    </div>
  );
}
