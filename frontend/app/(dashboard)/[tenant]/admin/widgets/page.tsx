'use client';

import { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import PageHeadline from '@/ui/PageHeadline';
import CreateButton from '@/ui/Buttons/CreateButton';
import { searchWidgets } from '@/api/widget-service';
import type { TableColumn, WidgetWithComponentTypes } from '@/types';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';
/* eslint-disable @typescript-eslint/no-unused-vars */
import PaginatedTable from '@/components/PaginatedTable';
import WizardTextfield from '@/ui/WizardTextfield';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardLabel from '@/ui/WizardLabel';
import { tabComponentTypeEnum } from '@/types';
import {
  chartComponentSubTypes,
  informationComponentSubTypes,
  mapComponentSubTypes,
  sliderComponentSubTypes,
} from '@/utils/enumMapper';

/* eslint-disable @typescript-eslint/no-unused-vars */
const tableColumns: Array<TableColumn<WidgetWithComponentTypes>> = [
  { name: 'name', displayName: 'Name' },
  { name: 'description', displayName: 'Beschreibung' },
  { name: 'componentType', displayName: 'Komponente' },
  { name: 'componentSubType', displayName: 'Typ' },
  { name: 'visibility', displayName: 'Sichtbarkeit' },
];

export default function Widgets(): ReactElement {
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
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [componentTypeSearch, setComponentTypeSearch] = useState(
    searchParams.get('component') || '',
  );
  const [componentSubTypeSearch, setComponentSubTypeSearch] = useState(
    searchParams.get('type') || '',
  );

  const subComponentTypeMapping: {
    [key: string]: { label: string; value: string }[];
  } = {
    Informationen: informationComponentSubTypes,
    Diagramm: chartComponentSubTypes,
    Slider: sliderComponentSubTypes,
    Karte: mapComponentSubTypes,
  };
  // Update URL search params whenever pagination state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', userPagination.page.toString());
    params.set('limit', userPagination.limit.toString());
    if (search !== '') {
      params.set('search', search);
    }
    if (componentTypeSearch !== '') {
      params.set('component', componentTypeSearch);
    }
    if (componentSubTypeSearch !== '-----' && componentSubTypeSearch !== '') {
      params.set('type', componentSubTypeSearch);
    }
    router.replace(`?${params.toString()}`);
  }, [
    userPagination,
    search,
    router,
    componentTypeSearch,
    componentSubTypeSearch,
  ]);

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

  const {
    data: widgetsPage,
    refetch,
    isError,
    error,
    isPending,
    isSuccess,
  } = useQuery({
    queryKey: [
      'widgets',
      userPagination,
      search,
      componentTypeSearch,
      componentSubTypeSearch,
    ],
    queryFn: () =>
      searchWidgets(
        auth?.user?.access_token,
        tenant,
        search,
        componentTypeSearch,
        componentSubTypeSearch === '-----' ? '' : componentSubTypeSearch,
        userPagination,
      ),
    select: (result) => ({
      ...result,
      data: result.data.map((item) => ({
        ...item,
        componentSubType:
          subComponentTypeMapping[componentTypeSearch]?.find(
            (option) => option.value === item.componentSubType,
          )?.label || '',
      })),
    }),
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
  const handleComponentTypeChange = (newType: string): void => {
    setComponentTypeSearch(newType);
    setComponentSubTypeSearch('');
  };

  return (
    <div style={dashboardStyle} className="h-full p-10 overflow-y-auto">
      <div className="flex justify-between items-center content-center pb-4">
        <PageHeadline headline="Widgets" fontColor={dashboardStyle.color} />
        <CreateButton />
      </div>
      <div className="flex w-full pb-4 items-end gap-4">
        <div className="w-2/3">
          <WizardTextfield
            value={search}
            onChange={(value): void => setSearch(value.toString())}
            placeholderText={'Suche'}
            borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          />
        </div>
        <div className="w-1/6">
          <WizardLabel label="Komponente" />
          <WizardDropdownSelection
            currentValue={componentTypeSearch || ''}
            selectableValues={Object.values(tabComponentTypeEnum)}
            onSelect={(value): void =>
              handleComponentTypeChange(value.toString())
            }
            iconColor={corporateInfo?.dashboardFontColor || '#fff'}
            borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          />
        </div>
        <div className="w-1/6">
          <WizardLabel label="Typ" />
          <WizardDropdownSelection
            currentValue={
              subComponentTypeMapping[componentTypeSearch]?.find(
                (option) => option.value === componentSubTypeSearch,
              )?.label || ''
            }
            selectableValues={
              subComponentTypeMapping[componentTypeSearch]?.map(
                (option) => option.label,
              ) || ['', '-----']
            }
            onSelect={(label: string | number): void => {
              const enumValue =
                subComponentTypeMapping[componentTypeSearch]?.find(
                  (option) => option.label === label,
                )?.value || '';
              setComponentSubTypeSearch(enumValue.toString());
            }}
            iconColor={corporateInfo?.dashboardFontColor || '#fff'}
            borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          />
        </div>
      </div>
      {isPending ? (
        <div className="flex justify-center text-2xl">
          <DashboardIcons iconName="Spinner" color={dashboardStyle.color!} />
        </div>
      ) : (
        <PaginatedTable
          paginatedResult={widgetsPage}
          userPagination={userPagination}
          setUserPagination={setUserPagination}
          columns={tableColumns}
          contentType="widget"
          refetchData={refetch}
          iconColor={corporateInfo?.dashboardFontColor || '#fff'}
          backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          hoverColor={corporateInfo?.menuHoverColor || '#fff'}
          borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
        />
      )}
    </div>
  );
}
