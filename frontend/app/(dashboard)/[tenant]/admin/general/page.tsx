'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';

import PageHeadline from '@/ui/PageHeadline';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';
import { WizardErrors } from '@/types/errors';
import WizardLabel from '@/ui/WizardLabel';
import SaveButton from '@/ui/Buttons/SaveButton';
import {
  createGeneralSettings,
  getGeneralSettingsByTenant,
  updateGeneralSettings,
} from '@/api/general-settings-service';
import {
  GeneralSettings,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
} from '@/types';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import WizardUrlTextfield from '@/ui/WizardUrlTextfield';
import { validateUrl } from '@/utils/validationHelper';
import CancelButton from '@/ui/Buttons/CancelButton';
import HorizontalDivider from '@/ui/HorizontalDivider';
import WizardTextfield from '@/ui/WizardTextfield';

export default function Pages(): ReactElement {
  const auth = useAuth();
  const tenant = getTenantOfPage();
  let isPageAllowed = true;

  if (tenant) {
    isPageAllowed = isUserMatchingTenant(auth.user!.access_token, tenant);
  }

  if (!isPageAllowed) {
    return <div className="pl-64">Nicht autorisiert für diesen Mandanten!</div>;
  }

  const [isCollapsed] = useState(false);

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

  const [informationUrl, setInformationUrl] = useState('');
  const [imprintUrl, setImprintUrl] = useState('');
  const [privacyUrl, setPrivacyUrl] = useState('');
  const [allowThemeSwitching, setAllowThemeSwitching] = useState(false);
  const [disclaimer, setDisclaimer] = useState('');
  const [errors, setErrors] = useState<WizardErrors>({});
  const { openSnackbar } = useSnackbar();

  const setGeneralSettings = (
    generalSettings: GeneralSettings | undefined,
  ): void => {
    if (generalSettings) {
      setInformationUrl(generalSettings.information);
      setImprintUrl(generalSettings.imprint);
      setPrivacyUrl(generalSettings.privacy);
      setDisclaimer(generalSettings.disclaimer);
    }
  };

  const { data: generalSettings } = useQuery({
    queryKey: ['generalSettings'],
    queryFn: () => getGeneralSettingsByTenant(tenant),
  });

  useEffect(() => {
    setGeneralSettings(generalSettings);
  }, [generalSettings]);

  const validateFields = (): WizardErrors => {
    const errorsOccurred: WizardErrors = {};

    if (!validateUrl(informationUrl)) {
      errorsOccurred.informationUrlError = 'Information url is invalid!';
    }
    if (!validateUrl(imprintUrl)) {
      errorsOccurred.imprintUrlError = 'Imprint url is invalid!';
    }
    if (!validateUrl(privacyUrl)) {
      errorsOccurred.privacyUrlError = 'Privacy url is invalid!';
    }

    return errorsOccurred;
  };

  const handleSaveClick = async (): Promise<void> => {
    const errorsOccurred = validateFields();
    if (Object.keys(errorsOccurred).length) {
      setErrors(errorsOccurred);
      for (const key in errorsOccurred) {
        const errorMessage = errorsOccurred[key] as string;
        openSnackbar(errorMessage, 'warning');
      }
      return;
    }

    if (!tenant) {
      openSnackbar('tenant not available', 'error');
      return;
    }

    if (generalSettings && generalSettings.id) {
      const updatedGeneralSettings: GeneralSettings = {
        id: generalSettings.id,
        tenant: tenant,
        information: informationUrl,
        imprint: imprintUrl,
        privacy: privacyUrl,
        allowThemeSwitching: allowThemeSwitching,
        disclaimer: disclaimer,
      };

      const retrievedGeneralSettings: GeneralSettings =
        await updateGeneralSettings(
          updatedGeneralSettings,
          auth?.user?.access_token,
        );

      setGeneralSettings(retrievedGeneralSettings);
    } else {
      const newGeneralSettings: GeneralSettings = {
        id: undefined,
        tenant: tenant,
        information: informationUrl,
        imprint: imprintUrl,
        privacy: privacyUrl,
        allowThemeSwitching: allowThemeSwitching,
        disclaimer: disclaimer,
      };

      const retrievedGeneralSettings: GeneralSettings =
        await createGeneralSettings(
          newGeneralSettings,
          auth?.user?.access_token,
        );

      setGeneralSettings(retrievedGeneralSettings);
    }
  };

  const handleCancelClick = (): void => {
    setGeneralSettings(generalSettings);
    setErrors({});
  };

  return (
    <div style={dashboardStyle} className="h-full p-10">
      <div className="flex justify-between items-center content-center">
        <PageHeadline headline="Allgemein" fontColor={dashboardStyle.color} />
      </div>

      <div className="flex flex-col justify-between">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Informationen" />
            <WizardUrlTextfield
              value={informationUrl || ''}
              onChange={(value: string | number): void =>
                setInformationUrl(value.toString())
              }
              error={errors && errors.informationUrlError}
              iconColor={corporateInfo?.fontColor ?? '#FFFFFF'}
              borderColor={corporateInfo?.panelBorderColor ?? '#2B3244'}
            />
          </div>
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Impressum" />
            <WizardUrlTextfield
              value={imprintUrl || ''}
              onChange={(value: string | number): void =>
                setImprintUrl(value.toString())
              }
              error={errors && errors.imprintUrlError}
              iconColor={corporateInfo?.fontColor ?? '#FFFFFF'}
              borderColor={corporateInfo?.panelBorderColor ?? '#2B3244'}
            />
          </div>
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Datenschutzerklärung" />
            <WizardUrlTextfield
              value={privacyUrl || ''}
              onChange={(value: string | number): void =>
                setPrivacyUrl(value.toString())
              }
              error={errors && errors.privacyUrlError}
              iconColor={corporateInfo?.fontColor ?? '#FFFFFF'}
              borderColor={corporateInfo?.panelBorderColor ?? '#2B3244'}
            />
          </div>
        </div>
        <HorizontalDivider />
        <div className="flex flex-row items-center w-full pb-2">
          <WizardLabel label="Farbschema-Wechsel erlauben" />
          <input
            type="checkbox"
            checked={allowThemeSwitching}
            onChange={(e): void => setAllowThemeSwitching(e.target.checked)}
            className="h-6 w-6 rounded"
            style={{
              color: corporateInfo?.fontColor,
              borderColor: corporateInfo?.panelBorderColor,
            }}
          />
        </div>
        <HorizontalDivider />

        <div className="flex flex-row items-center w-full pb-2">
          <WizardTextfield
            value={generalSettings?.disclaimer || ''}
            onChange={(value: string | number): void =>
              setDisclaimer(value.toString())
            }
            componentType={tabComponentTypeEnum.information}
            subComponentType={tabComponentSubTypeEnum.text}
            borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
            panelFontColor={corporateInfo?.panelFontColor}
            panelBorderRadius={corporateInfo?.panelBorderRadius}
            panelBorderSize={corporateInfo?.panelBorderSize}
          />
        </div>
        <div className="flex justify-end py-4 space-x-4">
          <CancelButton closeWindow={true} onClick={handleCancelClick} />
          <SaveButton handleSaveClick={handleSaveClick} />
        </div>
      </div>
    </div>
  );
}
