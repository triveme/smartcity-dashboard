'use client';

import { ReactElement, useEffect, useState } from 'react';

import WizardLabel from '@/ui/WizardLabel';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import {
  Tab,
  tabComponentTypeEnum,
  tabComponentSubTypeEnum,
  QueryConfig,
  Widget,
  WidgetWithChildren,
  combinedComponentLayoutEnum,
  componentLayoutEnum,
} from '@/types';
import WizardSelectBox from '@/ui/WizardSelectBox';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import StaticValuesField from '@/ui/StaticValuesFields';
import IconSelection from '@/ui/Icons/IconSelection';
import WizardFileUpload from '@/ui/WizardFileUpload';
import WizardJSONUpload from '@/ui/WizardJSONUpload';
import CollapseButton from '@/ui/Buttons/CollapseButton';
import { WizardErrors } from '@/types/errors';
import {
  chartComponentSubTypes,
  chartDateRepresentation,
  mapDisplayModes,
  mapComponentShapeOptions,
  mapComponentSubTypes,
  informationComponentSubTypes,
  sliderComponentSubTypes,
  interactiveComponentSubTypes,
} from '@/utils/enumMapper';
import WizardUrlTextfield from '@/ui/WizardUrlTextfield';
import HorizontalDivider from '@/ui/HorizontalDivider';
import StaticValuesFieldMapWidgets from '@/ui/StaticValuesFieldsMapWidgets';
import WizardTextfield from '@/ui/WizardTextfield';
import StaticValuesFieldMapLegend from '@/ui/StaticValuesFieldsMapLegend';
import WizardIntegerfield from '@/ui/WizardIntegerfield';
import { useAuth } from 'react-oidc-context';
import {
  getWidgets,
  getWidgetsByTenantAndTabComponentType,
} from '@/api/widget-service';
import { useQuery } from '@tanstack/react-query';
import SearchableDropdown from '@/ui/SearchableDropdown';
import StaticValuesFieldRange from '@/ui/StaticValuesFieldsRange';
import CreateDashboardElementButton from '@/ui/Buttons/CreateDashboardElementButton';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import TableColorPickerPanel from '@/ui/TableColorPickerPanel';
import ValuesToImageFields from '@/ui/ValuesToImageFields';
import UnitsField from '@/ui/UnitsField';

type TabWizardProps = {
  tab: Tab | undefined;
  setTab: (update: (prevTab: Tab | undefined) => Partial<Tab>) => void;
  handleWidgetChange: (update: Partial<Widget>) => void;
  errors?: WizardErrors;
  iconColor: string;
  borderColor: string;
  tableFontColor: string;
  tableHeaderColor: string;
  tableOddRowColor: string;
  tableEvenRowColor: string;
  backgroundColor: string;
  panelFontColor: string;
  panelBorderRadius: string;
  panelBorderSize: string;
  hoverColor: string;
  queryConfig: QueryConfig;
  tenant: string | undefined;
  fontColor: string;
};

