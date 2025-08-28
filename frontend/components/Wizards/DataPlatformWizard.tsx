'use client';

import { ReactElement, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import WizardUrlTextfield from '@/ui/WizardUrlTextfield';
import WizardPasswordTextfield from '@/ui/WizardPasswordTextfield';
import SaveButton from '@/ui/Buttons/SaveButton';
import CancelButton from '@/ui/Buttons/CancelButton';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';

import { AuthData, authDataTypeEnum } from '@/types';
import { validateUrl } from '@/utils/validationHelper';
import { WizardErrors } from '@/types/errors';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import {
  getAuthDataById,
  postAuthData,
  updateAuthData,
} from '@/api/authData-service';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import { getTenantOfPage } from '@/utils/tenantHelper';
import { dataPlatformTypes } from '@/utils/enumMapper';

type DataPlatformWizardProps = {
  borderColor: string;
  backgroundColor: string;
  iconColor: string;
};

export default function DataPlatformWizard(
  props: DataPlatformWizardProps,
): ReactElement {
  const { borderColor, backgroundColor, iconColor } = props;
  const auth = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const itemId = params.get('id');
  const { openSnackbar } = useSnackbar();
  const tenant = getTenantOfPage();

  const [name, setName] = useState('');
  const [type, setType] = useState<authDataTypeEnum>(authDataTypeEnum.ngsiv2);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [appUser, setAppUser] = useState('');
  const [appUserPassword, setAppUserPassword] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [authUrl, setAuthUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [timeSeriesUrl, setTimeSeriesUrl] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [grantType, setGrantType] = useState('password');
  const [errors, setErrors] = useState<WizardErrors>({});
  const [collections, setCollections] = useState<string[]>([]);
  const [ngsildTenant, setNgsildTenant] = useState('');
  const [ngsildContextUrl, setNgsildContextUrl] = useState('');

  const {
    data: fetchedAuthData,
    isError,
    error,
  } = useQuery({
    queryKey: ['auth-datas', itemId],
    queryFn: () => getAuthDataById(auth?.user?.access_token, itemId!),
    enabled: !!itemId,
  });

  useEffect(() => {
    if (fetchedAuthData) {
      setName(fetchedAuthData.name);
      setType(fetchedAuthData.type);
      setClientId(fetchedAuthData.clientId);
      setClientSecret(fetchedAuthData.clientSecret);
      setAppUser(fetchedAuthData.appUser);
      setAppUserPassword(fetchedAuthData.appUserPassword);
      setApiToken(fetchedAuthData.apiToken);
      setAuthUrl(fetchedAuthData.authUrl);
      setLiveUrl(fetchedAuthData.liveUrl);
      setTimeSeriesUrl(fetchedAuthData.timeSeriesUrl);
      setApiUrl(fetchedAuthData.apiUrl || '');
      setCollections(fetchedAuthData.collections || []);
      setGrantType(fetchedAuthData.grantType || '');
      setNgsildTenant(fetchedAuthData.ngsildTenant || '');
      setNgsildContextUrl(fetchedAuthData.ngsildContextUrl || '');
    }
  }, [fetchedAuthData]);

  useEffect(() => {
    if (isError) {
      openSnackbar('Error: ' + error.message, 'error');
    }
  }, [isError, error, openSnackbar]);

  let collectionChangeTimeout: NodeJS.Timeout;
  const handleCollectionChange = (input: string): void => {
    clearTimeout(collectionChangeTimeout);
    collectionChangeTimeout = setTimeout(() => {
      // Replace spaces with commas and split the input by commas
      const updatedCollections = input
        .replace(/\s+/g, ',')
        .split(',')
        .filter(Boolean);

      // Update the collections state
      setCollections(updatedCollections);
    }, 500);
  };

  const handleSaveDataPlatformClick = async (): Promise<void> => {
    const authData: AuthData = {
      id: itemId || undefined,
      tenantAbbreviation: tenant || '',
      name,
      type,
      clientId,
      clientSecret,
      appUser,
      appUserPassword,
      apiToken,
      authUrl,
      liveUrl,
      timeSeriesUrl,
      apiUrl,
      collections: collections,
      grantType,
      ngsildTenant,
      ngsildContextUrl,
    };

    const textfieldErrorMessages: string[] = [];
    const errorsOccured: WizardErrors = {};

    if (!name) errorsOccured.nameError = 'Name ist erforderlich!';
    if (!type) errorsOccured.typeError = 'Typ ist erforderlich!';
    if (
      (type === authDataTypeEnum.ngsiv2 || type === authDataTypeEnum.ngsild) &&
      (!clientId || !clientSecret)
    ) {
      errorsOccured.clientError = 'Client ist erforderlich!';
    }
    if (
      (type === authDataTypeEnum.ngsiv2 || type === authDataTypeEnum.ngsild) &&
      (!appUser || !appUserPassword)
    ) {
      errorsOccured.appUserError = 'App-Benutzer ist erforderlich!';
    }
    // if (!apiToken) errorsOccured.apiToken = 'API-Token ist erforderlich!';
    const invalidUrlRequirement =
      'Bitte verwenden Sie nur Buchstaben, Zahlen, Unterstriche und Bindestriche!';
    if (
      (type === authDataTypeEnum.ngsiv2 || type === authDataTypeEnum.ngsild) &&
      !validateUrl(authUrl)
    )
      errorsOccured.authUrlError = `Ungültiges Auth-URL-Format. ${invalidUrlRequirement}`;
    if (
      (type === authDataTypeEnum.ngsiv2 || type === authDataTypeEnum.ngsild) &&
      !validateUrl(liveUrl)
    )
      errorsOccured.liveUrlError = `Ungültiges Live-URL-Format. ${invalidUrlRequirement}`;
    if (
      (type === authDataTypeEnum.ngsiv2 || type === authDataTypeEnum.ngsild) &&
      !validateUrl(timeSeriesUrl)
    )
      errorsOccured.timeSeriesUrlError = `Ungültiges Zeitreihen-URL-Format. ${invalidUrlRequirement}`;
    if (type === authDataTypeEnum.api && !validateUrl(apiUrl))
      errorsOccured.apiUrlError = `Ungültiges api-URL-Format. ${invalidUrlRequirement}`;

    if (Object.keys(errorsOccured).length) {
      for (const key in errorsOccured) {
        const error = errorsOccured[key] as string;
        textfieldErrorMessages.unshift(error);
      }
    }

    if (textfieldErrorMessages.length > 0) {
      for (const message of textfieldErrorMessages) {
        openSnackbar(message, 'warning');
      }
      setErrors(errorsOccured);
      return;
    }
    try {
      if (itemId) {
        await updateAuthData(auth?.user?.access_token, authData);
        openSnackbar('Datenplattform erfolgreich aktualisiert!', 'success');
      } else {
        await postAuthData(auth?.user?.access_token, authData);
        openSnackbar('Datenplattform erfolgreich erstellt!', 'success');
      }
      router.back();
    } catch (error) {
      openSnackbar('Datenplattform konnte nicht gespeichert werden.', 'error');
    }
  };

  return (
    <div>
      <div className="flex flex-col justify-start items-start content-center grow py-4">
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="Name" />
          <WizardTextfield
            value={name}
            onChange={(value: string | number): void =>
              setName(value.toString())
            }
            error={errors && errors.nameError}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
          />
        </div>
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="Type" />
          <WizardDropdownSelection
            currentValue={
              dataPlatformTypes.find((option) => option.value === type)
                ?.label || ''
            }
            onSelect={(value: number | string): void => {
              const selectedOption = dataPlatformTypes.find(
                (option) => option.label === value,
              );
              if (selectedOption) {
                setType(selectedOption.value);
              }
            }}
            selectableValues={dataPlatformTypes.map((option) => option.label)}
            iconColor={iconColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
          />
        </div>
        {type === authDataTypeEnum.ngsiv2 ||
        type === authDataTypeEnum.ngsild ? (
          <div className="flex flex-col justify-start items-start content-center grow w-full">
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Client Id" />
              <WizardTextfield
                value={clientId}
                onChange={(value: string | number): void =>
                  setClientId(value.toString())
                }
                error={errors && errors.clientError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Client Secret" />
              <WizardPasswordTextfield
                value={clientSecret}
                onChange={(value: string | number): void =>
                  setClientSecret(value.toString())
                }
                error={errors && errors.clientError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
                iconColor={iconColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="App User" />
              <WizardTextfield
                value={appUser}
                onChange={(value: string | number): void =>
                  setAppUser(value.toString())
                }
                error={errors && errors.appUserError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="App User Password" />
              <WizardPasswordTextfield
                value={appUserPassword}
                onChange={(value: string | number): void =>
                  setAppUserPassword(value.toString())
                }
                error={errors && errors.appUserError}
                iconColor={iconColor}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Authentifizierungs Url" />
              <WizardUrlTextfield
                value={authUrl}
                onChange={(value: string | number): void =>
                  setAuthUrl(value.toString())
                }
                error={errors && errors.authUrlError}
                iconColor={iconColor}
                borderColor={borderColor}
              />
            </div>
            {type === authDataTypeEnum.ngsiv2 ? (
              <>
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Live Url" />
                  <WizardUrlTextfield
                    value={liveUrl}
                    onChange={(value: string | number): void =>
                      setLiveUrl(value.toString())
                    }
                    error={errors && errors.liveUrlError}
                    iconColor={iconColor}
                    borderColor={borderColor}
                  />
                </div>
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Time Series Url" />
                  <WizardUrlTextfield
                    value={timeSeriesUrl}
                    onChange={(value: string | number): void =>
                      setTimeSeriesUrl(value.toString())
                    }
                    error={errors && errors.timeSeriesUrlError}
                    iconColor={iconColor}
                    borderColor={borderColor}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Daten Url" />
                  <WizardUrlTextfield
                    value={liveUrl}
                    onChange={(value: string | number): void => {
                      setLiveUrl(value.toString());
                      setTimeSeriesUrl(value.toString());
                    }}
                    error={errors && errors.liveUrlError}
                    iconColor={iconColor}
                    borderColor={borderColor}
                  />
                </div>
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="LD Context Url" />
                  <WizardUrlTextfield
                    value={ngsildContextUrl}
                    onChange={(value: string | number): void => {
                      setNgsildContextUrl(value.toString());
                    }}
                    error={errors && errors.liveUrlError}
                    iconColor={iconColor}
                    borderColor={borderColor}
                  />
                </div>
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="NGSILD Tenant" />
                  <WizardTextfield
                    value={ngsildTenant}
                    onChange={(value: string | number): void =>
                      setNgsildTenant(value.toString())
                    }
                    error={errors && errors.appUserError}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </>
            )}
            <div className="flex flex-col w-full pb-2">
              <WizardLabel
                label={
                  type === authDataTypeEnum.ngsiv2
                    ? 'Collections / Services (Liste mit Komma getrennt eingeben)'
                    : 'Typen (Liste mit Komma getrennt eingeben)'
                }
              />
              <WizardTextfield
                value={collections.join(',')}
                onChange={(value: string | number): void =>
                  handleCollectionChange(value.toString().replace(' ', ','))
                }
                error={errors && errors.appUserError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          </div>
        ) : type === authDataTypeEnum.usi ? (
          <div className="flex flex-col justify-start items-start content-center grow w-full">
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Client Id" />
              <WizardTextfield
                value={clientId}
                onChange={(value: string | number): void =>
                  setClientId(value.toString())
                }
                error={errors && errors.clientError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Client Secret" />
              <WizardPasswordTextfield
                value={clientSecret}
                onChange={(value: string | number): void =>
                  setClientSecret(value.toString())
                }
                error={errors && errors.clientError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
                iconColor={iconColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Grant Type (Zum Beispiel 'password' oder 'client_credentials'" />
              <WizardTextfield
                value={grantType}
                onChange={(value: string | number): void =>
                  setGrantType(value.toString())
                }
                error={errors && errors.clientError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Authentifizierungs Url" />
              <WizardUrlTextfield
                value={authUrl}
                onChange={(value: string | number): void =>
                  setAuthUrl(value.toString())
                }
                error={errors && errors.authUrlError}
                iconColor={iconColor}
                borderColor={borderColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Daten Url" />
              <WizardUrlTextfield
                value={liveUrl}
                onChange={(value: string | number): void =>
                  setLiveUrl(value.toString())
                }
                error={errors && errors.liveUrlError}
                iconColor={iconColor}
                borderColor={borderColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Eventtypes" />
              <WizardTextfield
                value={collections.join(',')}
                onChange={(value: string | number): void =>
                  handleCollectionChange(value.toString().replace(' ', ','))
                }
                error={errors && errors.appUserError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          </div>
        ) : type === authDataTypeEnum.api ? (
          // Orchideo Connect Dataplatform
          <div className="flex flex-col justify-start items-start content-center grow w-full">
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Orchideo Connect Url (endet mit /consumer-api/v1)" />
              <WizardUrlTextfield
                value={apiUrl}
                onChange={(value: string | number): void =>
                  setApiUrl(value.toString())
                }
                error={errors && errors.apiUrlError}
                iconColor={iconColor}
                borderColor={borderColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Authentifizierungs Url" />
              <WizardUrlTextfield
                value={authUrl}
                onChange={(value: string | number): void =>
                  setAuthUrl(value.toString())
                }
                error={errors && errors.authUrlError}
                iconColor={iconColor}
                borderColor={borderColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Client Id" />
              <WizardTextfield
                value={clientId}
                onChange={(value: string | number): void =>
                  setClientId(value.toString())
                }
                error={errors && errors.clientError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Grant Type" />
              <WizardTextfield
                value={grantType}
                onChange={(value: string | number): void =>
                  setGrantType(value.toString())
                }
                error={errors && errors.clientError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          </div>
        ) : type === authDataTypeEnum.internal ? (
          <div className="flex flex-col w-full pb-2">
            <WizardLabel
              label={'Collections (Liste mit Komma getrennt eingeben)'}
            />
            <WizardTextfield
              value={collections.join(',')}
              onChange={(value: string | number): void =>
                handleCollectionChange(value.toString().replace(' ', ','))
              }
              error={errors && errors.appUserError}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
        ) : (
          <div className="flex flex-col justify-start items-start content-center grow w-full">
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Url Endpunkt" />
              <WizardUrlTextfield
                value={apiUrl}
                onChange={(value: string | number): void =>
                  setApiUrl(value.toString())
                }
                error={errors && errors.apiUrlError}
                iconColor={iconColor}
                borderColor={borderColor}
              />
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end py-4 mb-8">
        <CancelButton />
        <SaveButton handleSaveClick={handleSaveDataPlatformClick} />
      </div>
    </div>
  );
}
