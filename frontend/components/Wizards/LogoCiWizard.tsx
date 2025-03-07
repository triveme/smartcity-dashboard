import React, { Dispatch, JSX, SetStateAction } from 'react';
import CheckBox from '@/ui/CheckBox';
import { CorporateInfo, SidebarLogo } from '@/types';
import CIUploadLogoWizard from './CIUploadLogoWizard';
import CIAddLogoWizard from './CIAddLogoWizard';

type Props = {
  corporateInfo: CorporateInfo | undefined;
  headerLogoId: string | null;
  setHeaderLogoId: Dispatch<SetStateAction<string | null>>;
  showHeaderLogo: boolean;
  setShowHeaderLogo: (value: boolean) => void;
  showMenuLogo: boolean;
  setShowMenuLogo: (value: boolean) => void;
  sidebarLogos: SidebarLogo[];
  setSidebarLogos: Dispatch<SetStateAction<SidebarLogo[]>>;
};

export default function LogoCiWizard({
  corporateInfo,
  headerLogoId,
  setHeaderLogoId,
  showHeaderLogo,
  setShowHeaderLogo,
  showMenuLogo,
  setShowMenuLogo,
  sidebarLogos,
  setSidebarLogos,
}: Props): JSX.Element {
  return (
    <div className="flex flex-row w-full px-2 transition-opacity duration-500 opacity-100">
      <div className="flex-grow basis-1/3 px-2">
        <CIUploadLogoWizard corporateInfo={corporateInfo} />
      </div>
      <div className="flex flex-grow flex-row basis-1/3 px-2">
        <div className="flex-grow px-2 mt-3">
          <CheckBox
            label={'Header-Logo anzeigen'}
            value={showHeaderLogo}
            handleSelectChange={setShowHeaderLogo}
          />
        </div>
        <div className="flex-grow px-2 mt-3">
          <CheckBox
            label={'Menü-Logo anzeigen'}
            value={showMenuLogo}
            handleSelectChange={setShowMenuLogo}
          />
        </div>
      </div>
      <div className="flex-grow basis-1/3 px-2">
        <CIAddLogoWizard
          corporateInfo={corporateInfo}
          sidebarLogos={sidebarLogos}
          setSidebarLogos={setSidebarLogos}
          headerLogoId={headerLogoId}
          setHeaderLogoId={setHeaderLogoId}
        />
      </div>
    </div>
  );
}
