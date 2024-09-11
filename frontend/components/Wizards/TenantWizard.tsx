'use client';

import { ReactElement, useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import PageHeadline from '@/ui/PageHeadline';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { postTenant, updateTenant } from '@/api/tenant-service';
import { Tenant } from '@/types';

type TenantWizardProps = {
  tenant?: Tenant | null;
  fontColor: string;
  backgroundColor: string;
  borderColor: string;
  onSave: () => void;
  onClose: () => void;
};

export default function TenantWizard({
  tenant,
  fontColor,
  backgroundColor,
  borderColor,
  onSave,
  onClose,
}: TenantWizardProps): ReactElement {
  const [tenantName, setTenantName] = useState<string>(
    tenant?.abbreviation ?? '',
  );
  const [error, setError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const auth = useAuth();
  const { openSnackbar } = useSnackbar();
  const isUpdate = Boolean(tenant);

  useEffect(() => {
    if (tenant) {
      setTenantName(tenant.abbreviation ?? '');
    } else {
      setTenantName('');
    }
  }, [tenant]);

  const handleSave = async (): Promise<void> => {
    setIsSaving(true);
    try {
      if (isUpdate) {
        if (tenant) {
          await updateTenant(auth.user?.access_token, {
            ...tenant,
            abbreviation: tenantName,
          });
          openSnackbar('Tenant updated successfully!', 'success');
        }
      } else {
        await postTenant(auth.user?.access_token, {
          abbreviation: tenantName,
        });
        openSnackbar('Tenant created successfully!', 'success');
      }
      onSave(); // Notify parent component
    } catch (error) {
      console.error('Error saving tenant:', error);
      openSnackbar('Error saving tenant!', 'error');
      setError('Failed to save tenant');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1E1E1E] bg-opacity-70 flex justify-center items-center z-50">
      <div
        className="p-10 rounded-lg w-2/3 flex flex-col justify-between"
        style={{ backgroundColor, color: fontColor }}
      >
        <div>
          <PageHeadline
            headline={isUpdate ? 'Edit Tenant' : 'Add Tenant'}
            fontColor={fontColor}
          />
        </div>
        <div className="w-full h-full flex flex-col">
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Abbreviation" />
            <WizardTextfield
              value={tenantName}
              onChange={(value: string | number): void =>
                setTenantName(value.toString())
              }
              error={error}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded mr-2"
            onClick={onClose}
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSave}
            aria-label={isUpdate ? 'Save Changes' : 'Save'}
            disabled={isSaving}
          >
            {isUpdate ? 'Save Changes' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
