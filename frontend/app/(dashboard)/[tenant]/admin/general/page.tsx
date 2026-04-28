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
  LinkWithIconValues,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
} from '@/types';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import WizardUrlTextfield from '@/ui/WizardUrlTextfield';
import { validateUrl } from '@/utils/validationHelper';
import CancelButton from '@/ui/Buttons/CancelButton';
import HorizontalDivider from '@/ui/HorizontalDivider';
import WizardTextfield from '@/ui/WizardTextfield';
import IconSelection from '@/ui/Icons/IconSelection';
import CreateDashboardElementButton from '@/ui/Buttons/CreateDashboardElementButton';
import FontAwesomeIcons from '@/ui/Icons/FontAwesomeIcons';

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
  const [cookiebotId, setCookiebotId] = useState<string>('');
  const [matomoSiteId, setMatomoSiteId] = useState<string>('');
  const [matomoUrl, setMatomoUrl] = useState<string>('');
  const [errors, setErrors] = useState<WizardErrors>({});

  const [linkWithIconTitle, setLinkWithIconTitle] = useState<string>('');
  const [linkWithIconUrl, setLinkWithIconUrl] = useState<string>('');
  const [linkWithIconIcon, setLinkWithIconIcon] = useState<string>('');
  const [linkWithIcon, setLinkWithIcon] = useState<LinkWithIconValues[]>([]);
  const { openSnackbar } = useSnackbar();

  const setGeneralSettings = (
    generalSettings: GeneralSettings | undefined,
  ): void => {
    if (generalSettings) {
      setInformationUrl(generalSettings.information);
      setImprintUrl(generalSettings.imprint);
      setPrivacyUrl(generalSettings.privacy);
      setDisclaimer(generalSettings.disclaimer);
      setCookiebotId(
        generalSettings.cookiebotId ||
          (process.env.NEXT_PUBLIC_COOKIEBOT_ID ?? ''),
      );
      setMatomoUrl(generalSettings.matomoUrl || '');
      setMatomoSiteId(generalSettings.matomoSiteId || '');
      setLinkWithIcon(generalSettings.linkWithIconValues || []);
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
    if (!cookiebotId || cookiebotId.trim() === '') {
      if (
        process.env.NEXT_PUBLIC_COOKIEBOT_ID &&
        process.env.NEXT_PUBLIC_COOKIEBOT_ID != ''
      ) {
        setCookiebotId(process.env.NEXT_PUBLIC_COOKIEBOT_ID);
      } else {
        // errorsOccurred.cookiebotIdError = 'Cookiebot ID is required!';
      }
    }
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
        cookiebotId: cookiebotId || null,
        matomoUrl: matomoUrl || null,
        matomoSiteId: matomoSiteId || null,
        linkWithIconValues: linkWithIcon || [],
      };

      console.log(
        '[Cookiebot][Admin] Saving updated general settings cookiebotId:',
        cookiebotId,
      );
      console.log(
        '[Matomo URL][Admin] Saving updated general settings matomoUrl:',
        matomoUrl,
      );
      console.log(
        '[Matomo-Site-ID][Admin] Saving updated general settings matomoSiteId:',
        matomoSiteId,
      );

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
        cookiebotId: cookiebotId || null,
        matomoUrl: matomoUrl || null,
        matomoSiteId: matomoSiteId || null,
        linkWithIconValues: linkWithIcon || [],
      };

      console.log(
        '[Cookiebot][Admin] Creating general settings with cookiebotId:',
        cookiebotId,
      );
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

  const handleAddLinkWithIcon = (): void => {
    if (linkWithIcon.length >= 3) {
      openSnackbar('Es sind nur 3 Links erlaubt.', 'warning');
      return;
    }
    if (linkWithIconTitle.trim() === '') {
      openSnackbar('Titel muss ausgefüllt werden.', 'warning');
      return;
    }
    if (linkWithIconUrl.trim() === '') {
      openSnackbar('Url muss ausgefüllt werden.', 'warning');
      return;
    }
    if (linkWithIconIcon.trim() === '') {
      openSnackbar('Icon muss ausgefüllt werden.', 'warning');
      return;
    }

    if (!validateUrl(linkWithIconUrl)) {
      openSnackbar('Link mit Icon url is invalid!', 'error');
    }
    setLinkWithIcon((prev) => [
      ...prev,
      {
        titel: linkWithIconTitle,
        url: linkWithIconUrl,
        icon: linkWithIconIcon,
      },
    ]);

    setLinkWithIconTitle('');
    setLinkWithIconUrl('');
    setLinkWithIconIcon('');
  };

  const handleDeleteLinkWithIcon = (index: number): void => {
    setLinkWithIcon((prev) => prev.filter((_, i) => i !== index));
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
        <HorizontalDivider />
        <WizardLabel label="Externe Services" />
        <div className="flex flex-row gap-4 w-full pb-2">
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Cookiebot-ID" />
            <WizardTextfield
              value={cookiebotId || ''}
              onChange={(value: string | number): void =>
                setCookiebotId(value.toString())
              }
              error={errors && (errors.cookiebotIdError as string)}
              borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
              backgroundColor={
                corporateInfo?.dashboardPrimaryColor || '#2B3244'
              }
              panelFontColor={corporateInfo?.panelFontColor}
              panelBorderRadius={corporateInfo?.panelBorderRadius}
              panelBorderSize={corporateInfo?.panelBorderSize}
              placeholderText={'Enter Cookiebot ID'}
            />
          </div>
        </div>
        <HorizontalDivider />

        <div className="flex flex-row gap-4 w-full pb-2">
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Matomo-URL" />
            <WizardTextfield
              value={matomoUrl || ''}
              onChange={(value: string | number): void =>
                setMatomoUrl(value.toString())
              }
              error={errors && (errors.matomoUrlError as string)}
              borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
              backgroundColor={
                corporateInfo?.dashboardPrimaryColor || '#2B3244'
              }
              panelFontColor={corporateInfo?.panelFontColor}
              panelBorderRadius={corporateInfo?.panelBorderRadius}
              panelBorderSize={corporateInfo?.panelBorderSize}
              placeholderText={'Enter Matomo-URL'}
            />
          </div>
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Matomo-Site-ID" />
            <WizardTextfield
              value={matomoSiteId || ''}
              onChange={(value: string | number): void =>
                setMatomoSiteId(value.toString())
              }
              error={errors && (errors.matomoSiteIdError as string)}
              borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
              backgroundColor={
                corporateInfo?.dashboardPrimaryColor || '#2B3244'
              }
              panelFontColor={corporateInfo?.panelFontColor}
              panelBorderRadius={corporateInfo?.panelBorderRadius}
              panelBorderSize={corporateInfo?.panelBorderSize}
              placeholderText={'Enter Matomo-Site-ID'}
            />
          </div>
        </div>
        <HorizontalDivider />

        <WizardLabel label="Link mit Icon" />

        <div className="pb-2">
          <div className="flex overflow-visible gap-4 w-full pb-2">
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Titel hinzufügen" />
              <WizardTextfield
                value={linkWithIconTitle}
                onChange={(value: string | number): void => {
                  setLinkWithIconTitle(value.toString());
                }}
                borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
                backgroundColor={
                  corporateInfo?.dashboardPrimaryColor || '#2B3244'
                }
                panelFontColor={corporateInfo?.panelFontColor}
                panelBorderRadius={corporateInfo?.panelBorderRadius}
                panelBorderSize={corporateInfo?.panelBorderSize}
                placeholderText={'Titel'}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="URL hinzufügen" />
              <WizardUrlTextfield
                value={linkWithIconUrl}
                onChange={(value: string | number): void =>
                  setLinkWithIconUrl(value.toString())
                }
                error={errors && errors.informationUrlError}
                iconColor={corporateInfo?.fontColor ?? '#FFFFFF'}
                borderColor={corporateInfo?.panelBorderColor ?? '#2B3244'}
              />
            </div>
          </div>
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Icon" />
            <IconSelection
              activeIcon={linkWithIconIcon}
              handleIconSelect={(value: string): void => {
                setLinkWithIconIcon(value);
              }}
              iconColor={corporateInfo?.fontColor ?? '#FFFFFF'}
              borderColor={corporateInfo?.panelBorderColor ?? '#2B3244'}
            />
          </div>
          <CreateDashboardElementButton
            label="+ Add Link mit Icon"
            handleClick={handleAddLinkWithIcon}
          />
        </div>
        <div className="flex flex-col gap-4">
          {linkWithIcon.map((element, index) => {
            return (
              <div
                key={index}
                className="w-full flex justify-between items-center"
              >
                <p className="px-2">{element.titel}</p>
                <p className="px-2">{element.url}</p>
                <FontAwesomeIcons
                  iconName={element.icon}
                  color={corporateInfo?.fontColor ?? '#FFFFFF'}
                />
                <button
                  onClick={() => handleDeleteLinkWithIcon(index)}
                  className="px-2 py-1 mx-1 bg-red-500 text-white rounded"
                >
                  Löschen
                </button>
              </div>
            );
          })}
        </div>
        <HorizontalDivider />

        <div className="flex align-center justify-end py-4 ">
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

          <div className="flex items-center space-x-4">
            <CancelButton closeWindow={true} onClick={handleCancelClick} />
            <SaveButton handleSaveClick={handleSaveClick} />
          </div>
        </div>
      </div>
    </div>
  );
}
