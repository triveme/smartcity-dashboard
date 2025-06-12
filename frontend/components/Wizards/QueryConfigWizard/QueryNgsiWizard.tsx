import { ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

import { QueryConfig } from '@/types';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardLabel from '@/ui/WizardLabel';
import WizardMultipleDropdownSelection from '@/ui/WizardMultipleDropdownSelection';
import WizardTextfield from '@/ui/WizardTextfield';
import { WizardErrors } from '@/types/errors';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import {
  getAttributes,
  getEntityIds,
  getFiwareTypes,
} from '@/api/wizard-service-fiware';
import RefreshButton from '@/ui/Buttons/RefreshButton';

type QueryNgsiWizardProps = {
  queryConfig: QueryConfig | undefined;
  setQueryConfig: (
    update: (prevQueryConfig: QueryConfig | undefined) => Partial<QueryConfig>,
  ) => void;
  errors?: WizardErrors;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
  hoverColor: string;
  isSingleWidget: boolean;
  ngsiType: 'ngsi-v2' | 'ngsi-ld';
  ngsiCollections: string[];
};

export default function QueryNgsiWizard(
  props: QueryNgsiWizardProps,
): ReactElement {
  const {
    queryConfig,
    setQueryConfig,
    errors,
    iconColor,
    borderColor,
    backgroundColor,
    hoverColor,
    isSingleWidget,
    ngsiType,
    ngsiCollections,
  } = props;

  const auth = useAuth();
  const { openSnackbar } = useSnackbar();

  const [selectedCollection, setSelectedCollection] = useState('');

  const [selectedSource, setSelectedSource] = useState('');
  const [sources, setSources] = useState<string[]>([]);

  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [sensors, setSensors] = useState<string[]>([]);

  const [attributes, setAttributes] = useState<string[]>([]);
  const handleQueryConfigChange = (update: Partial<QueryConfig>): void => {
    setQueryConfig((prevQueryConfig) => ({ ...prevQueryConfig, ...update }));
  };

  const [loadingState, setLoadingState] = useState<{ [key: string]: boolean }>({
    collections: false,
    sources: false,
    sensors: false,
    attributes: false,
  });

  const toggleLoading = (key: string, isLoading: boolean): void => {
    setLoadingState((prev) => ({ ...prev, [key]: isLoading }));
  };

  const requestSource = async (): Promise<void> => {
    toggleLoading('source', true);
    try {
      let req: string[] = [];
      if (queryConfig?.dataSourceId && selectedCollection) {
        req = await getFiwareTypes(
          auth?.user?.access_token,
          selectedCollection,
          queryConfig?.dataSourceId,
          ngsiType === 'ngsi-v2' ? 'v2' : 'ld',
        );

        if (req.length > 0) {
          setSources(req);
          if (queryConfig?.fiwareType) {
            setSelectedSource(queryConfig?.fiwareType);
          } else {
            setSelectedSource(sources[0]);
          }
        }
      }
    } catch (error) {
      console.error(error);
      openSnackbar('Fehler beim Abfragen von Sources. Keine Daten', 'error');
    } finally {
      toggleLoading('source', false);
    }
  };

  const requestSensors = async (): Promise<void> => {
    toggleLoading('sensors', true);
    try {
      let req: string[] = [];
      if (
        selectedCollection &&
        selectedCollection !== '' &&
        queryConfig?.dataSourceId &&
        selectedSource &&
        selectedSource !== ''
      ) {
        req = await getEntityIds(
          selectedSource,
          auth?.user?.access_token,
          selectedCollection,
          queryConfig?.dataSourceId,
          ngsiType === 'ngsi-v2' ? 'v2' : 'ld',
        );
      } else {
        return;
      }
      setSensors(req);
      if (req.length > 0) {
        if (queryConfig?.entityIds) {
          setSelectedSensors(queryConfig?.entityIds);
        }
      }
    } catch (error) {
      console.error(error);
      openSnackbar('Fehler beim Abfragen von Sensoren. Keine Daten', 'error');
    } finally {
      toggleLoading('sensors', false);
    }
  };

  const requestAttributes = async (): Promise<void> => {
    toggleLoading('attributes', true);
    try {
      let req: string[] = [];
      if (
        selectedCollection &&
        queryConfig?.dataSourceId &&
        selectedSensors &&
        selectedSensors.length > 0
      ) {
        req = await getAttributes(
          selectedSource,
          auth?.user?.access_token,
          selectedCollection,
          queryConfig.dataSourceId,
          ngsiType === 'ngsi-v2' ? 'v2' : 'ld',
        );
      } else {
        return;
      }
      if (req.length > 0) {
        setAttributes(req);
      }
    } catch (error) {
      console.error(error);
      openSnackbar('Fehler beim Abfragen von Attributen. Keine Daten', 'error');
    } finally {
      toggleLoading('attributes', false);
    }
  };

  useEffect(() => {
    if (queryConfig?.fiwareService) {
      setSelectedCollection(queryConfig?.fiwareService);
    } else if (ngsiCollections && ngsiCollections.length > 0) {
      setSelectedCollection(ngsiCollections[0]);
    }
  }, [ngsiCollections]);

  useEffect(() => {
    if (selectedCollection) {
      requestSource();
    } else {
      setSelectedSource('');
      setSources([]);
      setSensors([]);
      setAttributes([]);
    }
  }, [selectedCollection]);

  useEffect(() => {
    if (selectedSource) {
      requestSensors();
    } else {
      setSensors([]);
      setAttributes([]);
    }
  }, [selectedSource]);

  useEffect(() => {
    if (selectedSensors && selectedSensors.length > 0) {
      requestAttributes();
    } else {
      setAttributes([]);
    }
  }, [selectedSensors]);

  return (
    <>
      <div>
        {ngsiType === 'ngsi-v2' ? (
          <div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Fiware-Servicepfad" />
              <WizardTextfield
                value={queryConfig?.fiwareServicePath || '/'}
                onChange={(value: string | number): void =>
                  handleQueryConfigChange({
                    fiwareServicePath: value.toString(),
                  })
                }
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Fiware-Service / Collections" />
              <div className="flex flex-row items-center">
                <div className="flex-1">
                  <WizardDropdownSelection
                    currentValue={queryConfig?.fiwareService || ''}
                    selectableValues={['', ...ngsiCollections]}
                    onSelect={(value: string | number): void => {
                      handleQueryConfigChange({
                        fiwareService: value.toString(),
                        fiwareType: '',
                        entityIds: [],
                        attributes: [],
                      });
                      setSelectedCollection(value.toString());
                    }}
                    error={errors && errors.fiwareServiceError}
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Fiware-Typ" />
              <div className="flex flex-row items-center">
                <div className="flex-1">
                  <WizardDropdownSelection
                    currentValue={queryConfig?.fiwareType || ''}
                    selectableValues={['', ...sources]}
                    onSelect={(value: string | number): void => {
                      handleQueryConfigChange({
                        fiwareType: value.toString(),
                        entityIds: [],
                        attributes: [],
                      });
                      setSelectedSource(value.toString());
                    }}
                    error={errors && errors.fiwareServiceError}
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
                <RefreshButton
                  handleClick={requestSource}
                  className={loadingState.source ? 'animate-spin' : ''}
                  fontColor={iconColor}
                  hoverColor={hoverColor}
                  backgroundColor={backgroundColor}
                />
              </div>
            </div>
            {isSingleWidget ? (
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label={'Entitäts-ID / Source'} />
                <div className="flex flex-row items-center">
                  <div className="flex-1">
                    <WizardDropdownSelection
                      currentValue={queryConfig?.entityIds?.[0] || ''}
                      selectableValues={['', ...sensors]}
                      error={errors && errors.sensorError}
                      onSelect={(value: string | number): void => {
                        handleQueryConfigChange({
                          entityIds: [value.toString()],
                        });
                        setSelectedSensors([value.toString()]);
                      }}
                      iconColor={iconColor}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <RefreshButton
                    handleClick={requestSensors}
                    className={loadingState.sensors ? 'animate-spin' : ''}
                    fontColor={iconColor}
                    hoverColor={hoverColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label={'Entitäts-IDs / Sources'} />
                <div className="flex flex-row items-center">
                  <div className="flex-1">
                    <WizardMultipleDropdownSelection
                      currentValue={queryConfig?.entityIds || []}
                      selectableValues={sensors}
                      error={errors && errors.sensorError}
                      onSelect={(value: string[]): void => {
                        handleQueryConfigChange({ entityIds: value });
                        setSelectedSensors(value);
                      }}
                      iconColor={iconColor}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <RefreshButton
                    handleClick={requestSensors}
                    className={loadingState.sensors ? 'animate-spin' : ''}
                    fontColor={iconColor}
                    hoverColor={hoverColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
            )}
            {isSingleWidget ? (
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label={'Attribut'} />
                <div className="flex flex-row items-center">
                  <div className="flex-1">
                    <WizardDropdownSelection
                      currentValue={queryConfig?.attributes[0] || ''}
                      selectableValues={['', ...attributes]}
                      error={errors && errors.attributeError}
                      onSelect={(value: string | number): void => {
                        handleQueryConfigChange({
                          attributes: [value.toString()],
                        });
                      }}
                      iconColor={iconColor}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <RefreshButton
                    handleClick={requestAttributes}
                    className={loadingState.attributes ? 'animate-spin' : ''}
                    fontColor={iconColor}
                    hoverColor={hoverColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Attribute" />
                <div className="flex flex-row items-center">
                  <div className="flex-1">
                    <WizardMultipleDropdownSelection
                      currentValue={queryConfig?.attributes || []}
                      selectableValues={attributes}
                      error={errors && errors.attributeError}
                      onSelect={(value: string[]): void => {
                        handleQueryConfigChange({ attributes: value });
                      }}
                      iconColor={iconColor}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <RefreshButton
                    handleClick={requestAttributes}
                    className={loadingState.attributes ? 'animate-spin' : ''}
                    fontColor={iconColor}
                    hoverColor={hoverColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Fiware-Typ" />
              <div className="flex flex-row items-center">
                <div className="flex-1">
                  <WizardDropdownSelection
                    currentValue={queryConfig?.fiwareType || ''}
                    selectableValues={['', ...sources]}
                    onSelect={(value: string | number): void => {
                      handleQueryConfigChange({
                        fiwareType: value.toString(),
                        entityIds: [],
                        attributes: [],
                      });
                      setSelectedSource(value.toString());
                    }}
                    error={errors && errors.fiwareServiceError}
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
                <RefreshButton
                  handleClick={requestSource}
                  className={loadingState.source ? 'animate-spin' : ''}
                  fontColor={iconColor}
                  hoverColor={hoverColor}
                  backgroundColor={backgroundColor}
                />
              </div>
            </div>
            {isSingleWidget ? (
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label={'Entitäts-ID / Source'} />
                <div className="flex flex-row items-center">
                  <div className="flex-1">
                    <WizardDropdownSelection
                      currentValue={queryConfig?.entityIds?.[0] || ''}
                      selectableValues={['', ...sensors]}
                      error={errors && errors.sensorError}
                      onSelect={(value: string | number): void => {
                        handleQueryConfigChange({
                          entityIds: [value.toString()],
                        });
                        setSelectedSensors([value.toString()]);
                      }}
                      iconColor={iconColor}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <RefreshButton
                    handleClick={requestSensors}
                    className={loadingState.sensors ? 'animate-spin' : ''}
                    fontColor={iconColor}
                    hoverColor={hoverColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label={'Entitäts-IDs / Sources'} />
                <div className="flex flex-row items-center">
                  <div className="flex-1">
                    <WizardMultipleDropdownSelection
                      currentValue={queryConfig?.entityIds || []}
                      selectableValues={sensors}
                      error={errors && errors.sensorError}
                      onSelect={(value: string[]): void => {
                        handleQueryConfigChange({ entityIds: value });
                        setSelectedSensors(value);
                      }}
                      iconColor={iconColor}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <RefreshButton
                    handleClick={requestSensors}
                    className={loadingState.sensors ? 'animate-spin' : ''}
                    fontColor={iconColor}
                    hoverColor={hoverColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
            )}
            {isSingleWidget ? (
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label={'Attribut'} />
                <div className="flex flex-row items-center">
                  <div className="flex-1">
                    <WizardDropdownSelection
                      currentValue={queryConfig?.attributes[0] || ''}
                      selectableValues={['', ...attributes]}
                      error={errors && errors.attributeError}
                      onSelect={(value: string | number): void => {
                        handleQueryConfigChange({
                          attributes: [value.toString()],
                        });
                      }}
                      iconColor={iconColor}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <RefreshButton
                    handleClick={requestAttributes}
                    className={loadingState.attributes ? 'animate-spin' : ''}
                    fontColor={iconColor}
                    hoverColor={hoverColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Attribute" />
                <div className="flex flex-row items-center">
                  <div className="flex-1">
                    <WizardMultipleDropdownSelection
                      currentValue={queryConfig?.attributes || []}
                      selectableValues={attributes}
                      error={errors && errors.attributeError}
                      onSelect={(value: string[]): void => {
                        handleQueryConfigChange({ attributes: value });
                      }}
                      iconColor={iconColor}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <RefreshButton
                    handleClick={requestAttributes}
                    className={loadingState.attributes ? 'animate-spin' : ''}
                    fontColor={iconColor}
                    hoverColor={hoverColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
