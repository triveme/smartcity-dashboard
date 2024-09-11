import { ReactElement, useEffect, useState } from 'react';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import { useQuery } from '@tanstack/react-query';
import { getDataSourcesByTenant } from '@/api/dataSource-service';
import { DataSource } from '@/types';
import { useAuth } from 'react-oidc-context';
import { getTenantOfPage } from '@/utils/tenantHelper';

type DataSourceDropdownSelectionProps = {
  selectedDataSource?: string;
  onSelectDataSource: (
    value: string,
    origin: string,
    datasourceCollections: string[],
  ) => void;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
};

export default function DataSourceDropdownSelection(
  props: DataSourceDropdownSelectionProps,
): ReactElement {
  const {
    selectedDataSource,
    onSelectDataSource,
    iconColor,
    borderColor,
    backgroundColor,
  } = props;

  const auth = useAuth();
  const tenant = getTenantOfPage();

  const [selectableDataSources, setSelectableDataSources] =
    useState<DataSource[]>();

  const {
    data: dataSourcesData,
    isError: dataSourcesIsError,
    error: dataSourcesError,
  } = useQuery({
    queryKey: ['datasources'],
    queryFn: () => getDataSourcesByTenant(auth?.user?.access_token, tenant),
  });

  useEffect(() => {
    if (dataSourcesData) {
      setSelectableDataSources(dataSourcesData);
      if (!selectedDataSource && dataSourcesData.length > 0) {
        onSelectDataSource(
          dataSourcesData[0].id!,
          dataSourcesData[0].origin,
          dataSourcesData[0].collections,
        );
      } else if (selectedDataSource) {
        const preSelect = dataSourcesData.find(
          (ds) => ds.id === selectedDataSource,
        );
        if (preSelect) {
          onSelectDataSource(
            preSelect.id!,
            preSelect.origin,
            preSelect.collections,
          );
        }
      }
    }
  }, [dataSourcesData]);

  useEffect(() => {
    if (dataSourcesIsError) {
      console.error(dataSourcesError);
    }
  }, [dataSourcesIsError]);

  return (
    <WizardDropdownSelection
      currentValue={
        selectableDataSources?.find((ds) => ds.id === selectedDataSource)
          ?.name || ''
      }
      selectableValues={selectableDataSources?.map((ds) => ds.name) ?? []}
      onSelect={(value): void => {
        const selectedDataSource = selectableDataSources?.find(
          (ds) => ds.name === value,
        );
        if (selectedDataSource) {
          onSelectDataSource(
            selectedDataSource.id ?? '',
            selectedDataSource.origin ?? '',
            selectedDataSource.collections ?? [],
          );
        }
      }}
      iconColor={iconColor}
      borderColor={borderColor}
      backgroundColor={backgroundColor}
    />
  );
}