export default function TabWizard(props: TabWizardProps): ReactElement {
  const {
    tab,
    setTab,
    handleWidgetChange,
    errors,
    iconColor,
    borderColor,
    tableFontColor,
    tableHeaderColor,
    tableOddRowColor,
    tableEvenRowColor,
    backgroundColor,
    panelFontColor,
    panelBorderRadius,
    panelBorderSize,
    hoverColor,
    queryConfig,
    tenant,
    fontColor,
  } = props;

  const auth = useAuth();
  const accessToken = auth.user?.access_token || '';
  const { openSnackbar } = useSnackbar();
  const [tabFormIsOpen, setTabFormIsOpen] = useState(false);
  const [longitude, setLongitude] = useState(
    tab?.mapLongitude || 9.603538459598571,
  );
  const [latitude, setLatitude] = useState(
    tab?.mapLatitude || 50.585075277802574,
  );
  const [maxZoom, setMaxZoom] = useState(tab?.mapMaxZoom || 20);
  const [minZoom, setMinZoom] = useState(tab?.mapMinZoom || 10);
  const [standardZoom, setStandardZoom] = useState(tab?.mapStandardZoom || 15);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(['', '']);
  const [combinedMapWidgetsId, setCombinedMapWidgetsId] = useState<string[]>(
    tab?.childWidgets || [''],
  );

  const handleTabChange = (update: Partial<Tab>): void => {
    setTab((prevTab) => {
      const newTab = { ...prevTab, ...update };

      // set widget height = 0 for Information and Value widgets
      if (
        prevTab?.componentType !== tabComponentTypeEnum.information &&
        newTab.componentType === tabComponentTypeEnum.information
      ) {
        handleWidgetChange({ height: 0 });
      }

      return newTab;
    });
  };

  const [imageSource, setImageSource] = useState('URL');

  const { data: allWidgets } = useQuery<Widget[], Error>({
    queryKey: ['widgets'],
    queryFn: () => getWidgets(auth?.user?.access_token, tenant),
  });

  const { data: allMapWidgets } = useQuery<WidgetWithChildren[], Error>({
    queryKey: ['widgets', tabComponentTypeEnum.map],
    queryFn: () =>
      getWidgetsByTenantAndTabComponentType(
        auth?.user?.access_token,
        tabComponentTypeEnum.map,
        tenant,
      ),
    enabled: tab?.componentSubType === tabComponentSubTypeEnum.combinedMap,
  });
  // get all single map widgets
  const mapWidgetsArray =
    allMapWidgets
      ?.filter(
        (item) =>
          item.tab.componentSubType !== tabComponentSubTypeEnum.combinedMap,
      )
      .map((item) => item.widget) || [];

  const handleAddWidget = (): void => {
    setCombinedMapWidgetsId([...combinedMapWidgetsId, '']);
  };

  const handleRemoveWidget = (index: number): void => {
    const updatedWidgets = combinedMapWidgetsId.filter((_, i) => i !== index);
    setCombinedMapWidgetsId(updatedWidgets);
    handleTabChange({ childWidgets: updatedWidgets });
  };

  const handleWidgetClear = (index: number): void => {
    const updatedWidgets = [...combinedMapWidgetsId];
    updatedWidgets[index] = '';
    setCombinedMapWidgetsId(updatedWidgets);
    handleTabChange({ childWidgets: updatedWidgets });
  };

  const handleWidgetSelect = (selectedName: string, index: number): void => {
    const selectedWidget = mapWidgetsArray?.find(
      (widget) => widget.name === selectedName,
    );
    const updatedWidgets = [...combinedMapWidgetsId];
    updatedWidgets[index] = selectedWidget?.id || '';
    setCombinedMapWidgetsId(updatedWidgets);
    handleTabChange({ childWidgets: updatedWidgets });
  };

  useEffect(() => {
    if (tab?.childWidgets) {
      setCombinedMapWidgetsId(tab.childWidgets);
    }
  }, [tab?.childWidgets]);

  const handleImageSourceChange = (selectedImageSource: string): void => {
    if (selectedImageSource === 'Datei') {
      handleTabChange({ imageUrl: undefined });
      handleTabChange({ imageUpdateInterval: -1 });
    }
    if (selectedImageSource === 'URL') {
      handleTabChange({ imageSrc: undefined });
    }
    setImageSource(selectedImageSource);
  };

  const [isImageAutoRefresh, setIsImageAutoRefresh] = useState(false);

  useEffect(() => {
    if (tab) {
      setIsImageAutoRefresh(
        !!(tab?.imageUpdateInterval && tab?.imageUpdateInterval > 0),
      );
      if (tab?.imageUrl) {
        setImageSource('URL');
      }
      if (tab?.imageSrc && !tab?.imageUrl) {
        setImageSource('Datei');
      }
    }
  }, [tab]);

  const addWidget = (): void => {
    const updatedWidgets = [...selectedWidgets, ''];
    setSelectedWidgets(updatedWidgets);
    handleTabChange({ childWidgets: updatedWidgets });
  };

  const removeWidget = (index: number): void => {
    // only remove if have minimum of 2 widgets
    if (selectedWidgets.length > 2) {
      const updatedWidgets = selectedWidgets.filter((_, i) => i !== index);
      setSelectedWidgets(updatedWidgets);
      handleTabChange({ childWidgets: updatedWidgets });
    } else {
      openSnackbar(
        'Kombinierte Komponente muss mindestens 2 Widgets haben',
        'warning',
      );
    }
  };

  const updateWidget = (index: number, widgetId: string): void => {
    const updatedWidgets = [...selectedWidgets];
    updatedWidgets[index] = widgetId;
    setSelectedWidgets(updatedWidgets);
    handleTabChange({ childWidgets: updatedWidgets });
  };

  useEffect(() => {
    if (
      tab &&
      (tab.componentType === tabComponentTypeEnum.combinedComponent ||
        (tab.componentType === tabComponentTypeEnum.map &&
          tab.componentSubType === tabComponentSubTypeEnum.combinedMap))
    ) {
      setSelectedWidgets(tab?.childWidgets || ['', '']);
    }
  }, [tab]);

  useEffect(() => {
    if (tab) {
      if (tab.componentType === tabComponentTypeEnum.map) {
        if (tab.mapLongitude && tab.mapLatitude) {
          setLongitude(tab.mapLongitude);
          setLatitude(tab.mapLatitude);
        } else {
          setLongitude(9.603538459598571);
          setLatitude(50.585075277802574);
          handleTabChange({
            mapLongitude: 9.603538459598571,
            mapLatitude: 50.585075277802574,
          });
        }
      }
    }
  }, [tab?.componentType]);

  useEffect(() => {
    if (!isImageAutoRefresh) {
      handleTabChange({ imageUpdateInterval: -1 });
    }
  }, [isImageAutoRefresh]);

  const handleChangeIsImageAutoRefresh = (value: boolean): void => {
    setIsImageAutoRefresh(value);
    if (value) {
      handleTabChange({ imageUpdateInterval: 60 });
    }
  };

  const [file, setFile] = useState<File>();

  useEffect(() => {
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
    }
    reader.onloadend = (): void => {
      const base64String = reader.result as string;
      const interpulatedBase64String = base64String.replace(
        /^data:image\/[a-z]+;base64,/,
        '',
      );
      if (tab) {
        setTab((prevTab) => ({
          ...prevTab,
          imageSrc: interpulatedBase64String,
        }));
      }
    };
  }, [file]);

  const [geoJSONFile, setGeoJSONFile] = useState<File>();

  useEffect(() => {
    const reader = new FileReader();
    if (geoJSONFile) {
      reader.readAsText(geoJSONFile, 'UTF-8');
    }
    reader.onloadend = (): void => {
      const fileString = reader.result as string;
      if (tab) {
        setTab((prevTab) => ({
          ...prevTab,
          mapGeoJSON: fileString,
        }));
      }
    };
  }, [geoJSONFile]);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col w-full pb-2">
        <div className="flex gap-2 place-items-center">
          <WizardLabel label="Tab Konfiguration" />
          <CollapseButton isOpen={tabFormIsOpen} setIsOpen={setTabFormIsOpen} />
        </div>
      </div>
      {tabFormIsOpen && (
        <div>
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Komponente" />
            <WizardDropdownSelection
              currentValue={tab?.componentType || ''}
              selectableValues={Object.values(tabComponentTypeEnum)}
              onSelect={(value): void =>
                handleTabChange({ componentType: value.toString() })
              }
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
              error={errors?.tabComponentTypeError}
            />
          </div>
          {tab?.componentType === tabComponentTypeEnum.diagram && (
            <div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Typ" />
                <WizardDropdownSelection
                  currentValue={
                    chartComponentSubTypes.find(
                      (option) => option.value === tab?.componentSubType,
                    )?.label || ''
                  }
                  selectableValues={chartComponentSubTypes.map(
                    (option) => option.label,
                  )}
                  onSelect={(label: string | number): void => {
                    const enumValue = chartComponentSubTypes.find(
                      (option) => option.label === label,
                    )?.value;
                    handleTabChange({ componentSubType: enumValue });
                  }}
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                  error={errors?.tabComponentSubTypeError}
                />
              </div>
              {(tab?.componentSubType ===
                tabComponentSubTypeEnum.barChartDynamic ||
                tab?.componentSubType ===
                  tabComponentSubTypeEnum.lineChartDynamic ||
                tab?.componentSubType ===
                  tabComponentSubTypeEnum.pieChartDynamic) && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Interaktions Farben" />
                  <div className="flex flex-row items-center">
                    <ColorPickerComponent
                      currentColor={tab?.dynamicHighlightColor || '#0347a6'}
                      handleColorChange={(color: string): void =>
                        handleTabChange({
                          dynamicHighlightColor: color,
                        })
                      }
                      label="Highlight Farbe"
                    />
                    <ColorPickerComponent
                      currentColor={tab?.dynamicUnhighlightColor || '#647D9E'}
                      handleColorChange={(color: string): void =>
                        handleTabChange({
                          dynamicUnhighlightColor: color,
                        })
                      }
                      label="Unhighlight Farbe"
                    />
                  </div>
                  <WizardSelectBox
                    checked={tab?.chartDynamicOnlyShowHover || false}
                    onChange={(value: boolean): void =>
                      handleTabChange({
                        chartDynamicOnlyShowHover: value,
                      })
                    }
                    label="Nur Hover Daten anzeigen"
                  />
                  <WizardSelectBox
                    checked={
                      tab?.chartDynamicNoSelectionDisplayAll === undefined
                        ? true
                        : tab?.chartDynamicNoSelectionDisplayAll
                    }
                    onChange={(value: boolean): void =>
                      handleTabChange({
                        chartDynamicNoSelectionDisplayAll: value,
                      })
                    }
                    disabled={tab?.chartDynamicOnlyShowHover === true}
                    label="Alle Daten ohne Auswahl darstellen"
                  />
                </div>
              )}
              {tab?.componentSubType ===
                tabComponentSubTypeEnum.tableDynamic && (
                <ColorPickerComponent
                  currentColor={tab?.dynamicHighlightColor || '#0347a6'}
                  handleColorChange={(color: string): void =>
                    handleTabChange({
                      dynamicHighlightColor: color,
                    })
                  }
                  label="Highlight Farbe"
                />
              )}
              {(tab?.componentSubType === '180° Chart' ||
                tab?.componentSubType === '360° Chart') && (
                <div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Minimum" />
                    <WizardTextfield
                      value={tab?.chartMinimum ?? ''}
                      onChange={(value: string | number): void => {
                        handleTabChange({ chartMinimum: value as number });
                      }}
                      isNumeric={true}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Maximum" />
                    <WizardTextfield
                      value={tab?.chartMaximum ?? ''}
                      onChange={(value: string | number): void => {
                        handleTabChange({ chartMaximum: value as number });
                      }}
                      isNumeric={true}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Einheit" />
                    <WizardTextfield
                      value={tab?.chartUnit || ''}
                      onChange={(value: string | number): void =>
                        handleTabChange({ chartUnit: value.toString() })
                      }
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                </div>
              )}
              {tab?.componentSubType === 'Stageable Chart' && (
                <div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Minimum" />
                    <WizardTextfield
                      value={tab?.chartMinimum ?? ''}
                      onChange={(value: string | number): void => {
                        handleTabChange({ chartMinimum: value as number });
                      }}
                      isNumeric={true}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Maximum" />
                    <WizardTextfield
                      value={tab?.chartMaximum ?? ''}
                      onChange={(value: string | number): void => {
                        handleTabChange({ chartMaximum: value as number });
                      }}
                      isNumeric={true}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Einheit" />
                    <WizardTextfield
                      value={tab?.chartUnit || ''}
                      onChange={(value: string | number): void =>
                        handleTabChange({ chartUnit: value.toString() })
                      }
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Number of Tiles" />
                    <WizardIntegerfield
                      value={tab?.tiles || '0'}
                      onChange={(value: string | number): void =>
                        handleTabChange({ tiles: value as number })
                      }
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2 gap-4">
                    <WizardLabel label="Statische Werte" />
                    <StaticValuesField
                      initialChartStaticValues={tab?.chartStaticValues || []}
                      initialStaticColors={tab?.chartStaticValuesColors || []}
                      initialStaticValuesTicks={
                        tab?.chartStaticValuesTicks || []
                      }
                      initialStaticValuesLogos={
                        tab?.chartStaticValuesLogos || []
                      }
                      initialStaticValuesTexts={
                        tab?.chartStaticValuesTexts || []
                      }
                      handleTabChange={handleTabChange}
                      error={errors?.stageableColorValueError}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                      fontColor={fontColor}
                      type="slider"
                    />
                  </div>
                </div>
              )}
              {(tab?.componentSubType === tabComponentSubTypeEnum.lineChart ||
                tab?.componentSubType ===
                  tabComponentSubTypeEnum.lineChartDynamic ||
                tab?.componentSubType === tabComponentSubTypeEnum.barChart ||
                tab?.componentSubType ===
                  tabComponentSubTypeEnum.barChartDynamic ||
                tab?.componentSubType ===
                  tabComponentSubTypeEnum.barChartHorizontal) && (
                <div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Name der X-Achse" />
                    <WizardTextfield
                      value={tab?.chartXAxisLabel || ''}
                      onChange={(value: string | number): void =>
                        handleTabChange({ chartXAxisLabel: value.toString() })
                      }
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Name der Y-Achse" />
                    <WizardTextfield
                      value={tab?.chartYAxisLabel || ''}
                      onChange={(value: string | number): void =>
                        handleTabChange({ chartYAxisLabel: value.toString() })
                      }
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <div>
                      <WizardLabel label="Anzahl Dezimalstellen" />
                      <WizardIntegerfield
                        value={tab?.decimalPlaces || '0'}
                        onChange={(value: string | number): void =>
                          handleTabChange({ decimalPlaces: value as number })
                        }
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                  </div>
                  <div className="flex w-full items-center">
                    <div className="flex flex-col w-full pb-2">
                      <WizardLabel label="Format Datumsanzeige xAchse" />
                      <WizardDropdownSelection
                        currentValue={
                          chartDateRepresentation.find(
                            (option) =>
                              option.value === tab?.chartDateRepresentation,
                          )?.label || ''
                        }
                        selectableValues={chartDateRepresentation.map(
                          (option) => option.label,
                        )}
                        onSelect={(label: string | number): void => {
                          const enumValue = chartDateRepresentation.find(
                            (option) => option.label === label,
                          )?.value;
                          handleTabChange({
                            chartDateRepresentation: enumValue,
                          });
                        }}
                        iconColor={iconColor}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                        error={errors?.chartDateRepresentationError}
                      />
                    </div>
                  </div>
                  <div className="w-full flex flex-col">
                    <div className="flex w-full items-center">
                      <div className="min-w-[220px]">
                        <WizardLabel label="Legende anzeigen?" />
                      </div>
                      <WizardSelectBox
                        checked={tab?.showLegend || false}
                        onChange={(value: boolean): void => {
                          handleTabChange({ showLegend: value });
                          handleTabChange({
                            chartLegendAlign: 'Top',
                          }); /* prefill dropdown for alignment */
                        }}
                        label=" Legende"
                      />
                      {/* it doesn't make sense to show a dropdown menu with one option already selected */}
                      {/* {tab.showLegend && (
                        <div className="flex-grow">
                          <WizardDropdownSelection
                            currentValue={
                              chartLegendAlignments.find(
                                (option) =>
                                  option.value === tab?.chartLegendAlign,
                              )?.label || 'Top'
                            }
                            selectableValues={chartLegendAlignments.map(
                              (option) => option.label,
                            )}
                            onSelect={(label: string | number): void => {
                              const enumValue = chartLegendAlignments.find(
                                (option) => option.label === label,
                              )?.value;
                              handleTabChange({ chartLegendAlign: enumValue });
                            }}
                            iconColor={iconColor}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      )} */}
                    </div>
                    <div className="flex w-full items-center">
                      <div className="min-w-[220px]">
                        <WizardLabel label="Zusätzliche Filterung?" />
                      </div>
                      <WizardSelectBox
                        checked={tab?.chartHasAdditionalSelection || false}
                        onChange={(value: boolean): void =>
                          handleTabChange({
                            chartHasAdditionalSelection: value,
                          })
                        }
                        label=" Filter"
                      />
                    </div>
                    <div className="flex w-full items-center">
                      <div className="min-w-[220px]">
                        <WizardLabel label="Nur einzelne Werte beim Hover anzeigen?" />
                      </div>
                      <WizardSelectBox
                        checked={tab?.chartHoverSingleValue || false}
                        onChange={(value: boolean): void =>
                          handleTabChange({
                            chartHoverSingleValue: value,
                          })
                        }
                        label=" Zusammenfassung"
                      />
                    </div>
                    <div className="flex w-full items-center">
                      <div className="min-w-[220px]">
                        <WizardLabel label="Bilddownload erlauben?" />
                      </div>
                      <WizardSelectBox
                        checked={tab?.chartAllowImageDownload || false}
                        onChange={(value: boolean): void =>
                          handleTabChange({
                            chartAllowImageDownload: value,
                          })
                        }
                        label=" Bilddownload"
                      />
                    </div>
                    <div className="flex w-full items-center">
                      <div className="min-w-[220px]">
                        <WizardLabel label="Zoomen Erlauben?" />
                      </div>
                      <WizardSelectBox
                        checked={tab?.mapAllowZoom || false}
                        onChange={(value: boolean): void =>
                          handleTabChange({ mapAllowZoom: value })
                        }
                        label=" Zoom"
                      />
                    </div>
                    {(tab?.componentSubType ===
                      tabComponentSubTypeEnum.lineChart ||
                      tab?.componentSubType ===
                        tabComponentSubTypeEnum.lineChartDynamic) && (
                      <>
                        <div className="flex w-full items-center">
                          <div className="min-w-[220px]">
                            <WizardLabel label="Stufenlinie anzeigen?" />
                          </div>
                          <WizardSelectBox
                            checked={tab?.isStepline || false}
                            onChange={(value: boolean): void =>
                              handleTabChange({ isStepline: value })
                            }
                            label=" Stufenlinie"
                          />
                        </div>
                        <div className="flex w-full items-center">
                          <div className="min-w-[220px]">
                            <WizardLabel label="Automatischer Zoom der Achseneinteilung" />
                          </div>
                          <WizardSelectBox
                            checked={tab?.chartHasAutomaticZoom || false}
                            onChange={(value: boolean): void =>
                              handleTabChange({ chartHasAutomaticZoom: value })
                            }
                            label="Automatischer Zoom"
                          />
                        </div>
                      </>
                    )}
                    {(tab?.componentSubType ===
                      tabComponentSubTypeEnum.barChart ||
                      tab?.componentSubType ===
                        tabComponentSubTypeEnum.barChartDynamic ||
                      tab?.componentSubType ===
                        tabComponentSubTypeEnum.lineChart ||
                      tab?.componentSubType ===
                        tabComponentSubTypeEnum.lineChartDynamic ||
                      tab?.componentSubType ===
                        tabComponentSubTypeEnum.barChartHorizontal) && (
                      <div className="flex w-full items-center">
                        <div className="min-w-[220px]">
                          <WizardLabel label="Gestapelte Werte?" />
                        </div>
                        <WizardSelectBox
                          checked={tab?.isStackedChart || false}
                          onChange={(value: boolean): void =>
                            handleTabChange({ isStackedChart: value })
                          }
                          label=" Stapel"
                        />
                      </div>
                    )}
                    <div className="flex w-full items-center">
                      <div className="min-w-[220px]">
                        <WizardLabel label="Y-Achsen Interval setzen?" />
                      </div>
                      <WizardSelectBox
                        checked={tab?.setYAxisInterval || false}
                        onChange={(value: boolean): void => {
                          if (value === true) {
                            handleTabChange({
                              setYAxisInterval: value,
                              chartYAxisScale: 0,
                              chartYAxisScaleChartMinValue: 0,
                              chartYAxisScaleChartMaxValue: 100,
                            });
                          } else {
                            handleTabChange({
                              setYAxisInterval: false,
                              chartYAxisScale: null,
                              chartYAxisScaleChartMinValue: null,
                              chartYAxisScaleChartMaxValue: null,
                            });
                          }
                        }}
                        label=" Interval"
                      />
                    </div>
                    {tab?.componentSubType ===
                      tabComponentSubTypeEnum.barChartHorizontal && (
                      <>
                        <div className="flex w-full items-center">
                          <div className="min-w-[220px]">
                            <WizardLabel label="Aufsteigend sortieren?" />
                          </div>
                          <WizardSelectBox
                            checked={tab?.setSortAscending || false}
                            onChange={(value: boolean): void =>
                              handleTabChange({ setSortAscending: value })
                            }
                            disabled={tab?.setSortDescending || false}
                            label=" Aufsteigend"
                          />
                        </div>
                        <div className="flex w-full items-center">
                          <div className="min-w-[220px]">
                            <WizardLabel label="Absteigend sortieren?" />
                          </div>
                          <WizardSelectBox
                            checked={tab?.setSortDescending || false}
                            onChange={(value: boolean): void =>
                              handleTabChange({ setSortDescending: value })
                            }
                            disabled={tab?.setSortAscending || false}
                            label=" Absteigend"
                          />
                        </div>
                        <div className="flex w-full items-center">
                          <div className="min-w-[220px]">
                            <WizardLabel label="Werteanzahl begrenzen?" />
                          </div>
                          <WizardSelectBox
                            checked={tab?.setValueLimit || false}
                            onChange={(value: boolean): void =>
                              handleTabChange({ setValueLimit: value })
                            }
                            label={`Nur Top ${tab?.userDefinedLimit || 10} anzeigen`}
                            // label="Nur Top 10 anzeigen"
                          />
                          {tab?.setValueLimit && (
                            <div className="flex-grow">
                              <WizardLabel label="Konkrete Anzahl der Werte" />
                              <WizardTextfield
                                isNumeric={true}
                                value={tab?.userDefinedLimit || 10}
                                onChange={(value: string | number): void =>
                                  handleTabChange({
                                    userDefinedLimit: value as number,
                                  })
                                }
                                borderColor={borderColor}
                                backgroundColor={backgroundColor}
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                    <div className="flex flex-col w-full pb-2">
                      {tab.setYAxisInterval && (
                        <>
                          <div className="flex-grow">
                            <WizardLabel label="Skalierung y-Achse (Werte von 0.1 bis 1000 möglich, 0 für Automatische Skallierung)." />
                            <WizardTextfield
                              isNumeric={true}
                              value={tab?.chartYAxisScale || 0}
                              onChange={(value: string | number): void =>
                                handleTabChange({
                                  chartYAxisScale: value as number,
                                })
                              }
                              borderColor={borderColor}
                              backgroundColor={backgroundColor}
                            />
                          </div>
                          <div className="flex-grow">
                            <WizardLabel label="Minimalwert Skala der yAchse" />
                            <WizardTextfield
                              isNumeric={true}
                              value={tab?.chartYAxisScaleChartMinValue || 0}
                              onChange={(value: string | number): void =>
                                handleTabChange({
                                  chartYAxisScaleChartMinValue: value as number,
                                })
                              }
                              borderColor={borderColor}
                              backgroundColor={backgroundColor}
                            />
                          </div>
                          <div className="flex-grow">
                            <WizardLabel label="Maximalwert Skala der yAchse" />
                            <WizardTextfield
                              isNumeric={true}
                              value={tab?.chartYAxisScaleChartMaxValue || 100}
                              onChange={(value: string | number): void =>
                                handleTabChange({
                                  chartYAxisScaleChartMaxValue: value as number,
                                })
                              }
                              borderColor={borderColor}
                              backgroundColor={backgroundColor}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <HorizontalDivider />
                  <div className="flex flex-col w-full pb-2 gap-4">
                    <div className="min-w-[200px]">
                      <WizardLabel label="Statische Werte" />
                    </div>
                    <StaticValuesField
                      initialChartStaticValues={tab?.chartStaticValues || []}
                      initialStaticColors={tab?.chartStaticValuesColors || []}
                      initialStaticValuesTicks={
                        tab?.chartStaticValuesTicks || []
                      }
                      initialStaticValuesTexts={
                        tab?.chartStaticValuesTexts || []
                      }
                      handleTabChange={handleTabChange}
                      backgroundColor={backgroundColor}
                      borderColor={borderColor}
                      fontColor={fontColor}
                      type={
                        tab?.componentSubType ===
                          tabComponentSubTypeEnum.barChart ||
                        tab?.componentSubType ===
                          tabComponentSubTypeEnum.barChartDynamic ||
                        tab?.componentSubType ===
                          tabComponentSubTypeEnum.lineChart ||
                        tab?.componentSubType ===
                          tabComponentSubTypeEnum.lineChartDynamic
                          ? 'value'
                          : ''
                      }
                    />
                  </div>
                </div>
              )}
              {(tab?.componentSubType === tabComponentSubTypeEnum.pieChart ||
                tab?.componentSubType ===
                  tabComponentSubTypeEnum.pieChartDynamic) && (
                <div className="flex flex-col w-full pb-2">
                  <div className="flex w-full items-center">
                    <div className="min-w-[200px]">
                      <WizardLabel label="Bilddownload erlauben?" />
                    </div>
                    <WizardSelectBox
                      checked={tab?.chartAllowImageDownload || false}
                      onChange={(value: boolean): void =>
                        handleTabChange({
                          chartAllowImageDownload: value,
                        })
                      }
                      label=" Bilddownload"
                    />
                  </div>

                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Einheit" />
                    <WizardTextfield
                      value={tab?.chartUnit || ''}
                      onChange={(value: string | number): void =>
                        handleTabChange({ chartUnit: value.toString() })
                      }
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>

                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Radius (Wert zwischen 10 und 80)" />
                    <WizardIntegerfield
                      value={tab?.chartPieRadius || '70'}
                      onChange={(value: string | number): void =>
                        handleTabChange({
                          chartPieRadius: value as number,
                        })
                      }
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                </div>
              )}
              {tab?.componentSubType ===
                tabComponentSubTypeEnum.measurement && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Einheit" />
                  <WizardTextfield
                    value={tab?.chartUnit || ''}
                    onChange={(value: string | number): void =>
                      handleTabChange({ chartUnit: value.toString() })
                    }
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                  <WizardLabel label="Warnungslimit" />
                  <WizardTextfield
                    value={
                      tab?.chartStaticValues && tab.chartStaticValues.length > 0
                        ? tab.chartStaticValues[0]
                        : 0
                    }
                    onChange={(value: string | number): void => {
                      const updatedValues = [
                        ...(tab?.chartStaticValues || [0, 0, 0]),
                      ];
                      updatedValues[0] = Number(value);
                      handleTabChange({ chartStaticValues: updatedValues });
                    }}
                    isNumeric={true}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                  <WizardLabel label="Alarmlimit" />
                  <WizardTextfield
                    value={
                      tab?.chartStaticValues && tab.chartStaticValues.length > 1
                        ? tab.chartStaticValues[1]
                        : 0
                    }
                    onChange={(value: string | number): void => {
                      const updatedValues = [
                        ...(tab?.chartStaticValues || [0, 0, 0]),
                      ];
                      updatedValues[1] = Number(value);
                      handleTabChange({ chartStaticValues: updatedValues });
                    }}
                    isNumeric={true}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                  <WizardLabel label="Maximum Werte" />
                  <WizardTextfield
                    value={
                      tab?.chartStaticValues && tab.chartStaticValues.length > 2
                        ? tab.chartStaticValues[2]
                        : 0
                    }
                    onChange={(value: string | number): void => {
                      const updatedValues = [
                        ...(tab?.chartStaticValues || [0, 0, 0]),
                      ];
                      updatedValues[2] = Number(value);
                      handleTabChange({ chartStaticValues: updatedValues });
                    }}
                    isNumeric={true}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}
              {(tab?.componentSubType === tabComponentSubTypeEnum.table ||
                tab?.componentSubType ===
                  tabComponentSubTypeEnum.tableDynamic) && (
                <div>
                  <div className="flex flex-col w-full pb-2 gap-4">
                    <WizardLabel label="" />
                    <TableColorPickerPanel
                      tab={tab}
                      handleTabChange={handleTabChange}
                      fontColor={tableFontColor}
                      headerColor={tableHeaderColor}
                      oddRowColor={tableOddRowColor}
                      evenRowColor={tableEvenRowColor}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {tab?.componentType === tabComponentTypeEnum.slider && (
            <div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Typ" />
                <WizardDropdownSelection
                  currentValue={
                    sliderComponentSubTypes.find(
                      (option) => option.value === tab?.componentSubType,
                    )?.label || ''
                  }
                  selectableValues={sliderComponentSubTypes.map(
                    (option) => option.label,
                  )}
                  onSelect={(label: string | number): void => {
                    const enumValue = sliderComponentSubTypes.find(
                      (option) => option.label === label,
                    )?.value;
                    handleTabChange({ componentSubType: enumValue });
                  }}
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                  error={errors?.tabComponentSubTypeError}
                />
              </div>
              {tab?.componentSubType ===
                tabComponentSubTypeEnum.coloredSlider && (
                <div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Minimum" />
                    <WizardTextfield
                      value={tab?.chartMinimum ?? ''}
                      onChange={(value: string | number): void => {
                        handleTabChange({ chartMinimum: value as number });
                      }}
                      isNumeric={true}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Maximum" />
                    <WizardTextfield
                      value={tab?.chartMaximum ?? ''}
                      onChange={(value: string | number): void => {
                        handleTabChange({ chartMaximum: value as number });
                      }}
                      isNumeric={true}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Einheit" />
                    <WizardTextfield
                      value={tab?.chartUnit || ''}
                      onChange={(value: string | number): void =>
                        handleTabChange({ chartUnit: value.toString() })
                      }
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2 gap-4">
                    <WizardLabel label="Statische Werte" />
                    <StaticValuesFieldRange
                      initialStaticValuesTicks={
                        tab?.chartStaticValuesTicks || []
                      }
                      initialStaticValuesLogos={
                        tab?.chartStaticValuesLogos || []
                      }
                      initialStaticValuesTexts={
                        tab?.chartStaticValuesTexts || []
                      }
                      initialIconColor={tab?.iconColor || '#000000'}
                      initialLabelColor={tab?.labelColor || '#000000'}
                      handleTabChange={handleTabChange}
                      initialRangeStaticValuesMin={
                        tab?.rangeStaticValuesMin || []
                      }
                      initialRangeStaticValuesMax={
                        tab?.rangeStaticValuesMax || []
                      }
                      initialRangeStaticValuesColors={
                        tab?.rangeStaticValuesColors || []
                      }
                      initialRangeStaticValuesLogos={
                        tab?.rangeStaticValuesLogos || []
                      }
                      initialRangeStaticValuesLabels={
                        tab?.rangeStaticValuesLabels || []
                      }
                      error={errors?.stageableColorValueError}
                      borderColor={borderColor}
                      iconColor={iconColor}
                      backgroundColor={backgroundColor}
                      fontColor={fontColor}
                      type="slider"
                    />
                  </div>
                </div>
              )}
              {tab?.componentSubType ===
                tabComponentSubTypeEnum.overviewSlider && (
                <div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Aktuelle Auslastung (Sensorattribut nach Query Konfiguration möglich)" />
                    <WizardDropdownSelection
                      currentValue={tab?.sliderCurrentAttribute || ''}
                      selectableValues={['', ...queryConfig.attributes]}
                      error={errors && errors.sliderCurrentAttributeError}
                      onSelect={(value: string | number): void =>
                        handleTabChange({
                          sliderCurrentAttribute: value.toString(),
                        })
                      }
                      iconColor={iconColor}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>

                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Maximale Auslastung (Sensorattribut nach Query Konfiguration möglich)" />
                    <WizardDropdownSelection
                      currentValue={tab?.sliderMaximumAttribute || ''}
                      selectableValues={['', ...queryConfig.attributes]}
                      error={errors && errors.sliderMaximumAttributeError}
                      onSelect={(value: string | number): void =>
                        handleTabChange({
                          sliderMaximumAttribute: value.toString(),
                        })
                      }
                      iconColor={iconColor}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {tab?.componentType === tabComponentTypeEnum.information && (
            <div className="div">
              <div className="flex flex-col w-full pb-4">
                <WizardLabel label="Typ" />
                <WizardDropdownSelection
                  currentValue={
                    informationComponentSubTypes.find(
                      (option) => option.value === tab?.componentSubType,
                    )?.label || ''
                  }
                  selectableValues={informationComponentSubTypes.map(
                    (option) => option.label,
                  )}
                  onSelect={(label: string | number): void => {
                    const enumValue = informationComponentSubTypes.find(
                      (option) => option.label === label,
                    )?.value;
                    handleTabChange({ componentSubType: enumValue });
                  }}
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                  error={errors?.tabComponentSubTypeError}
                />
              </div>
              {tab?.componentSubType === tabComponentSubTypeEnum.text && (
                <WizardTextfield
                  value={tab?.textValue || ''}
                  onChange={(value: string | number): void =>
                    handleTabChange({ textValue: value.toString() })
                  }
                  componentType={tab?.componentType}
                  subComponentType={tab?.componentSubType}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                  panelFontColor={panelFontColor}
                  panelBorderRadius={panelBorderRadius}
                  panelBorderSize={panelBorderSize}
                />
              )}
              {tab?.componentSubType ===
                tabComponentSubTypeEnum.iconWithLink && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Icon auswählen" />
                  <IconSelection
                    activeIcon={tab?.icon || ''}
                    handleIconSelect={(iconName: string): void =>
                      handleTabChange({ icon: iconName })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                  />
                  <div className="mt-3">
                    <ColorPickerComponent
                      currentColor={tab?.iconColor || '#fff'}
                      handleColorChange={(color: string): void =>
                        handleTabChange({ iconColor: color })
                      }
                      label="Icon Farbe"
                    />
                  </div>
                  <WizardLabel label="Text" />
                  <WizardTextfield
                    value={tab?.iconText || ''}
                    onChange={(value: string | number): void =>
                      handleTabChange({ iconText: value.toString() })
                    }
                    componentType={tabComponentTypeEnum.information}
                    subComponentType={tabComponentSubTypeEnum.text}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Url" />
                    <WizardUrlTextfield
                      value={tab?.iconUrl || 'https://'}
                      onChange={(value: string | number): void =>
                        handleTabChange({ iconUrl: value.toString() })
                      }
                      error={errors && errors.urlError}
                      iconColor={iconColor}
                      borderColor={borderColor}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {tab?.componentType === tabComponentTypeEnum.weatherWarning && (
            <div className="flex flex-col w-full pb-2"></div>
          )}

          {tab?.componentType === tabComponentTypeEnum.value && (
            <div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Einheit" />
                <WizardTextfield
                  value={tab?.chartUnit || ''}
                  onChange={(value: string | number): void =>
                    handleTabChange({ chartUnit: value.toString() })
                  }
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                />
              </div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Dezimalstellen" />
                <WizardIntegerfield
                  value={tab?.decimalPlaces || '0'}
                  onChange={(value: string | number): void =>
                    handleTabChange({
                      decimalPlaces: value as number,
                    })
                  }
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                />
              </div>
              {'Slider'}
              <HorizontalDivider />
              <div className="flex flex-col w-full pb-2 gap-4">
                <WizardLabel label="Optionale Label" />
                <StaticValuesField
                  initialChartStaticValues={tab?.chartStaticValues || []}
                  initialStaticColors={tab?.chartStaticValuesColors || []}
                  initialStaticValuesTicks={tab?.chartStaticValuesTicks || []}
                  initialStaticValuesLogos={tab?.chartStaticValuesLogos || []}
                  initialStaticValuesTexts={tab?.chartStaticValuesTexts || []}
                  handleTabChange={handleTabChange}
                  error={errors?.stageableColorValueError}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                  fontColor={fontColor}
                  type="slider"
                />
              </div>
            </div>
          )}

          {tab?.componentType === tabComponentTypeEnum.map && (
            <div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Karten Typ" />
                <WizardDropdownSelection
                  currentValue={
                    mapComponentSubTypes.find(
                      (option) => option.value === tab?.componentSubType,
                    )?.label || ''
                  }
                  selectableValues={mapComponentSubTypes.map(
                    (option) => option.label,
                  )}
                  onSelect={(label: string | number): void => {
                    const enumValue = mapComponentSubTypes.find(
                      (option) => option.label === label,
                    )?.value;
                    handleTabChange({
                      componentSubType: enumValue,
                    });
                  }}
                  error={errors && errors.mapTypeError}
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                />
              </div>
              {/* settings for Map with subtype other than combined map */}
              {tab.componentType === tabComponentTypeEnum.map &&
                tab.componentSubType !==
                  tabComponentSubTypeEnum.combinedMap && (
                  <>
                    <WizardSelectBox
                      checked={tab?.mapAllowPopups || false}
                      onChange={(value: boolean): void =>
                        handleTabChange({ mapAllowPopups: value })
                      }
                      label="Popups"
                    />
                    <WizardSelectBox
                      checked={tab?.mapAllowScroll || false}
                      onChange={(value: boolean): void =>
                        handleTabChange({ mapAllowScroll: value })
                      }
                      label="Scrollen"
                    />
                    <WizardSelectBox
                      checked={tab?.mapAllowZoom || false}
                      onChange={(value: boolean): void =>
                        handleTabChange({ mapAllowZoom: value })
                      }
                      label="Zoomen"
                    />
                    <WizardSelectBox
                      checked={tab?.mapAllowFilter || false}
                      onChange={(value: boolean): void => {
                        handleTabChange({
                          mapAllowFilter: value,
                          ...(value ? {} : { mapFilterAttribute: '' }), // Clear mapFilterAttribute if mapAllowFilter is false
                        });
                      }}
                      label="Filter"
                    />
                    <WizardSelectBox
                      checked={tab?.mapAllowLegend || false}
                      onChange={(value: boolean): void =>
                        handleTabChange({ mapAllowLegend: value })
                      }
                      label="Legend"
                    />

                    {/* add widget to show in map modal */}
                    {tab.mapAllowPopups && (
                      <>
                        <HorizontalDivider />
                        <div className="flex flex-col w-full pb-2 gap-4">
                          <WizardLabel label="Widgets zur Karte hinzufügen" />
                          <StaticValuesFieldMapWidgets
                            initialMapModalWidgetsValues={tab.mapWidgetValues}
                            handleTabChange={handleTabChange}
                            errors={errors}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                            iconColor={iconColor}
                            hoverColor={hoverColor}
                            queryConfig={queryConfig}
                            accessToken={accessToken}
                          />
                        </div>
                        <HorizontalDivider />
                        <div className="flex flex-col w-full pb-2 gap-4">
                          <WizardLabel label="Einheiten zum Popup hinzufügen" />
                          <UnitsField
                            initialUnitsTexts={tab?.mapUnitsTexts || []}
                            handleTabChange={handleTabChange}
                            error={errors?.stageableColorValueError}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                            fontColor={fontColor}
                          />
                        </div>
                      </>
                    )}
                    {tab.mapAllowFilter && (
                      <>
                        <HorizontalDivider />
                        <div className="flex flex-col w-full pb-2">
                          <WizardLabel label="Filterattribut (nach Query Konfiguration möglich)" />
                          <WizardDropdownSelection
                            currentValue={tab?.mapFilterAttribute || ''}
                            selectableValues={['', ...queryConfig.attributes]}
                            error={errors && errors.mapFilterAttributeError}
                            onSelect={(value: string | number): void =>
                              handleTabChange({
                                mapFilterAttribute: value.toString(),
                              })
                            }
                            iconColor={iconColor}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      </>
                    )}
                    {tab.mapAllowLegend && (
                      <>
                        <HorizontalDivider />
                        <div className="flex flex-col w-full pb-2 gap-4">
                          <div className="flex flex-col w-full">
                            <WizardLabel label="Legendkonfiguration" />
                            <StaticValuesFieldMapLegend
                              handleTabChange={handleTabChange}
                              errors={errors}
                              iconColor={iconColor}
                              borderColor={borderColor}
                              backgroundColor={backgroundColor}
                              initialMapLegendValues={
                                tab?.mapLegendValues || []
                              }
                            />
                          </div>
                          <div className="flex flex-col w-full">
                            <WizardLabel label="Haftungsausschluss" />
                            <WizardTextfield
                              value={tab?.mapLegendDisclaimer || ''}
                              onChange={(value: string | number): void =>
                                handleTabChange({
                                  mapLegendDisclaimer: value.toString(),
                                })
                              }
                              borderColor={borderColor}
                              backgroundColor={backgroundColor}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    <HorizontalDivider />
                    {tab.componentSubType !== tabComponentSubTypeEnum.geoJSON &&
                      tab.componentSubType !==
                        tabComponentSubTypeEnum.geoJSONDynamic && (
                        <div className="flex flex-col w-full pb-2">
                          <WizardLabel label="Anzeigemodus" />
                          <WizardDropdownSelection
                            currentValue={
                              mapDisplayModes.find(
                                (option) =>
                                  option.value === tab?.mapDisplayMode,
                              )?.label || ''
                            }
                            selectableValues={mapDisplayModes.map(
                              (option) => option.label,
                            )}
                            onSelect={(label: string | number): void => {
                              const enumValue = mapDisplayModes.find(
                                (option) => option.label === label,
                              )?.value;
                              handleTabChange({
                                mapDisplayMode: enumValue,
                              });
                            }}
                            error={errors && errors.mapTypeError}
                            iconColor={iconColor}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      )}
                    <div className="w-full pb-2">
                      {(tab.mapDisplayMode ===
                        tabComponentSubTypeEnum.combinedPinAndForm ||
                        tab.mapDisplayMode ===
                          tabComponentSubTypeEnum.onlyFormArea) && (
                        <div className="flex flex-col justify-center items-center gap-4 ">
                          <div className="w-full">
                            <WizardLabel label="Formoptionen" />
                            <WizardDropdownSelection
                              currentValue={
                                mapComponentShapeOptions.find(
                                  (option) =>
                                    option.value === tab?.mapShapeOption,
                                )?.label || ''
                              }
                              selectableValues={mapComponentShapeOptions.map(
                                (option) => option.label,
                              )}
                              onSelect={(label: string | number): void => {
                                const enumValue = mapComponentShapeOptions.find(
                                  (option) => option.label === label,
                                )?.value;
                                handleTabChange({
                                  mapShapeOption: enumValue,
                                });
                              }}
                              error={errors && errors.mapTypeError}
                              iconColor={iconColor}
                              borderColor={borderColor}
                              backgroundColor={backgroundColor}
                            />
                          </div>
                          <div className="w-full">
                            <WizardLabel label="Formgröße (Empfehlung Wert zwischen 1 bis 10)" />
                            <WizardTextfield
                              value={
                                tab.mapFormSizeFactor
                                  ? tab.mapFormSizeFactor
                                  : 1
                              }
                              onChange={function (
                                value: string | number,
                              ): void {
                                handleTabChange({
                                  mapFormSizeFactor: Number(value),
                                });
                              }}
                              borderColor={borderColor}
                              backgroundColor={backgroundColor}
                            />
                          </div>
                          <div className="w-full">
                            <WizardSelectBox
                              checked={tab?.mapIsFormColorValueBased || false}
                              onChange={(value: boolean): void =>
                                handleTabChange({
                                  mapIsFormColorValueBased: value,
                                })
                              }
                              label="Sensorwert abhängige Farbe"
                            />
                            {!tab.mapIsFormColorValueBased && (
                              <ColorPickerComponent
                                currentColor={tab?.mapShapeColor || '#FF0000'}
                                handleColorChange={(color: string): void =>
                                  handleTabChange({ mapShapeColor: color })
                                }
                                label={'Form Farbe'}
                              />
                            )}
                          </div>
                        </div>
                      )}
                      {(tab.mapDisplayMode ===
                        tabComponentSubTypeEnum.combinedPinAndForm ||
                        tab.mapDisplayMode ===
                          tabComponentSubTypeEnum.onlyPin) && (
                        <div className="py-2">
                          <HorizontalDivider />
                          <WizardLabel label="Marker Optionen" />
                          <div className="flex py-2 items-center">
                            <div className="flex flex-row items-center">
                              <WizardSelectBox
                                checked={tab?.mapIsIconColorValueBased || false}
                                onChange={(value: boolean): void =>
                                  handleTabChange({
                                    mapIsIconColorValueBased: value,
                                  })
                                }
                                label="Sensorwert abhängige Farbe / Icon"
                              />
                              {!tab.mapIsIconColorValueBased && (
                                <ColorPickerComponent
                                  currentColor={
                                    tab?.mapMarkerColor || '#224400'
                                  }
                                  handleColorChange={(color: string): void =>
                                    handleTabChange({ mapMarkerColor: color })
                                  }
                                  label={'Grundfarbe'}
                                />
                              )}
                            </div>
                            <ColorPickerComponent
                              currentColor={
                                tab?.mapActiveMarkerColor || '#FF0000'
                              }
                              handleColorChange={(color: string): void =>
                                handleTabChange({ mapActiveMarkerColor: color })
                              }
                              label="Aktive Farbe"
                            />
                          </div>

                          <div className="py-2">
                            <WizardLabel label="Icon Auswahl" />
                            <div className="flex w-full items-center justify-between gap-4 pt-2">
                              <IconSelection
                                activeIcon={tab?.mapMarkerIcon || ''}
                                handleIconSelect={(iconName: string): void =>
                                  handleTabChange({
                                    mapMarkerIcon: iconName,
                                  })
                                }
                                iconColor={iconColor}
                                borderColor={borderColor}
                              />
                              <ColorPickerComponent
                                currentColor={tab?.mapMarkerIconColor || '#FFF'}
                                handleColorChange={(color: string): void =>
                                  handleTabChange({
                                    mapMarkerIconColor: color,
                                  })
                                }
                                label="Icon Farbe"
                              />
                            </div>
                          </div>
                          {(tab.mapIsFormColorValueBased ||
                            tab.mapIsIconColorValueBased) && (
                            <>
                              <HorizontalDivider />
                              <div className="flex flex-col w-full pb-2 gap-4">
                                <WizardLabel label="Einstellungen für Sensor abhängige Farben" />
                                <div className="flex flex-col w-full pb-2">
                                  <WizardLabel label="Sensorattribut (nach Query Konfiguration möglich)" />
                                  <WizardDropdownSelection
                                    currentValue={
                                      tab?.mapAttributeForValueBased || ''
                                    }
                                    selectableValues={[
                                      '',
                                      ...queryConfig.attributes,
                                    ]}
                                    error={
                                      errors && errors.mapFilterAttributeError
                                    }
                                    onSelect={(value: string | number): void =>
                                      handleTabChange({
                                        mapAttributeForValueBased:
                                          value.toString(),
                                      })
                                    }
                                    iconColor={iconColor}
                                    borderColor={borderColor}
                                    backgroundColor={backgroundColor}
                                  />
                                </div>
                                <div className="flex flex-col w-full pb-2">
                                  <WizardSelectBox
                                    checked={
                                      tab?.chartStaticValuesText || false
                                    }
                                    onChange={(value: boolean): void =>
                                      handleTabChange({
                                        chartStaticValuesText: value,
                                      })
                                    }
                                    label="Textwerte"
                                  />
                                </div>
                                <StaticValuesField
                                  initialChartStaticValues={
                                    tab.chartStaticValuesText
                                      ? tab?.chartStaticValuesTexts || []
                                      : tab?.chartStaticValues || []
                                  }
                                  initialStaticColors={
                                    tab?.chartStaticValuesColors || []
                                  }
                                  initialStaticValuesTicks={
                                    tab?.chartStaticValuesTicks || []
                                  }
                                  initialStaticValuesLogos={
                                    tab?.chartStaticValuesLogos || []
                                  }
                                  initialStaticValuesTexts={
                                    tab?.chartStaticValuesTexts || []
                                  }
                                  handleTabChange={handleTabChange}
                                  error={errors?.stageableColorValueError}
                                  borderColor={borderColor}
                                  backgroundColor={backgroundColor}
                                  fontColor={fontColor}
                                  isTextValues={tab.chartStaticValuesText}
                                  type="map"
                                />
                              </div>
                            </>
                          )}
                          <HorizontalDivider />
                          <WizardLabel label="Optionale WMS Einstellungen" />
                          <div className="w-full">
                            <WizardLabel label="WMS Layer URL" />
                            <WizardUrlTextfield
                              value={tab.mapWmsUrl || 'https://'}
                              onChange={function (
                                value: string | number,
                              ): void {
                                handleTabChange({
                                  mapWmsUrl: value.toString(),
                                });
                              }}
                              iconColor={iconColor}
                              borderColor={borderColor}
                            />
                          </div>
                          <div className="w-full">
                            <WizardLabel label="WMS Layer" />
                            <WizardUrlTextfield
                              value={tab.mapWmsLayer || ''}
                              onChange={function (
                                value: string | number,
                              ): void {
                                handleTabChange({
                                  mapWmsLayer: value.toString(),
                                });
                              }}
                              iconColor={iconColor}
                              borderColor={borderColor}
                            />
                          </div>
                        </div>
                      )}
                      {(tab.componentSubType ==
                        tabComponentSubTypeEnum.geoJSON ||
                        tab.componentSubType ==
                          tabComponentSubTypeEnum.geoJSONDynamic) && (
                        <>
                          <div className="flex flex-col justify-center items-center gap-4 ">
                            <div className="w-full">
                              <WizardLabel label="GeoJSON Upload" />
                              {tab.mapGeoJSON && !geoJSONFile && (
                                <WizardLabel label="GeoJSON Daten vorhanden. Zum Ersetzen neue Datei hochladen" />
                              )}
                              <WizardJSONUpload setFile={setGeoJSONFile} />
                            </div>
                          </div>
                          <div className="flex flex-col w-full pb-2">
                            <WizardLabel label="GeoJSON Feature Identfier" />
                            <WizardTextfield
                              value={tab?.mapGeoJSONFeatureIdentifier ?? ''}
                              onChange={(value: string | number): void => {
                                handleTabChange({
                                  mapGeoJSONFeatureIdentifier: value as string,
                                });
                              }}
                              borderColor={borderColor}
                              backgroundColor={backgroundColor}
                            />
                          </div>
                          <div className="flex flex-col w-full pb-2">
                            <div className="w-full">
                              <WizardLabel label="GeoJSON Farben" />
                              <div className="flex flex-row items-center">
                                <WizardSelectBox
                                  checked={
                                    tab?.mapGeoJSONSensorBasedColors || false
                                  }
                                  onChange={(value: boolean): void =>
                                    handleTabChange({
                                      mapGeoJSONSensorBasedColors: value,
                                    })
                                  }
                                  label="Sensorwert abhängige Farbe"
                                />
                                <ColorPickerComponent
                                  currentColor={
                                    tab?.mapGeoJSONBorderColor || '#3388ff'
                                  }
                                  handleColorChange={(color: string): void =>
                                    handleTabChange({
                                      mapGeoJSONBorderColor: color,
                                    })
                                  }
                                  label="Randfarbe"
                                />
                                {!tab.mapGeoJSONSensorBasedColors && (
                                  <ColorPickerComponent
                                    currentColor={
                                      tab?.mapGeoJSONFillColor || '#3388ff'
                                    }
                                    handleColorChange={(color: string): void =>
                                      handleTabChange({
                                        mapGeoJSONFillColor: color,
                                      })
                                    }
                                    label="Füllfarbe"
                                  />
                                )}
                                {tab.mapGeoJSONSensorBasedColors && (
                                  <ColorPickerComponent
                                    currentColor={
                                      tab?.mapGeoJSONSensorBasedNoDataColor ||
                                      '#ff0000'
                                    }
                                    handleColorChange={(color: string): void =>
                                      handleTabChange({
                                        mapGeoJSONSensorBasedNoDataColor: color,
                                      })
                                    }
                                    label="Füllfarbe keine Daten"
                                  />
                                )}
                                <ColorPickerComponent
                                  currentColor={
                                    tab?.mapGeoJSONSelectionBorderColor ||
                                    '#0b63de'
                                  }
                                  handleColorChange={(color: string): void =>
                                    handleTabChange({
                                      mapGeoJSONSelectionBorderColor: color,
                                    })
                                  }
                                  label="Selektion Randfarbe"
                                />
                                {!tab.mapGeoJSONSensorBasedColors && (
                                  <ColorPickerComponent
                                    currentColor={
                                      tab?.mapGeoJSONSelectionFillColor ||
                                      '#0b63de'
                                    }
                                    handleColorChange={(color: string): void =>
                                      handleTabChange({
                                        mapGeoJSONSelectionFillColor: color,
                                      })
                                    }
                                    label="Selektion Füllfarbe"
                                  />
                                )}
                                <ColorPickerComponent
                                  currentColor={
                                    tab?.mapGeoJSONHoverBorderColor || '#0347a6'
                                  }
                                  handleColorChange={(color: string): void =>
                                    handleTabChange({
                                      mapGeoJSONHoverBorderColor: color,
                                    })
                                  }
                                  label="Hover Randfarbe"
                                />
                                {!tab.mapGeoJSONSensorBasedColors && (
                                  <ColorPickerComponent
                                    currentColor={
                                      tab?.mapGeoJSONHoverFillColor || '#0347a6'
                                    }
                                    handleColorChange={(color: string): void =>
                                      handleTabChange({
                                        mapGeoJSONHoverFillColor: color,
                                      })
                                    }
                                    label="Hover Füllfarbe"
                                  />
                                )}
                              </div>
                            </div>
                            {tab.mapGeoJSONSensorBasedColors && (
                              <>
                                <HorizontalDivider />
                                <div className="flex flex-col w-full pb-2 gap-4">
                                  <WizardLabel label="Einstellungen für Sensor abhängige Farben" />
                                  <div className="flex flex-col w-full pb-2">
                                    <WizardLabel label="Sensorattribut (nach Query Konfiguration möglich)" />
                                    <WizardDropdownSelection
                                      currentValue={
                                        tab?.mapAttributeForValueBased || ''
                                      }
                                      selectableValues={queryConfig.attributes}
                                      error={
                                        errors && errors.mapFilterAttributeError
                                      }
                                      onSelect={(
                                        value: string | number,
                                      ): void =>
                                        handleTabChange({
                                          mapAttributeForValueBased:
                                            value.toString(),
                                        })
                                      }
                                      iconColor={iconColor}
                                      borderColor={borderColor}
                                      backgroundColor={backgroundColor}
                                    />
                                  </div>
                                  <StaticValuesField
                                    initialChartStaticValues={
                                      tab?.chartStaticValues || []
                                    }
                                    initialStaticColors={
                                      tab?.chartStaticValuesColors || []
                                    }
                                    initialStaticValuesTicks={
                                      tab?.chartStaticValuesTicks || []
                                    }
                                    initialStaticValuesLogos={
                                      tab?.chartStaticValuesLogos || []
                                    }
                                    initialStaticValuesTexts={
                                      tab?.chartStaticValuesTexts || []
                                    }
                                    handleTabChange={handleTabChange}
                                    error={errors?.stageableColorValueError}
                                    borderColor={borderColor}
                                    backgroundColor={backgroundColor}
                                    fontColor={fontColor}
                                    type="map"
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    <HorizontalDivider />
                    <div className="flex mt-10 w-full pb-2 items-center">
                      <WizardLabel label="Maximaler Zoom" />
                      <WizardTextfield
                        value={maxZoom}
                        onChange={(value: string | number): void => {
                          handleTabChange({ mapMaxZoom: value as number });
                          setMaxZoom(value as number);
                        }}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                      <WizardLabel label="Minimaler Zoom" />
                      <WizardTextfield
                        value={minZoom}
                        onChange={(value: string | number): void => {
                          handleTabChange({ mapMinZoom: value as number });
                          setMinZoom(value as number);
                        }}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                      <WizardLabel label="Standard Zoom" />
                      <WizardTextfield
                        value={standardZoom}
                        onChange={(value: string | number): void => {
                          handleTabChange({ mapStandardZoom: value as number });
                          setStandardZoom(value as number);
                        }}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                    <div className="flex flex-col w-full pb-2">
                      <WizardLabel label="Latitude" />
                      <WizardTextfield
                        value={latitude}
                        onChange={(value: string | number): void => {
                          handleTabChange({
                            mapLatitude: value as number,
                          });
                          setLatitude(value as number);
                        }}
                        isNumeric={true}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                    <div className="flex flex-col w-full pb-2">
                      <WizardLabel label="Longitude" />
                      <WizardTextfield
                        value={longitude}
                        onChange={(value: string | number): void => {
                          handleTabChange({
                            mapLongitude: value as number,
                          });
                          setLongitude(value as number);
                        }}
                        isNumeric={true}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                  </>
                )}
              {tab.componentType === tabComponentTypeEnum.map &&
                tab.componentSubType ===
                  tabComponentSubTypeEnum.combinedMap && (
                  <>
                    <div>
                      <WizardSelectBox
                        checked={tab?.mapAllowPopups || false}
                        onChange={(value: boolean): void =>
                          handleTabChange({ mapAllowPopups: value })
                        }
                        label="Popups"
                      />
                      <WizardSelectBox
                        checked={tab?.mapAllowScroll || false}
                        onChange={(value: boolean): void =>
                          handleTabChange({ mapAllowScroll: value })
                        }
                        label="Scrollen"
                      />
                      <WizardSelectBox
                        checked={tab?.mapAllowZoom || false}
                        onChange={(value: boolean): void =>
                          handleTabChange({ mapAllowZoom: value })
                        }
                        label="Zoomen"
                      />
                    </div>
                    <HorizontalDivider />
                    <WizardLabel label="Optionale WMS Einstellungen" />
                    <div className="w-full">
                      <WizardLabel label="WMS Layer URL" />
                      <WizardUrlTextfield
                        value={tab.mapCombinedWmsUrl || 'https://'}
                        onChange={function (value: string | number): void {
                          handleTabChange({
                            mapCombinedWmsUrl: value.toString(),
                          });
                        }}
                        iconColor={iconColor}
                        borderColor={borderColor}
                      />
                    </div>
                    <div className="w-full">
                      <WizardLabel label="WMS Layer" />
                      <WizardUrlTextfield
                        value={tab.mapCombinedWmsLayer || ''}
                        onChange={function (value: string | number): void {
                          handleTabChange({
                            mapCombinedWmsLayer: value.toString(),
                          });
                        }}
                        iconColor={iconColor}
                        borderColor={borderColor}
                      />
                    </div>
                    <HorizontalDivider />
                    <div className="flex flex-col w-full pt-4">
                      {combinedMapWidgetsId.map((widgetId, index) => (
                        <>
                          <WizardLabel
                            label={`Widget ${index + 1} auswählen`}
                          />
                          <div className="flex flex-row items-center gap-x-4 w-full">
                            <SearchableDropdown
                              value={
                                mapWidgetsArray?.find(
                                  (widget) => widget.id === widgetId,
                                )?.name || ''
                              }
                              onSelect={(selectedName): void =>
                                handleWidgetSelect(selectedName, index)
                              }
                              onClear={(): void => handleWidgetClear(index)}
                              options={
                                mapWidgetsArray?.length
                                  ? mapWidgetsArray
                                      .filter(
                                        (widget) =>
                                          !combinedMapWidgetsId.includes(
                                            widget.id || '',
                                          ) || widget.id === widgetId,
                                      )
                                      .map((widget) => widget.name)
                                  : ['']
                              }
                              backgroundColor={backgroundColor}
                              hoverColor={hoverColor}
                              borderColor={borderColor}
                              error={errors?.combinedMapWidgetError}
                            />
                            <CreateDashboardElementButton
                              label="-"
                              handleClick={(): void =>
                                handleRemoveWidget(index)
                              }
                            />
                          </div>
                        </>
                      ))}
                    </div>

                    <CreateDashboardElementButton
                      label="+ Widget hinzufügen"
                      handleClick={handleAddWidget}
                    />
                  </>
                )}
            </div>
          )}

          {tab?.componentType === tabComponentTypeEnum.iframe && (
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="URL" />
              <WizardTextfield
                value={tab?.iFrameUrl || ''}
                onChange={(value: string | number): void =>
                  handleTabChange({ iFrameUrl: value.toString() })
                }
                error={errors && errors.urlError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          )}

          {tab?.componentType === tabComponentTypeEnum.image && (
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Bild Quelle" />
              <WizardDropdownSelection
                currentValue={imageSource}
                selectableValues={['Datei', 'URL']}
                onSelect={(value): void =>
                  handleImageSourceChange(value.toString())
                }
                iconColor={iconColor}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
              {imageSource === 'URL' && (
                <>
                  <WizardLabel label="Bild URL" />
                  <WizardTextfield
                    value={tab?.imageUrl || ''}
                    onChange={(value: string | number): void =>
                      handleTabChange({ imageUrl: value.toString() })
                    }
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                  <WizardSelectBox
                    label="Automatisch aktualisieren"
                    checked={isImageAutoRefresh}
                    onChange={handleChangeIsImageAutoRefresh}
                  />
                  {isImageAutoRefresh && (
                    <>
                      <WizardLabel label="Aktualisierungsintervall in Sekunden" />
                      <WizardTextfield
                        value={tab?.imageUpdateInterval || 0}
                        onChange={(value: string | number): void => {
                          handleTabChange({
                            imageUpdateInterval: value as number,
                          });
                        }}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </>
                  )}
                </>
              )}
              {imageSource === 'Datei' && (
                <>
                  <WizardLabel label="Bild Datei" />
                  <WizardFileUpload setFile={setFile} />
                </>
              )}
              <WizardSelectBox
                checked={tab?.imageAllowJumpoff || false}
                onChange={(value: boolean): void =>
                  handleTabChange({ imageAllowJumpoff: value })
                }
                label="Jumpoff-Bild aktivieren"
              />
              {tab.imageAllowJumpoff && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Bild Jumpoff-URL" />
                  <WizardUrlTextfield
                    value={tab?.imageJumpoffUrl || 'https://'}
                    onChange={(value: string | number): void =>
                      handleTabChange({ imageJumpoffUrl: value as string })
                    }
                    error={errors && errors.imageJumpoffUrlError}
                    iconColor={iconColor}
                    borderColor={borderColor}
                  />
                </div>
              )}
            </div>
          )}

          {tab?.componentType === tabComponentTypeEnum.listview && (
            <div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Listview Name" />
                <WizardTextfield
                  value={tab?.listviewName || ''}
                  onChange={(value: string | number): void =>
                    handleTabChange({ listviewName: value.toString() })
                  }
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                  error={errors?.listviewNameError}
                />
              </div>

              <HorizontalDivider />

              <WizardSelectBox
                checked={tab?.listviewIsFilteringAllowed || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewIsFilteringAllowed: value,
                    ...(value ? {} : { listviewFilterAttribute: '' }), // Clear filter attribute if filtering is disabled
                  })
                }
                label="Filtern erlauben"
              />

              {tab.listviewIsFilteringAllowed && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Filter Kategorien Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewFilterAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewFilterAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewFilterAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}

              <HorizontalDivider />
              <WizardLabel label="Attribute Konfiguration" />

              <WizardSelectBox
                checked={tab?.listviewShowAddress || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewShowAddress: value,
                    ...(value ? {} : { listviewAddressAttribute: '' }), // Clear attribute if field is disabled
                  })
                }
                label="Adresse anzeigen"
              />

              {tab.listviewShowAddress && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Adresse Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewAddressAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewAddressAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewAddressAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}

              <HorizontalDivider />

              <WizardSelectBox
                checked={tab?.listviewShowContact || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewShowContact: value,
                    ...(value ? {} : { listviewContactAttribute: '' }), // Clear attribute if field is disabled
                  })
                }
                label="Kontakt anzeigen"
              />

              {tab.listviewShowContact && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Kontakt Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewContactAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewContactAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewContactAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}

              <HorizontalDivider />

              <WizardSelectBox
                checked={tab?.listviewShowImage || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewShowImage: value,
                    ...(value ? {} : { listviewImageAttribute: '' }), // Clear attribute if field is disabled
                  })
                }
                label="Bild anzeigen"
              />

              {tab.listviewShowImage && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Bild Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewImageAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewImageAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewImageAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}

              <HorizontalDivider />

              <WizardSelectBox
                checked={tab?.listviewShowCategory || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewShowCategory: value,
                    ...(value ? {} : { listviewCategoryAttribute: '' }), // Clear attribute if field is disabled
                  })
                }
                label="Kategorie anzeigen"
              />

              {tab.listviewShowCategory && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Kategorie Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewCategoryAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewCategoryAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewCategoryAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}

              <HorizontalDivider />

              <WizardSelectBox
                checked={tab?.listviewShowName || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewShowName: value,
                    ...(value ? {} : { listviewNameAttribute: '' }),
                  })
                }
                label="Name Attribut anzeigen"
              />

              {tab.listviewShowName && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Name Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewNameAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewNameAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewNameAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}

              <HorizontalDivider />

              <WizardSelectBox
                checked={tab?.listviewShowContactName || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewShowContactName: value,
                    ...(value ? {} : { listviewContactNameAttribute: '' }),
                  })
                }
                label="Kontakt Name anzeigen"
              />

              {tab.listviewShowContactName && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Kontakt Name Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewContactNameAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewContactNameAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewContactNameAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}

              <HorizontalDivider />

              <WizardSelectBox
                checked={tab?.listviewShowContactPhone || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewShowContactPhone: value,
                    ...(value ? {} : { listviewContactPhoneAttribute: '' }),
                  })
                }
                label="Kontakt Telefonnummer anzeigen"
              />

              {tab.listviewShowContactPhone && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Kontakt Telefonnummer Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewContactPhoneAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewContactPhoneAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewContactPhoneAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}

              <HorizontalDivider />

              <WizardSelectBox
                checked={tab?.listviewShowParticipants || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewShowParticipants: value,
                    ...(value ? {} : { listviewParticipantsAttribute: '' }),
                  })
                }
                label="Teilnehmer anzeigen"
              />

              {tab.listviewShowParticipants && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Teilnehmer Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewParticipantsAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewParticipantsAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewParticipantsAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}

              <HorizontalDivider />

              <WizardSelectBox
                checked={tab?.listviewShowSupporter || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewShowSupporter: value,
                    ...(value ? {} : { listviewSupporterAttribute: '' }),
                  })
                }
                label="Unterstützer anzeigen"
              />

              {tab.listviewShowSupporter && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Unterstützer Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewSupporterAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewSupporterAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewSupporterAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}

              <HorizontalDivider />

              <WizardSelectBox
                checked={tab?.listviewShowEmail || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewShowEmail: value,
                    ...(value ? {} : { listviewEmailAttribute: '' }),
                  })
                }
                label="E-Mail anzeigen"
              />

              {tab.listviewShowEmail && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="E-Mail Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewEmailAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewEmailAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewEmailAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}

              <HorizontalDivider />

              <WizardSelectBox
                checked={tab?.listviewShowWebsite || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewShowWebsite: value,
                    ...(value ? {} : { listviewWebsiteAttribute: '' }),
                  })
                }
                label="Website anzeigen"
              />

              {tab.listviewShowWebsite && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Website Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewWebsiteAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewWebsiteAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewWebsiteAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}

              <HorizontalDivider />

              <WizardSelectBox
                checked={tab?.listviewShowDescription || false}
                onChange={(value: boolean): void =>
                  handleTabChange({
                    listviewShowDescription: value,
                    ...(value ? {} : { listviewDescriptionAttribute: '' }),
                  })
                }
                label="Beschreibung anzeigen"
              />

              {tab.listviewShowDescription && (
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Beschreibung Attribut (nach Query Konfiguration möglich)" />
                  <WizardDropdownSelection
                    currentValue={tab?.listviewDescriptionAttribute || ''}
                    selectableValues={['', ...queryConfig.attributes]}
                    error={errors?.listviewDescriptionAttributeError}
                    onSelect={(value: string | number): void =>
                      handleTabChange({
                        listviewDescriptionAttribute: value.toString(),
                      })
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}
            </div>
          )}

          {tab?.componentType === tabComponentTypeEnum.combinedComponent && (
            <div>
              <div className="flex flex-col w-full">
                {selectedWidgets.map((widgetId, index) => (
                  <>
                    <WizardLabel
                      label={`Widget für Position ${index + 1} auswählen`}
                    />
                    <div
                      className="flex flex-row items-center w-full gap-4"
                      key={index}
                    >
                      <SearchableDropdown
                        value={
                          allWidgets?.find((widget) => widget.id === widgetId)
                            ?.name || ''
                        }
                        onSelect={(selectedName): void => {
                          const selectedWidget = allWidgets?.find(
                            (widget) => widget.name === selectedName,
                          );
                          updateWidget(index, selectedWidget?.id || '');
                        }}
                        onClear={(): void => updateWidget(index, '')}
                        options={
                          allWidgets?.length
                            ? allWidgets
                                .filter(
                                  (widget) =>
                                    !selectedWidgets.includes(
                                      widget.id || '',
                                    ) || widget.id === widgetId,
                                )
                                .map((widget) => widget.name)
                            : ['']
                        }
                        backgroundColor={backgroundColor}
                        hoverColor={hoverColor}
                        borderColor={borderColor}
                        error={
                          index === 0
                            ? errors?.combinedTopWidgetError
                            : index === 1
                              ? errors?.combinedBottomWidgetError
                              : undefined
                        }
                      />
                      <CreateDashboardElementButton
                        label="-"
                        handleClick={(): void => removeWidget(index)}
                      />
                    </div>
                  </>
                ))}
                <CreateDashboardElementButton
                  label="+ Widget hinzufügen"
                  handleClick={addWidget}
                />
              </div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Layout" />
                <WizardDropdownSelection
                  currentValue={
                    (tab?.isLayoutVertical ?? false)
                      ? combinedComponentLayoutEnum.Vertical
                      : combinedComponentLayoutEnum.Horizontal
                  }
                  selectableValues={Object.values(combinedComponentLayoutEnum)}
                  onSelect={(value): void => {
                    handleTabChange({
                      isLayoutVertical:
                        value === combinedComponentLayoutEnum.Vertical
                          ? true
                          : false,
                    });
                  }}
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                />
              </div>
            </div>
          )}
          {tab?.componentType === tabComponentTypeEnum.sensorStatus && (
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Anzahl der Anzeigen" />
              <WizardDropdownSelection
                currentValue={tab?.sensorStatusLightCount ?? 0}
                selectableValues={[2, 3]}
                error={errors?.listviewContactPhoneAttributeError}
                onSelect={(value: string | number): void =>
                  handleTabChange({
                    sensorStatusLightCount: value as number,
                  })
                }
                iconColor={iconColor}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />

              <div className="flex w-full pb-2">
                <div
                  className={`flex flex-col w-full ${tab?.sensorStatusLightCount == 3 ? 'pr-2' : ''}`}
                >
                  <WizardLabel label="Bedingung 1" />
                  <WizardTextfield
                    value={tab?.sensorStatusMinThreshold ?? 0}
                    onChange={(value: string | number): void =>
                      handleTabChange({
                        sensorStatusMinThreshold: value.toString(),
                      })
                    }
                    isNumeric={false}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
                {tab?.sensorStatusLightCount == 3 && (
                  <div className="flex flex-col w-full pl-2">
                    <WizardLabel label="Bedingung 2" />
                    <WizardTextfield
                      value={tab?.sensorStatusMaxThreshold ?? 0}
                      onChange={(value: string | number): void =>
                        handleTabChange({
                          sensorStatusMaxThreshold: value.toString(),
                        })
                      }
                      isNumeric={false}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                )}
              </div>

              <div className="flex w-full pb-2">
                <div
                  className={`flex flex-row w-full ${tab?.sensorStatusLightCount == 3 ? 'pr-2' : ''}`}
                  style={{ justifyContent: 'space-between' }}
                >
                  <ColorPickerComponent
                    currentColor={tab?.sensorStatusDefaultColor || '#808080'}
                    handleColorChange={(color: string): void =>
                      handleTabChange({
                        sensorStatusDefaultColor: color,
                      })
                    }
                    label="Default Farbe"
                  />
                  <ColorPickerComponent
                    currentColor={tab?.sensorStatusColor1 || '#FF0000'}
                    handleColorChange={(color: string): void =>
                      handleTabChange({
                        sensorStatusColor1: color,
                      })
                    }
                    label="Farbe 1"
                  />
                  <ColorPickerComponent
                    currentColor={
                      tab?.sensorStatusColor2 ||
                      ((tab?.sensorStatusLightCount ?? 2) == 2
                        ? '#00FF00'
                        : '#FFFF00')
                    }
                    handleColorChange={(color: string): void =>
                      handleTabChange({
                        sensorStatusColor2: color,
                      })
                    }
                    label="Farbe 2"
                  />
                  {tab?.sensorStatusLightCount == 3 && (
                    <ColorPickerComponent
                      currentColor={tab?.sensorStatusColor3 || '#00FF00'}
                      handleColorChange={(color: string): void =>
                        handleTabChange({
                          sensorStatusColor3: color,
                        })
                      }
                      label="Farbe 3"
                    />
                  )}
                </div>
              </div>

              <WizardLabel label="Layout" />
              <WizardDropdownSelection
                currentValue={
                  (tab?.sensorStatusLayoutVertical ?? false)
                    ? componentLayoutEnum.Vertical
                    : componentLayoutEnum.Horizontal
                }
                selectableValues={Object.values(componentLayoutEnum)}
                onSelect={(value): void =>
                  handleTabChange({
                    sensorStatusLayoutVertical:
                      value === componentLayoutEnum.Vertical ? true : false,
                  })
                }
                iconColor={iconColor}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          )}
          {tab?.componentType === tabComponentTypeEnum.interactiveComponent && (
            <div className="div">
              <div className="flex flex-col w-full pb-4">
                <WizardLabel label="Typ" />
                <WizardDropdownSelection
                  currentValue={
                    interactiveComponentSubTypes.find(
                      (option) => option.value === tab?.componentSubType,
                    )?.label || ''
                  }
                  selectableValues={interactiveComponentSubTypes.map(
                    (option) => option.label,
                  )}
                  onSelect={(label: string | number): void => {
                    const enumValue = interactiveComponentSubTypes.find(
                      (option) => option.label === label,
                    )?.value;
                    handleTabChange({ componentSubType: enumValue });
                  }}
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                  error={errors?.tabComponentSubTypeError}
                />
              </div>
              {tab?.componentSubType ===
                tabComponentSubTypeEnum.chartDateSelector && (
                <div className="flex flex-col w-full pb-2"></div>
              )}
            </div>
          )}

          {tab?.componentType === tabComponentTypeEnum.valueToImage && (
            <div className="div">
              <div className="flex flex-col w-full pb-4">
                <ValuesToImageFields
                  initialValues={tab.valuesToImages || []}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                  handleTabChange={handleTabChange}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
