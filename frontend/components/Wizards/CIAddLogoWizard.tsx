'use client';

import { useState, FC, SetStateAction, Dispatch, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import Image from 'next/image';

import WizardLabel from '@/ui/WizardLabel';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { CorporateInfo, SidebarLogo } from '@/types';
import { getLogos } from '@/api/logo-service';
import { useParams } from 'next/navigation';
import { env } from 'next-runtime-env';
import CreateDashboardElementButton from '@/ui/Buttons/CreateDashboardElementButton';
import DashboardIcons from '@/ui/Icons/DashboardIcon';

type Props = {
  corporateInfo: CorporateInfo | undefined;
  headerLogoId: string | undefined;
  setHeaderLogoId: Dispatch<SetStateAction<string | undefined>>;
  sidebarLogos: SidebarLogo[];
  setSidebarLogos: Dispatch<SetStateAction<SidebarLogo[]>>;
};

const CIAddLogoWizard: FC<Props> = ({
  corporateInfo,
  headerLogoId,
  setHeaderLogoId,
  sidebarLogos,
  setSidebarLogos,
}) => {
  const auth = useAuth();
  const { openSnackbar } = useSnackbar();

  const [selectedLogoName, setSelectedLogoName] = useState<string>('');
  const [selectedLogoId, setSelectedLogoId] = useState<string>('');
  const [selectedHeaderLogoName, setSelectedHeaderLogoName] =
    useState<string>('');

  // Multi Tenancy
  const params = useParams();
  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  const tenant =
    NEXT_PUBLIC_MULTI_TENANCY === 'true'
      ? (params.tenant as string)
      : undefined;

  const { data: allLogos } = useQuery({
    queryKey: ['logos'],
    queryFn: () => getLogos(auth?.user?.access_token, tenant),
  });

  useEffect(() => {
    if (corporateInfo) {
      setSidebarLogos(corporateInfo.sidebarLogos || []);
      setHeaderLogoId(corporateInfo.headerLogoId || undefined);
    }
  }, [corporateInfo, setSidebarLogos, setHeaderLogoId]);

  const handleAddSidebarLogo = (): void => {
    if (!selectedLogoId || !selectedLogoName) {
      openSnackbar('Please select a logo to add', 'error');
      return;
    }

    const newLogo: SidebarLogo = {
      id: selectedLogoId,
      tenantId: tenant || '',
      logo: allLogos?.find((logo) => logo.id === selectedLogoId)?.logo || '',
      logoHeight: 200,
      logoWidth: 200,
      order: sidebarLogos.length + 1,
      logoName: selectedLogoName,
      format: 'png',
      size: 'small',
    };

    const updatedLogos = [...sidebarLogos, newLogo];
    setSidebarLogos(updatedLogos);
  };

  const handleHeaderLogoSelection = (value: string): void => {
    const selectedLogo = allLogos?.find(
      (logo) => logo.logoName === value.toString(),
    );
    if (selectedLogo) {
      setSelectedHeaderLogoName(value.toString());
      setHeaderLogoId(selectedLogo.id || undefined);
    } else {
      setHeaderLogoId(undefined);
      setSelectedHeaderLogoName('');
    }
  };

  const moveLogo = (index: number, direction: 'up' | 'down'): void => {
    const newOrder = [...sidebarLogos];
    const [movedLogo] = newOrder.splice(index, 1);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newOrder.splice(newIndex, 0, movedLogo);

    const updatedLogos = newOrder.map((logo, idx) => ({
      ...logo,
      order: idx + 1,
    }));
    setSidebarLogos(updatedLogos);
  };

  const handleDeleteLogo = (index: number): void => {
    const newOrder = [...sidebarLogos];
    newOrder.splice(index, 1);

    const updatedLogos = newOrder.map((logo, idx) => ({
      ...logo,
      order: idx + 1,
    }));
    setSidebarLogos(updatedLogos);
  };

  return (
    <div>
      {/* Header Logo Selection */}
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Select Header Logo" />
        <WizardDropdownSelection
          currentValue={selectedHeaderLogoName}
          selectableValues={
            allLogos && allLogos.length > 0
              ? ['', ...allLogos.map((logo) => logo.logoName!)]
              : ['']
          }
          onSelect={(value: string | number): void =>
            handleHeaderLogoSelection(value.toString())
          }
          iconColor={corporateInfo?.dashboardFontColor || '#fff'}
          backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
        />
        {headerLogoId && (
          <div className="flex items-center justify-center mt-2 pt-4">
            <Image
              src={
                allLogos?.find((logo) => logo.id === headerLogoId)?.logo || ''
              }
              alt={selectedHeaderLogoName}
              height={0}
              width={0}
              style={{ width: 'auto', height: '48px' }}
            />
          </div>
        )}
      </div>

      {/* Sidebar Logos Selection */}
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Select Sidebar Logos" />
        <WizardDropdownSelection
          currentValue={selectedLogoName}
          selectableValues={
            allLogos && allLogos.length > 0
              ? ['', ...allLogos.map((logo) => logo.logoName!)]
              : ['']
          }
          onSelect={(value: string | number): void => {
            const selectedLogo = allLogos?.find(
              (logo) => logo.logoName === value.toString(),
            );
            if (selectedLogo) {
              setSelectedLogoName(value.toString());
              setSelectedLogoId(selectedLogo.id || '');
            } else {
              setSelectedLogoId('');
            }
          }}
          iconColor={corporateInfo?.dashboardFontColor || '#fff'}
          backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
        />
        <CreateDashboardElementButton
          label="+ Add Sidebar Logo"
          handleClick={handleAddSidebarLogo}
        />
      </div>

      {/* Sidebar Logos Preview */}
      <div className="flex flex-col w-full h-full pt-4">
        {sidebarLogos
          .sort((a, b) => a.order - b.order)
          .map((logo, index) => (
            <div key={logo.id} className="flex items-center h-25 mb-2">
              <Image
                src={logo.logo}
                alt={logo.logoName}
                height={0}
                width={0}
                style={{ width: 'auto', height: '48px' }}
              />
              <div className="ml-auto flex items-center">
                <button
                  onClick={(): void => moveLogo(index, 'up')}
                  disabled={index === 0}
                  className="px-2 py-1 mx-1 bg-gray-300 rounded"
                >
                  <DashboardIcons
                    iconName={'ChevronUp'}
                    color={corporateInfo?.dashboardFontColor || '#fff'}
                    size={'lg'}
                  />
                </button>
                <button
                  onClick={(): void => moveLogo(index, 'down')}
                  disabled={index === sidebarLogos.length - 1}
                  className="px-2 py-1 mx-1 bg-gray-300 rounded"
                >
                  <DashboardIcons
                    iconName={'ChevronDown'}
                    color={corporateInfo?.dashboardFontColor || '#fff'}
                    size={'lg'}
                  />
                </button>
                <button
                  onClick={(): void => handleDeleteLogo(index)}
                  className="px-2 py-1 mx-1 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CIAddLogoWizard;
