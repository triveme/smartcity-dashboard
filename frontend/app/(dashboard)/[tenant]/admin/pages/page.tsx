'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';

import PageHeadline from '@/ui/PageHeadline';
import CreateButton from '@/ui/Buttons/CreateButton';
import { searchDashboards } from '@/api/dashboard-service';
import { Dashboard, TableColumn } from '@/types';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';
import { useRouter, useSearchParams } from 'next/navigation';
import PaginatedTable from '@/components/PaginatedTable';
import WizardTextfield from '@/ui/WizardTextfield';

/* eslint-disable @typescript-eslint/no-unused-vars */
const tableColumns: Array<TableColumn<Dashboard>> = [
  { name: 'url', displayName: 'URL' },
  { name: 'name', displayName: 'Name' },
  { name: 'visibility', displayName: 'Sichtbarkeit' },
];

export default function Pages(): ReactElement {
  const auth = useAuth();
  const tenant = getTenantOfPage();
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [userPagination, setUserPagination] = useState({
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '10', 10),
  });
  const [search, setSearch] = useState('');

  // Update URL search params whenever pagination state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', userPagination.page.toString());
    params.set('limit', userPagination.limit.toString());
    if (search !== '') {
      params.set('search', search);
    }
    router.replace(`?${params.toString()}`);
  }, [userPagination, search, router]);

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

  const {
    data: dashboardPage,
    refetch,
    isSuccess,
    isError,
    error,
    isPending,
  } = useQuery({
    queryKey: ['dashboards', userPagination, search],
    queryFn: () =>
      searchDashboards(
        auth?.user?.access_token,
        tenant,
        search,
        userPagination,
      ),
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

  return (
    <div style={dashboardStyle} className="h-full p-10">
      <div className="flex justify-between items-center content-center pb-4">
        <PageHeadline
          headline="Dashboardseiten"
          fontColor={dashboardStyle.color}
        />
        <CreateButton />
      </div>
      <div className="w-full pb-4">
        <WizardTextfield
          value={search}
          onChange={(value): void => setSearch(value.toString())}
          placeholderText={'Suche'}
          borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
          backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
        />
      </div>
      {isPending ? (
        <div className="flex justify-center text-2xl">
          <DashboardIcons iconName="Spinner" color={dashboardStyle.color!} />
        </div>
      ) : (
        <PaginatedTable
          paginatedResult={dashboardPage}
          userPagination={userPagination}
          setUserPagination={setUserPagination}
          columns={tableColumns}
          contentType="dashboard"
          refetchData={refetch}
          iconColor={corporateInfo?.dashboardFontColor || '#fff'}
          backgroundColor={corporateInfo?.headerPrimaryColor || '#2B3244'}
          hoverColor={corporateInfo?.menuHoverColor || '#fff'}
          borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
        />
      )}
    </div>
  );
}
