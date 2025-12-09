import { ReactElement, useEffect, useState } from 'react';

import CheckBox from '@/ui/CheckBox';
import {
  QueryConfig,
  ReportConfig,
  aggregationEnum,
  tabComponentSubTypeEnum,
  aggregationPeriodEnum,
  tabComponentTypeEnum,
  timeframeEnum,
  authDataTypeEnum,
  roundingModeEnum,
} from '@/types';
import CollapseButton from '@/ui/Buttons/CollapseButton';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import DataSourceDropdownSelection from '@/components/DataSourceDropdownSelection';
import { WizardErrors } from '@/types/errors';
import {
  aggregationOptions,
  aggregationPeriods,
  roundingModes,
  timeFrameWithoutLive,
} from '@/utils/enumMapper';
import ReportConfigWizard from '../ReportConfigWizard';
import QueryNgsiWizard from './QueryNgsiWizard';
import QueryOrchideoWizard from './QueryOrchideoWizard';
import QueryUsiWizard from './QueryUsiWizard';
import QueryInternalDataWizard from './QueryInternalDataWizard';

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
  tenant?: string;
};

const singleSelectWidgetTypes: string[] = [
  '180° Chart',
  '360° Chart',
  'Wert',
  'Stageable Chart',
  'Measurement',
  'Farbiger Slider',
  'Werte zu Bildern',
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
    tenant,
  } = props;

  const [queryConfigFormIsOpen, setQueryConfigFormIsOpen] = useState(false);
  const [datasourceOrigin, setDatasourceOrigin] = useState('');
  const [ngsiCollections, setNgsiCollections] = useState<string[]>([]);

  const handleQueryConfigChange = (update: Partial<QueryConfig>): void => {
    setQueryConfig((prevQueryConfig) => ({ ...prevQueryConfig, ...update }));
  };

  const handleCheckboxChange = (isSelected: boolean): void => {
    handleQueryConfigChange({ isReporting: isSelected });
  };

  const handleRoundingModeChange = (isSelected: boolean): void => {
    if (!isSelected) {
      handleQueryConfigChange({
        roundingMode: '',
        roundingTarget: 0,
      });
    } else {
      handleQueryConfigChange({
        roundingMode: 'standard',
      });
    }
  };

  const roundingExcludedSubTypes: tabComponentSubTypeEnum[] = [
    tabComponentSubTypeEnum.default,
    tabComponentSubTypeEnum.text,
    tabComponentSubTypeEnum.degreeChart180,
    tabComponentSubTypeEnum.degreeChart360,
    tabComponentSubTypeEnum.stageableChart,
    tabComponentSubTypeEnum.table,
    tabComponentSubTypeEnum.tableDynamic,
    tabComponentSubTypeEnum.pin,
    tabComponentSubTypeEnum.pinDynamic,
    tabComponentSubTypeEnum.parking,
    tabComponentSubTypeEnum.combinedMap,
    tabComponentSubTypeEnum.square,
    tabComponentSubTypeEnum.rectangle,
    tabComponentSubTypeEnum.circle,
    tabComponentSubTypeEnum.hexagon,
    tabComponentSubTypeEnum.onlyPin,
    tabComponentSubTypeEnum.onlyFormArea,
    tabComponentSubTypeEnum.combinedPinAndForm,
    tabComponentSubTypeEnum.geoJSON,
    tabComponentSubTypeEnum.geoJSONDynamic,
    tabComponentSubTypeEnum.coloredSlider,
    tabComponentSubTypeEnum.overviewSlider,
    tabComponentSubTypeEnum.barChartHorizontal,
    tabComponentSubTypeEnum.chartDateSelector,
  ];

  const showRoundingOptions =
    widgetType !== undefined &&
    !roundingExcludedSubTypes.includes(widgetType as tabComponentSubTypeEnum);

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

  return (
    <>
      <div className="flex flex-col w-full pb-2">
        <div className="flex gap-2 place-items-center">
          <WizardLabel label="Datenquelle" />
          <CollapseButton
            isOpen={queryConfigFormIsOpen}
            setIsOpen={setQueryConfigFormIsOpen}
          />
        </div>
      </div>
      {queryConfigFormIsOpen ? (
        <>
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Datenplattform" />
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
                if (collectionsFromDatasource) {
                  setNgsiCollections(collectionsFromDatasource);
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
            <QueryNgsiWizard
              queryConfig={queryConfig}
              setQueryConfig={setQueryConfig}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
              hoverColor={hoverColor}
              isSingleWidget={
                widgetType && singleSelectWidgetTypes.includes(widgetType)
                  ? true
                  : false
              }
              ngsiType={datasourceOrigin}
              ngsiCollections={ngsiCollections}
            />
          ) : datasourceOrigin === 'api' ? (
            <QueryOrchideoWizard
              queryConfig={queryConfig}
              setQueryConfig={setQueryConfig}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
              hoverColor={hoverColor}
              isSingleWidget={
                widgetType && singleSelectWidgetTypes.includes(widgetType)
                  ? true
                  : false
              }
            />
          ) : datasourceOrigin === 'usi' ? (
            <QueryUsiWizard
              queryConfig={queryConfig}
              setQueryConfig={setQueryConfig}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
              hoverColor={hoverColor}
              isSingleWidget={
                widgetType && singleSelectWidgetTypes.includes(widgetType)
                  ? true
                  : false
              }
            />
          ) : datasourceOrigin === 'internal' ? (
            <QueryInternalDataWizard
              queryConfig={queryConfig}
              setQueryConfig={setQueryConfig}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
              tenant={tenant}
              hoverColor={hoverColor}
              isSingleWidget={
                widgetType && singleSelectWidgetTypes.includes(widgetType)
                  ? true
                  : false
              }
            />
          ) : null}

          {/* Aggregation for timeseries data */}
          {widgetType === tabComponentSubTypeEnum.lineChart ||
          widgetType === tabComponentSubTypeEnum.lineChartDynamic ||
          widgetType === tabComponentSubTypeEnum.barChart ||
          widgetType === tabComponentSubTypeEnum.barChartDynamic ? (
            <div>
              {datasourceOrigin !== authDataTypeEnum.internal && (
                <>
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
                </>
              )}
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
          {showRoundingOptions && (
            <div className="flex flex-col w-full pb-2 mt-4">
              <CheckBox
                label="Wert Rundung aktivieren"
                value={!!queryConfig?.roundingMode}
                handleSelectChange={handleRoundingModeChange}
              />
            </div>
          )}
          {showRoundingOptions && queryConfig?.roundingMode && (
            <>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Rundungsmodus" />
                <WizardDropdownSelection
                  currentValue={
                    roundingModes.find(
                      (option) => option.value === queryConfig?.roundingMode,
                    )?.label || ''
                  }
                  selectableValues={roundingModes
                    .map((option) => option.label)
                    .filter((label) => label.trim() !== '')}
                  onSelect={(label: string | number): void => {
                    const enumValue = roundingModes.find(
                      (option) => option.label === label,
                    )?.value;
                    handleQueryConfigChange({
                      roundingMode: enumValue as roundingModeEnum,
                    });
                  }}
                  error={errors && errors.timeValueError}
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                />
              </div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Schritt" />
                <WizardTextfield
                  value={queryConfig?.roundingTarget || ''}
                  onChange={(value) =>
                    handleQueryConfigChange({ roundingTarget: Number(value) })
                  }
                  error={errors && errors.updateIntervalError}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                />
              </div>
            </>
          )}
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Meldung von Schwellenwertüberschreitungen" />
            <CheckBox
              label="Meldung aktivieren"
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
