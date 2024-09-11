import { ReactElement, useEffect, useState } from 'react';
import CheckBox from '@/ui/CheckBox'; // Import the Checkbox component

import {
  QueryConfig,
  ReportConfig,
  aggregationEnum,
  tabComponentSubTypeEnum,
  aggregationPeriodEnum,
  tabComponentTypeEnum,
  timeframeEnum,
} from '@/types';
import CollapseButton from '@/ui/Buttons/CollapseButton';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardLabel from '@/ui/WizardLabel';
import WizardMultipleDropdownSelection from '@/ui/WizardMultipleDropdownSelection';
import WizardTextfield from '@/ui/WizardTextfield';
import DataSourceDropdownSelection from '@/components/DataSourceDropdownSelection';
import {
  getAttributeForSource,
  getCollections,
  getSensorsForSource,
  getSourcesForCollection,
} from '@/api/wizard-service-api';
import { WizardErrors } from '@/types/errors';
import { DataConfigRequestType } from '@/types/wizard';
import {
  aggregationOptions,
  aggregationPeriods,
  timeFrameWithoutLive,
} from '@/utils/enumMapper';
import ReportConfigWizard from './ReportConfigWizard';
import { useAuth } from 'react-oidc-context';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import {
  getAttributes,
  getEntityIds,
  getFiwareTypes,
} from '@/api/wizard-service-fiware';
import RefreshButton from '@/ui/Buttons/RefreshButton';

type QueryConfigWizardProps = {
  widgetType?: string;
  queryConfig: QueryConfig | undefined;
  setQueryConfig: (
    update: (prevQueryConfig: QueryConfig | undefined) => Partial<QueryConfig>,
  ) => void;
  errors?: WizardErrors;
  reportConfig: Partial<ReportConfig> | undefined;
  setReportConfig: (
    update: (prevReportConfig: ReportConfig) => ReportConfig,
  ) => void;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
  hoverColor: string;
  setOrigin: (selectedOrigin: string) => void;
};

const singleSelectWidgetTypes: string[] = [
  '180° Chart',
  '360° Chart',
  'Wert',
  'Stageable Chart',
  'Measurement',
  'Farbiger Slider',
];

