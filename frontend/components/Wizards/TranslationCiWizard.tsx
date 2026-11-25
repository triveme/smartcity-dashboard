'use client';

import { useValueTranslations } from '@/app/custom-hooks/useValueTranslations';
import {
  createTranslation,
  deleteTranslation,
  updateTranslation,
} from '@/api/value-translation-service';
import { CorporateInfo, TableColumn, ValueTranslation } from '@/types';
import PageHeadline from '@/ui/PageHeadline';
import TranslationsTable from '@/ui/TranslationsTable';
import { CSSProperties, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardIcons from '../../ui/Icons/DashboardIcon';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { getTenantOfPage } from '@/utils/tenantHelper';
import { useAuth } from 'react-oidc-context';

const tableColumns: Array<TableColumn<ValueTranslation>> = [
  { name: 'rawValue', displayName: 'Attributname' },
  { name: 'label', displayName: 'Übersetzung' },
  { name: 'category', displayName: 'Category' },
  {
    name: 'tenantId',
    displayName: 'Tennant',
  },
];

type Props = {
  corporateInfo: CorporateInfo | undefined;
};

type TranslationFilter = 'Tenant-spezifisch' | 'Allgemein';

const translationFilterOptions: TranslationFilter[] = [
  'Tenant-spezifisch',
  'Allgemein',
];

const TranslationCiWizard = ({ corporateInfo }: Props) => {
  const { openSnackbar } = useSnackbar();
  const auth = useAuth();

  const { data: valueTranslations = [] } = useValueTranslations();

  const [searchValue, setSearchValue] = useState('');
  const [translationFilter, setTranslationFilter] =
    useState<TranslationFilter>('Tenant-spezifisch');
  const [editingTranslationId, setEditingTranslationId] = useState<
    string | null
  >(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newRawValue, setNewRawValue] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const queryClient = useQueryClient();
  const tenant = getTenantOfPage();

  const updateTranslationMutation = useMutation({
    mutationFn: ({
      tenant,
      id,
      label,
    }: {
      tenant: string;
      id: string;
      label: string;
    }) => updateTranslation(tenant, id, { label }, auth.user?.access_token),
    onSuccess: () => {
      setEditingTranslationId(null);
      setEditingLabel('');
      void queryClient.invalidateQueries({ queryKey: ['valueTranslations'] });
      openSnackbar('Übersetzung erfolgreich aktualisiert.', 'success');
    },
  });

  const createTranslationMutation = useMutation({
    mutationFn: ({
      tenant,
      rawValue,
      label,
    }: {
      tenant: string;
      rawValue: string;
      label: string;
    }) =>
      createTranslation(
        tenant,
        {
          category: 'sensor_attribute',
          rawValue,
          label,
        },
        auth.user?.access_token,
      ),
    onSuccess: () => {
      setIsCreating(false);
      setNewRawValue('');
      setNewLabel('');
      void queryClient.invalidateQueries({ queryKey: ['valueTranslations'] });
      openSnackbar('Übersetzung erfolgreich erstellt.', 'success');
    },
  });

  const deleteTranslationMutation = useMutation({
    mutationFn: ({ tenant, id }: { tenant: string; id: string }) =>
      deleteTranslation(tenant, id, auth.user?.access_token),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['valueTranslations'] });
      openSnackbar('Übersetzung erfolgreich gelöscht.', 'success');
    },
  });

  const filteredTranslations = useMemo(() => {
    const normalizedSearchValue = searchValue.trim().toLowerCase();

    return valueTranslations.filter((translation) => {
      const matchesSearch =
        !normalizedSearchValue ||
        translation.rawValue?.toLowerCase().includes(normalizedSearchValue) ||
        translation.label?.toLowerCase().includes(normalizedSearchValue) ||
        translation.category?.toLowerCase().includes(normalizedSearchValue);

      const matchesType =
        (translationFilter === 'Tenant-spezifisch' &&
          translation.tenantId !== null) ||
        (translationFilter === 'Allgemein' && translation.tenantId === null);

      return matchesSearch && matchesType;
    });
  }, [searchValue, translationFilter, valueTranslations]);

  const buttonStyle: CSSProperties = {
    backgroundColor: corporateInfo?.saveButtonColor || '#91D9FF',
    color: corporateInfo?.dashboardFontColor || '#2B3244',
  };

  const logoColor = corporateInfo?.dashboardFontColor || '#2B3244';

  const handleCreateButtonClick = (): void => {
    if (translationFilter !== 'Tenant-spezifisch') {
      openSnackbar(
        'Neue Übersetzungen können nur für einen Tenant erstellt werden.',
        'warning',
      );
      return;
    }

    setIsCreating(true);
    setNewRawValue('');
    setNewLabel('');
  };

  const handleTranslationFilterChange = (value: string | number): void => {
    const nextFilter = value.toString() as TranslationFilter;
    setTranslationFilter(nextFilter);

    if (nextFilter === 'Allgemein') {
      setIsCreating(false);
      setNewRawValue('');
      setNewLabel('');
    }
  };

  const handleSaveNewTranslation = (): void => {
    const normalizedRawValue = newRawValue.trim();
    const normalizedLabel = newLabel.trim();

    if (!tenant) {
      openSnackbar('Tenant konnte nicht ermittelt werden.', 'error');
      return;
    }

    if (!normalizedRawValue || !normalizedLabel) {
      openSnackbar(
        'Attributname und Übersetzung sind erforderlich.',
        'warning',
      );
      return;
    }

    createTranslationMutation.mutate({
      tenant,
      rawValue: normalizedRawValue,
      label: normalizedLabel,
    });
  };

  const handleCancelNewTranslation = (): void => {
    setIsCreating(false);
    setNewRawValue('');
    setNewLabel('');
    openSnackbar('Erstellung abgebrochen.', 'info');
  };

  const handleEdit = (translation: ValueTranslation): void => {
    if (translation.tenantId === null) return;

    setIsCreating(false);
    setEditingTranslationId(translation.id);
    setEditingLabel(translation.label);
  };

  const handleDelete = (translation: ValueTranslation): void => {
    if (!translation.tenantId) return;

    deleteTranslationMutation.mutate({
      tenant: translation.tenantId,
      id: translation.id,
    });
  };

  const handleEditBlur = (): void => {
    if (!editingTranslationId) return;

    const translation = valueTranslations.find(
      (value) => value.id === editingTranslationId,
    );

    if (!translation?.tenantId) return;

    if (translation.label === editingLabel) {
      setEditingTranslationId(null);
      setEditingLabel('');
      openSnackbar('Bearbeitung abgebrochen.', 'info');
      return;
    }

    updateTranslationMutation.mutate({
      tenant: translation.tenantId,
      id: translation.id,
      label: editingLabel,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center content-center pb-4">
        <PageHeadline
          headline="Übersetzungen"
          fontColor={corporateInfo?.dashboardFontColor || '#FFFFFF'}
        />
        <button
          className="p-4 h-10 rounded-lg flex gap-2 justify-evenly items-center content-center transition-colors ease-in-out duration-300"
          onClick={handleCreateButtonClick}
          style={buttonStyle}
        >
          <DashboardIcons iconName="Plus" color={logoColor} />
          <div>Übersetzung hinzufügen</div>
        </button>
      </div>
      <div className="flex w-full pb-4 items-end gap-4">
        <div className="w-2/3">
          <WizardTextfield
            value={searchValue}
            onChange={(value): void => setSearchValue(value.toString())}
            placeholderText={'Suche'}
            borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          />
        </div>
        <div className="w-1/6">
          <WizardLabel label="Typ" />
          <WizardDropdownSelection
            currentValue={translationFilter}
            selectableValues={translationFilterOptions}
            onSelect={handleTranslationFilterChange}
            iconColor={corporateInfo?.dashboardFontColor || '#fff'}
            borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          />
        </div>
      </div>
      <TranslationsTable
        tableConfig={tableColumns}
        tableContent={filteredTranslations}
        iconColor={corporateInfo?.dashboardFontColor || '#fff'}
        backgroundColor={corporateInfo?.headerPrimaryColor || '#2B3244'}
        borderColor={corporateInfo?.widgetBorderColor || '#2B3244'}
        translationFilter={translationFilter}
        editingTranslationId={editingTranslationId}
        editingLabel={editingLabel}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onEditLabelChange={setEditingLabel}
        onEditBlur={handleEditBlur}
        isCreating={isCreating}
        newTenant={tenant || ''}
        newRawValue={newRawValue}
        newLabel={newLabel}
        onNewRawValueChange={setNewRawValue}
        onNewLabelChange={setNewLabel}
        onSaveNewTranslation={handleSaveNewTranslation}
        onCancelNewTranslation={handleCancelNewTranslation}
      />
    </div>
  );
};

export default TranslationCiWizard;
