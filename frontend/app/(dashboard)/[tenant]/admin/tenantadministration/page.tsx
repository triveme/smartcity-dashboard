'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';

import Table from '@/components/Table';
import PageHeadline from '@/ui/PageHeadline';
import { TableConfig, Tenant } from '@/types';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';
import { getTenants } from '@/api/tenant-service';
import CreateDashboardElementButton from '@/ui/Buttons/CreateDashboardElementButton';
import TenantWizard from '@/components/Wizards/TenantWizard';

const tableConfig: TableConfig<Tenant> = {
  columns: ['abbreviation'],
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

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

  const dashboardStyle = {
    backgroundColor: corporateInfo?.dashboardPrimaryColor || '#2B3244',
    marginLeft: isCollapsed ? '80px' : '250px',
    color: corporateInfo?.dashboardFontColor || '#FFFFFF',
  };

  const { data, refetch, isSuccess, isError, error, isPending } = useQuery({
    queryKey: ['tenant'],
    queryFn: () => getTenants(auth?.user?.access_token),
  });

  useEffect(() => {
    if (isError) {
      openSnackbar('Fehler beim Abfragen der Mandanten!', 'error');
    }
  }, [isSuccess, isError, openSnackbar]);

  const handleNewTenant = (): void => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  const handleSave = (): void => {
    setIsModalOpen(false);
    refetch();
  };

  const handleClose = (): void => {
    setIsModalOpen(false);
  };

  if (isError) {
    return (
      <div style={dashboardStyle} className="p-2">
        Error: {error.message}
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
          headline="Mandantenverwaltung"
          fontColor={dashboardStyle.color}
        />
        <CreateDashboardElementButton
          label="+ Mandanten hinzufügen"
          handleClick={handleNewTenant}
        />
      </div>
      <Table
        tableConfig={tableConfig}
        tableContent={data || []}
        contentType="tenant"
        refetchData={refetch}
        iconColor={corporateInfo?.dashboardFontColor || '#fff'}
        backgroundColor={corporateInfo?.headerPrimaryColor || '#2B3244'}
        hoverColor={corporateInfo?.menuHoverColor || '#fff'}
        borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
        isTenant={true}
      />
      {isModalOpen && (
        <TenantWizard
          tenant={selectedTenant}
          fontColor={dashboardStyle.color}
          backgroundColor={dashboardStyle.backgroundColor}
          borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
