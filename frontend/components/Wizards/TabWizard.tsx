'use client';

import { ReactElement, useEffect, useState } from 'react';

import WizardLabel from '@/ui/WizardLabel';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import { Tab, tabComponentTypeEnum, tabComponentSubTypeEnum } from '@/types';
import WizardSelectBox from '@/ui/WizardSelectBox';
import PieChart from '@/ui/Charts/PieChart';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import StaticValuesField from '@/ui/StaticValuesFields';
import IconSelection from '@/ui/Icons/IconSelection';
import WizardFileUpload from '@/ui/WizardFileUpload';
import CollapseButton from '@/ui/Buttons/CollapseButton';
import { WizardErrors } from '@/types/errors';
import {
  chartComponentSubTypes,
  mapDisplayModes,
  mapComponentShapeOptions,
  mapComponentSubTypes,
  informationComponentSubTypes,
  sliderComponentSubTypes,
} from '@/utils/enumMapper';
import WizardUrlTextfield from '@/ui/WizardUrlTextfield';
import HorizontalDivider from '@/ui/HorizontalDivider';
import StaticValuesFieldMapWidgets from '@/ui/StaticValuesFieldsMapWidgets';
import WizardTextfield from '@/ui/WizardTextfield';
import StaticValuesFieldMapLegend from '@/ui/StaticValuesFieldsMapLegend';

type TabWizardProps = {
  tab: Tab | undefined;
  setTab: (update: (prevTab: Tab | undefined) => Partial<Tab>) => void;
  errors?: WizardErrors;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
};