export default function QueryConfigWizard(
  props: QueryConfigWizardProps,
): ReactElement {
  const {
    widgetType,
    queryConfig,
    setQueryConfig,
    errors,
    reportConfig,
    setReportConfig,
    iconColor,
    borderColor,
    backgroundColor,
    hoverColor,
    setOrigin,
  } = props;

  const auth = useAuth();
  const { openSnackbar } = useSnackbar();

  const [queryConfigFormIsOpen, setQueryConfigFormIsOpen] = useState(false);
  const [datasourceOrigin, setDatasourceOrigin] = useState('');

  // API Service Helpers
  const [selectedCollection, setSelectedCollection] = useState('');
  const [collections, setCollections] = useState<string[]>([]);

  const [selectedSource, setSelectedSource] = useState('');
  const [sources, setSources] = useState<string[]>([]);

  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [sensors, setSensors] = useState<string[]>([]);

  const [attributes, setAttributes] = useState<string[]>([]);

  const handleQueryConfigChange = (update: Partial<QueryConfig>): void => {
    setQueryConfig((prevQueryConfig) => ({ ...prevQueryConfig, ...update }));
  };

  const handleCheckboxChange = (isSelected: boolean): void => {
    handleQueryConfigChange({ isReporting: isSelected });
  };

  const requestCollections = async (): Promise<void> => {
    let req: string[] = [];
    if (datasourceOrigin === 'api') {
      req = await getCollections(
        queryConfig?.dataSourceId,
        auth?.user?.access_token,
      );
    } else {
      if (queryConfig?.fiwareService) {
        setSelectedCollection(queryConfig?.fiwareService);
      }
      return;
    }
    if (req.length > 0) {
      setCollections(['', ...req]);
      if (queryConfig?.fiwareService) {
        setSelectedCollection(queryConfig?.fiwareService);
      }
    } else {
      openSnackbar(
        'Fehler beim Abfragen von Collections. Keine Daten',
        'error',
      );
    }
  };

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

  const requestSource = async (): Promise<void> => {
    const params: DataConfigRequestType = {
      collection: selectedCollection,
      apiId: queryConfig?.dataSourceId,
      accessToken: auth?.user?.access_token,
    };
    let req: string[] = [];
    if (datasourceOrigin === 'api') {
      req = await getSourcesForCollection(params);
    } else {
      if (
        queryConfig?.fiwareService &&
        queryConfig.dataSourceId &&
        selectedCollection
      ) {
        req = await getFiwareTypes(
          auth?.user?.access_token,
          selectedCollection,
          queryConfig?.dataSourceId,
        );
      } else {
        return;
      }
    }

    if (req.length > 0) {
      setSources(['', ...req]);
      if (queryConfig?.fiwareType) {
        setSelectedSource(queryConfig?.fiwareType);
      }
    } else {
      openSnackbar('Fehler beim Abfragen von Sources. Keine Daten', 'error');
    }
  };

  useEffect(() => {
    if (selectedSource) {
      if (datasourceOrigin === 'api') {
        requestSensors();
        requestAttributes();
      } else {
        requestSensors();
      }
    } else {
      setSensors([]);
      setAttributes([]);
    }
  }, [selectedSource]);

  const requestSensors = async (): Promise<void> => {
    let req: string[] = [];
    if (datasourceOrigin === 'api') {
      const params: DataConfigRequestType = {
        collection: selectedCollection,
        source: selectedSource,
        apiId: queryConfig?.dataSourceId,
        accessToken: auth?.user?.access_token,
      };
      req = await getSensorsForSource(params);
    } else {
      if (
        queryConfig?.fiwareService &&
        queryConfig.dataSourceId &&
        selectedSource &&
        selectedSource !== ''
      ) {
        req = await getEntityIds(
          selectedSource,
          auth?.user?.access_token,
          queryConfig?.fiwareService,
          queryConfig?.dataSourceId,
        );
      } else {
        return;
      }
    }
    setSensors(['', ...req]);
    if (req.length > 0) {
      if (queryConfig?.entityIds) {
        setSelectedSensors(queryConfig?.entityIds);
      }
    } else {
      openSnackbar('Fehler beim Abfragen von Sensoren. Keine Daten', 'error');
    }
  };

  useEffect(() => {
    if (datasourceOrigin !== 'api') {
      if (selectedSensors && selectedSensors.length > 0) {
        requestAttributes();
      } else {
        setAttributes([]);
      }
    }
  }, [selectedSensors]);

  const requestAttributes = async (): Promise<void> => {
    let req: string[] = [];
    if (datasourceOrigin === 'api') {
      const params: DataConfigRequestType = {
        collection: selectedCollection,
        source: selectedSource,
        apiId: queryConfig?.dataSourceId,
        accessToken: auth?.user?.access_token,
      };
      req = await getAttributeForSource(params);
    } else {
      if (
        queryConfig?.fiwareService &&
        queryConfig.dataSourceId &&
        selectedSensors &&
        selectedSensors.length > 0
      ) {
        req = await getAttributes(
          selectedSensors,
          auth?.user?.access_token,
          queryConfig?.fiwareService,
          queryConfig?.dataSourceId,
        );
      } else {
        return;
      }
    }
    if (req.length > 0) {
      setAttributes(['', ...req]);
    } else {
      openSnackbar('Fehler beim Abfragen von Attributen. Keine Daten', 'error');
    }
  };

  useEffect(() => {
    if (!queryConfig) {
      handleQueryConfigChange({
        aggrMode: aggregationEnum.average,
        timeframe: timeframeEnum.live,
        fiwareServicePath: '/',
      });
    }
  }, []);

  useEffect(() => {
    if (widgetType === tabComponentTypeEnum.map) {
      handleQueryConfigChange({
        aggrMode: aggregationEnum.none,
        timeframe: timeframeEnum.live,
      });
    }
  }, [widgetType]);

  useEffect(() => {
    requestCollections();
  }, [queryConfig]);

  return (
    <>
      <div className="flex flex-col w-full pb-2">
        <div className="flex gap-2 place-items-center">
          <WizardLabel label="Query Konfiguration" />
          <CollapseButton
            isOpen={queryConfigFormIsOpen}
            setIsOpen={setQueryConfigFormIsOpen}
          />
        </div>
      </div>
      {queryConfigFormIsOpen ? (
        <>
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Datenquelle" />
            <DataSourceDropdownSelection
              selectedDataSource={queryConfig?.dataSourceId}
              onSelectDataSource={(
                value: string,
                origin: string,
                collectionsFromDatasource: string[],
              ): void => {
                handleQueryConfigChange({
                  dataSourceId: value,
                });
                setDatasourceOrigin(origin);
                setOrigin(origin);
                if (origin !== 'api') {
                  if (collectionsFromDatasource) {
                    setCollections(['', ...collectionsFromDatasource]);
                  }
                }
              }}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Aktualisierungs-Intervall (in Sekunden)" />
            <WizardTextfield
              value={queryConfig?.interval || ''}
              onChange={(value: string | number): void =>
                handleQueryConfigChange({ interval: value as number })
              }
              error={errors && errors.updateIntervalError}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          {datasourceOrigin === 'ngsi-v2' || datasourceOrigin === 'ngsi-ld' ? (
            <div>
              {datasourceOrigin === 'ngsi-v2' ? (
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
                          selectableValues={collections || []}
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
                      <RefreshButton
                        handleClick={requestCollections}
                        fontColor={iconColor}
                        hoverColor={hoverColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Fiware-Typ" />
                    <div className="flex flex-row items-center">
                      <div className="flex-1">
                        <WizardDropdownSelection
                          currentValue={queryConfig?.fiwareType || ''}
                          selectableValues={sources || []}
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
                        fontColor={iconColor}
                        hoverColor={hoverColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                  </div>
                  {widgetType &&
                  singleSelectWidgetTypes.includes(widgetType) ? (
                    <div className="flex flex-col w-full pb-2">
                      <WizardLabel label={'Entitäts-ID / Source'} />
                      <div className="flex flex-row items-center">
                        <div className="flex-1">
                          <WizardDropdownSelection
                            currentValue={queryConfig?.entityIds?.[0] || ''}
                            selectableValues={sensors}
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
                          fontColor={iconColor}
                          hoverColor={hoverColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                    </div>
                  )}
                  {widgetType &&
                  singleSelectWidgetTypes.includes(widgetType) ? (
                    <div className="flex flex-col w-full pb-2">
                      <WizardLabel label={'Attribut'} />
                      <div className="flex flex-row items-center">
                        <div className="flex-1">
                          <WizardDropdownSelection
                            currentValue={queryConfig?.attributes[0] || ''}
                            selectableValues={attributes}
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
                    <WizardLabel label="LD Tenant" />
                    <div className="flex-1">
                      <WizardTextfield
                        value={queryConfig?.fiwareService || ''}
                        onChange={(value: string | number): void => {
                          handleQueryConfigChange({
                            fiwareService: value.toString(),
                          });
                          setSelectedCollection(value.toString());
                        }}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Fiware-Typ" />
                    <div className="flex-1">
                      <WizardTextfield
                        value={queryConfig?.fiwareType || ''}
                        onChange={(value: string | number): void =>
                          handleQueryConfigChange({
                            fiwareType: value.toString(),
                          })
                        }
                        error={errors && errors.fiwareTypeError}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label={'Entitäts-ID / Source'} />
                    <div className="flex-1">
                      <WizardTextfield
                        value={queryConfig?.entityIds?.[0] || ''}
                        error={errors && errors.sensorError}
                        onChange={(value: string | number): void => {
                          handleQueryConfigChange({
                            entityIds: [value.toString()],
                          });
                        }}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label={'Attribut'} />
                    <div className="flex-1">
                      <WizardTextfield
                        value={queryConfig?.attributes[0] || ''}
                        error={errors && errors.attributeError}
                        onChange={(value: string | number): void => {
                          handleQueryConfigChange({
                            attributes: [value.toString()],
                          });
                        }}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // API SERVICE CONFIG
            <div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Collections" />
                <div className="flex flex-row items-center">
                  <div className="flex-1">
                    <WizardDropdownSelection
                      currentValue={queryConfig?.fiwareService || ''}
                      selectableValues={collections || []}
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
                  <RefreshButton
                    handleClick={requestCollections}
                    fontColor={iconColor}
                    hoverColor={hoverColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Sources" />
                <div className="flex flex-row items-center">
                  <div className="flex-1">
                    <WizardDropdownSelection
                      currentValue={queryConfig?.fiwareType || ''}
                      selectableValues={sources}
                      onSelect={(value: string | number): void => {
                        handleQueryConfigChange({
                          fiwareType: value.toString(),
                          entityIds: [],
                          attributes: [],
                        });
                        setSelectedSource(value.toString());
                      }}
                      error={errors && errors.fiwareTypeError}
                      iconColor={iconColor}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <RefreshButton
                    handleClick={requestSource}
                    fontColor={iconColor}
                    hoverColor={hoverColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
              {widgetType && singleSelectWidgetTypes.includes(widgetType) ? (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label={'Sensoren'} />
                  <div className="flex flex-row items-center">
                    <div className="flex-1">
                      <WizardDropdownSelection
                        currentValue={queryConfig?.entityIds?.[0] || ''}
                        selectableValues={sensors}
                        error={errors && errors.sensorError}
                        onSelect={(value: string | number): void => {
                          handleQueryConfigChange({
                            entityIds: [value.toString()],
                          });
                        }}
                        iconColor={iconColor}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                    <RefreshButton
                      handleClick={requestSensors}
                      fontColor={iconColor}
                      hoverColor={hoverColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label={'Sensoren'} />
                  <div className="flex flex-row items-center">
                    <div className="flex-1">
                      <WizardMultipleDropdownSelection
                        currentValue={queryConfig?.entityIds || []}
                        selectableValues={sensors}
                        error={errors && errors.sensorError}
                        onSelect={(value: string[]): void => {
                          handleQueryConfigChange({ entityIds: value });
                        }}
                        iconColor={iconColor}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                    <RefreshButton
                      handleClick={requestSensors}
                      fontColor={iconColor}
                      hoverColor={hoverColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                </div>
              )}
              {widgetType && singleSelectWidgetTypes.includes(widgetType) ? (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label={'Attribut'} />
                  <div className="flex flex-row items-center">
                    <div className="flex-1">
                      <WizardDropdownSelection
                        currentValue={queryConfig?.attributes[0] || ''}
                        selectableValues={attributes}
                        error={errors && errors.attributeError}
                        onSelect={(value: string | number): void =>
                          handleQueryConfigChange({
                            attributes: [value.toString()],
                          })
                        }
                        iconColor={iconColor}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                    <RefreshButton
                      handleClick={requestAttributes}
                      fontColor={iconColor}
                      hoverColor={hoverColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Attribute" />
                    <div className="flex flex-row items-center">
                      <div className="flex-1">
                        <WizardMultipleDropdownSelection
                          currentValue={queryConfig?.attributes || []}
                          error={errors && errors.attributeError}
                          selectableValues={attributes}
                          onSelect={(value: string[]): void => {
                            handleQueryConfigChange({ attributes: value });
                          }}
                          iconColor={iconColor}
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                    </div>
                    <RefreshButton
                      handleClick={requestAttributes}
                      fontColor={iconColor}
                      hoverColor={hoverColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {widgetType === tabComponentSubTypeEnum.lineChart ||
          widgetType === tabComponentSubTypeEnum.barChart ? (
            <div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Aggregationsmodus" />
                <WizardDropdownSelection
                  currentValue={
                    aggregationOptions.find(
                      (option) => option.value === queryConfig?.aggrMode,
                    )?.label || ''
                  }
                  selectableValues={aggregationOptions.map(
                    (option) => option.label,
                  )}
                  onSelect={(label: string | number): void => {
                    const selectedOption = aggregationOptions.find(
                      (option) => option.label === label,
                    );
                    if (selectedOption) {
                      handleQueryConfigChange({
                        aggrMode: selectedOption.value as aggregationEnum,
                      });
                    }
                  }}
                  error={errors && errors.aggregationsError}
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                />
              </div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Aggregations Periode" />
                <WizardDropdownSelection
                  currentValue={
                    aggregationPeriods.find(
                      (option) => option.value === queryConfig?.aggrPeriod,
                    )?.label || ''
                  }
                  selectableValues={aggregationPeriods.map(
                    (option) => option.label,
                  )}
                  onSelect={(label: string | number): void => {
                    const enumValue = aggregationPeriods.find(
                      (option) => option.label === label,
                    )?.value;
                    handleQueryConfigChange({
                      aggrPeriod: enumValue as aggregationPeriodEnum,
                    });
                  }}
                  error={errors && errors.aggregationPeriodError}
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                />
              </div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Zeitbereich" />
                <WizardDropdownSelection
                  currentValue={
                    timeFrameWithoutLive.find(
                      (option) => option.value === queryConfig?.timeframe,
                    )?.label || ''
                  }
                  selectableValues={timeFrameWithoutLive.map(
                    (option) => option.label,
                  )}
                  onSelect={(label: string | number): void => {
                    const enumValue = timeFrameWithoutLive.find(
                      (option) => option.label === label,
                    )?.value;
                    handleQueryConfigChange({
                      timeframe: enumValue as timeframeEnum,
                    });
                  }}
                  error={errors && errors.timeValueError}
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                />
              </div>
            </div>
          ) : null}

          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Report Threshold Exceedings" />
            <CheckBox
              label="Enable Reporting"
              value={queryConfig?.isReporting || false}
              handleSelectChange={handleCheckboxChange}
            />
          </div>
          {queryConfig?.isReporting && (
            <ReportConfigWizard
              reportConfig={reportConfig}
              setReportConfig={setReportConfig}
              errors={errors}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          )}
        </>
      ) : null}
    </>
  );
}