export default function TabWizard(props: TabWizardProps): ReactElement {
  const { tab, setTab, errors, iconColor, borderColor, backgroundColor } =
    props;

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

  const handleTabChange = (update: Partial<Tab>): void => {
    setTab((prevTab) => ({ ...prevTab, ...update }));
  };

  const [imageSource, setImageSource] = useState('URL');

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
                />
              </div>
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
                  <div className="flex flex-col w-full pb-2 gap-4">
                    <WizardLabel label="Statische Werte" />
                    <StaticValuesField
                      initialChartStaticValues={tab?.chartStaticValues || []}
                      initialStaticColors={tab?.chartStaticValuesColors || []}
                      handleTabChange={handleTabChange}
                      error={errors?.stageableColorValueError}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                </div>
              )}
              {(tab?.componentSubType === tabComponentSubTypeEnum.lineChart ||
                tab?.componentSubType === tabComponentSubTypeEnum.barChart) && (
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
                  <div className="flex w-full gap-3">
                    <WizardLabel label="Legende anzeigen?" />
                    <WizardSelectBox
                      checked={tab?.showLegend || false}
                      onChange={(value: boolean): void =>
                        handleTabChange({ showLegend: value })
                      }
                      label=" Legende"
                    />
                  </div>
                  <div className="flex w-full  gap-4">
                    <WizardLabel label="Zoomen Erlauben?" />
                    <WizardSelectBox
                      checked={tab?.mapAllowZoom || false}
                      onChange={(value: boolean): void =>
                        handleTabChange({ mapAllowZoom: value })
                      }
                      label=" Zoom"
                    />
                  </div>
                  <div className="flex w-full pb-2">
                    <WizardLabel label="Stufenlinie anzeigen?" />
                    <WizardSelectBox
                      checked={tab?.isStepline || false}
                      onChange={(value: boolean): void =>
                        handleTabChange({ isStepline: value })
                      }
                      label=" Stufenlinie"
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2 gap-4">
                    <WizardLabel label="Statische Werte" />
                    <StaticValuesField
                      initialChartStaticValues={tab?.chartStaticValues || []}
                      initialStaticColors={tab?.chartStaticValuesColors || []}
                      handleTabChange={handleTabChange}
                      backgroundColor={backgroundColor}
                      borderColor={borderColor}
                    />
                  </div>
                </div>
              )}
              {tab?.componentSubType === tabComponentSubTypeEnum.pieChart && (
                <PieChart
                  labels={tab?.chartLabels || []}
                  data={tab?.chartValues || []}
                />
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
                />
              </div>
              {tab?.componentSubType === 'Farbiger Slider' && (
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
                      initialIconColor={tab?.iconColor || '#000000'}
                      initialLabelColor={tab?.labelColor || '#000000'}
                      handleTabChange={handleTabChange}
                      error={errors?.stageableColorValueError}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                      type="slider"
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
                  <ColorPickerComponent
                    currentColor={tab?.iconColor || '#fff'}
                    handleColorChange={(color: string): void =>
                      handleTabChange({ iconColor: color })
                    }
                    label="Icon Farbe"
                  />
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
                <WizardTextfield
                  value={tab?.decimalPlaces || ''}
                  onChange={(value: string | number): void =>
                    handleTabChange({
                      decimalPlaces: value as number,
                    })
                  }
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
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
                onChange={(value: boolean): void =>
                  handleTabChange({ mapAllowFilter: value })
                }
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
                      handleTabChange={handleTabChange}
                      errors={errors}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                      initialMapModalWidgetsValues={tab?.mapWidgetValues || []}
                    />
                  </div>
                </>
              )}
              {tab.mapAllowFilter && (
                <>
                  <HorizontalDivider />
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Filterattribut" />
                    <WizardDropdownSelection
                      currentValue={tab?.mapFilterAttribute || ''}
                      selectableValues={[]}
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
                        initialMapLegendValues={tab?.mapLegendValues || []}
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
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Anzeigemodus" />
                <WizardDropdownSelection
                  currentValue={
                    mapDisplayModes.find(
                      (option) => option.value === tab?.mapDisplayMode,
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
              <div className="w-full pb-2">
                {(tab.mapDisplayMode ===
                  tabComponentSubTypeEnum.combinedPinAndForm ||
                  tab.mapDisplayMode ===
                    tabComponentSubTypeEnum.onlyFormArea) && (
                  <div>
                    <WizardLabel label="Formoptionen" />
                    <div className="flex flex-row justify-center items-center gap-4">
                      <div className="flex-grow">
                        <WizardDropdownSelection
                          currentValue={
                            mapComponentShapeOptions.find(
                              (option) => option.value === tab?.mapShapeOption,
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
                      <ColorPickerComponent
                        currentColor={tab?.mapShapeColor || '#FF0000'}
                        handleColorChange={(color: string): void =>
                          handleTabChange({ mapShapeColor: color })
                        }
                        label={'Form Farbe'}
                      />
                    </div>
                  </div>
                )}
                {(tab.mapDisplayMode ===
                  tabComponentSubTypeEnum.combinedPinAndForm ||
                  tab.mapDisplayMode === tabComponentSubTypeEnum.onlyPin) && (
                  <div className="py-2">
                    <HorizontalDivider />
                    <WizardLabel label="Marker Optionen" />
                    <div className="flex items-end">
                      <ColorPickerComponent
                        currentColor={tab?.mapMarkerColor || '#257dc9'}
                        handleColorChange={(color: string): void =>
                          handleTabChange({ mapMarkerColor: color })
                        }
                        label="Grundfarbe"
                      />
                      <ColorPickerComponent
                        currentColor={tab?.mapActiveMarkerColor || '#FF0000'}
                        handleColorChange={(color: string): void =>
                          handleTabChange({ mapActiveMarkerColor: color })
                        }
                        label="Aktive Farbe"
                      />
                    </div>

                    <div className="py-2">
                      <WizardLabel label="Icon Auswahl" />
                      <div className="flex w-full items-center justify-between gap-4">
                        <IconSelection
                          activeIcon={tab?.mapMarkerIcon || ''}
                          handleIconSelect={(iconName: string): void =>
                            handleTabChange({ mapMarkerIcon: iconName })
                          }
                          iconColor={iconColor}
                          borderColor={borderColor}
                        />
                        <ColorPickerComponent
                          currentColor={tab?.mapMarkerIconColor || '#FFF'}
                          handleColorChange={(color: string): void =>
                            handleTabChange({ mapMarkerIconColor: color })
                          }
                          label="Icon Farbe"
                        />
                      </div>
                    </div>
                  </div>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
