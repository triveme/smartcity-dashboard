import React, { JSX, useState } from 'react';
import WizardLabel from '@/ui/WizardLabel';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import { tabComponentSubTypeEnum, tabComponentTypeEnum } from '@/types/enums';
import CIDashboardWidgetPreview from '../Previews/CIDashboardWidgetPreview';
import WizardTextfield from '@/ui/WizardTextfield';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import HorizontalDivider from '@/ui/HorizontalDivider';
import MultipleColorPicker from '@/ui/MultipleColorPickers';

type Props = {
  // Information
  informationTextFontSize: string;
  setInformationTextFontSize: (size: string) => void;
  informationTextFontColor: string;
  setInformationTextFontColor: (color: string) => void;
  iconWithLinkFontSize: string;
  setIconWithLinkFontSize: (size: string) => void;
  iconWithLinkFontColor: string;
  setIconWithLinkFontColor: (color: string) => void;
  iconWithLinkIconSize: string;
  setIconWithLinkIconSize: (size: string) => void;
  iconWithLinkIconColor: string;
  setIconWithLinkIconColor: (color: string) => void;
  // 180 and 360 Chart
  degreeChart180FontSize: string;
  setDegreeChart180FontSize: (size: string) => void;
  degreeChart180FontColor: string;
  setDegreeChart180FontColor: (color: string) => void;
  degreeChart180BgColor: string;
  setDegreeChart180BgColor: (color: string) => void;
  degreeChart180FillColor: string;
  setDegreeChart180FillColor: (color: string) => void;
  degreeChart180UnitFontSize: string;
  setDegreeChart180UnitFontSize: (color: string) => void;
  degreeChart360FontSize: string;
  setDegreeChart360FontSize: (size: string) => void;
  degreeChart360FontColor: string;
  setDegreeChart360FontColor: (color: string) => void;
  degreeChart360BgColor: string;
  setDegreeChart360BgColor: (color: string) => void;
  degreeChart360FillColor: string;
  setDegreeChart360FillColor: (color: string) => void;
  degreeChart360UnitFontSize: string;
  setDegreeChart360UnitFontSize: (color: string) => void;
  // Stageable Chart
  stageableChartTicksFontSize: string;
  setStageableChartTicksFontSize: (size: string) => void;
  stageableChartTicksFontColor: string;
  setStageableChartTicksFontColor: (color: string) => void;
  stageableChartFontSize: string;
  setStageableChartFontSize: (size: string) => void;
  stageableChartFontColor: string;
  setStageableChartFontColor: (color: string) => void;
  // Pie Chart
  pieChartFontSize: string;
  setPieChartFontSize: (size: string) => void;
  pieChartFontColor: string;
  setPieChartFontColor: (color: string) => void;
  pieChartCurrentValuesColors: string[];
  setPieChartCurrentValuesColors: (allColors: string[]) => void;
  // Line Chart
  lineChartAxisTicksFontSize: string;
  setLineChartAxisTicksFontSize: (size: string) => void;
  lineChartAxisLabelSize: string;
  setLineChartAxisLabelSize: (size: string) => void;
  lineChartAxisLabelFontColor: string;
  setLineChartAxisLabelFontColor: (color: string) => void;
  lineChartFilterColor: string;
  setLineChartFilterColor: (size: string) => void;
  lineChartFilterTextColor: string;
  setLineChartFilterTextColor: (size: string) => void;
  lineChartLegendFontSize: string;
  setLineChartLegendFontSize: (size: string) => void;
  lineChartLegendFontColor: string;
  setLineChartLegendFontColor: (size: string) => void;
  lineChartTicksFontColor: string;
  setLineChartTicksFontColor: (color: string) => void;
  lineChartAxisLineColor: string;
  setLineChartAxisLineColor: (color: string) => void;
  lineChartCurrentValuesColors: string[];
  setLineChartCurrentValuesColors: (allColor: string[]) => void;
  lineChartGridColor: string;
  setLineChartGridColor: (color: string) => void;
  // Bar Chart
  barChartAxisTicksFontSize: string;
  setBarChartAxisTicksFontSize: (size: string) => void;
  barChartAxisLabelSize: string;
  setBarChartAxisLabelSize: (size: string) => void;
  barChartAxisLabelFontColor: string;
  setBarChartAxisLabelFontColor: (size: string) => void;
  barChartFilterColor: string;
  setBarChartFilterColor: (size: string) => void;
  barChartFilterTextColor: string;
  setBarChartFilterTextColor: (size: string) => void;
  barChartLegendFontSize: string;
  setBarChartLegendFontSize: (size: string) => void;
  barChartLegendFontColor: string;
  setBarChartLegendFontColor: (size: string) => void;
  barChartTicksFontColor: string;
  setBarChartTicksFontColor: (color: string) => void;
  barChartAxisLineColor: string;
  setBarChartAxisLineColor: (color: string) => void;
  barChartCurrentValuesColors: string[];
  setBarChartCurrentValuesColors: (allColor: string[]) => void;
  barChartGridColor: string;
  setBarChartGridColor: (color: string) => void;
  // MeasurementChart
  measurementChartBigValueFontSize: string;
  setMeasurementChartBigValueFontSize: (size: string) => void;
  measurementChartBigValueFontColor: string;
  setMeasurementChartBigValueFontColor: (color: string) => void;
  measurementChartTopButtonBgColor: string;
  setMeasurementChartTopButtonBgColor: (color: string) => void;
  measurementChartTopButtonInactiveBgColor: string;
  setMeasurementChartTopButtonInactiveBgColor: (color: string) => void;
  measurementChartTopButtonhHeaderSecondaryColor: string;
  measurementChartTopButtonHoverColor: string;
  setMeasurementChartTopButtonHoverColor: (color: string) => void;
  measurementChartTopButtonFontColor: string;
  setMeasurementChartTopButtonFontColor: (color: string) => void;
  measurementChartCardsBgColor: string;
  setMeasurementChartCardsBgColor: (color: string) => void;
  measurementChartCardsFontColor: string;
  setMeasurementChartCardsFontColor: (color: string) => void;
  measurementChartCardsIconColors: string[];
  setMeasurementChartCardsIconColors: (allColor: string[]) => void;
  measurementChartBarColor: string;
  setMeasurementChartBarColor: (color: string) => void;
  measurementChartLabelFontColor: string;
  setMeasurementChartLabelFontColor: (color: string) => void;
  measurementChartGridColor: string;
  setMeasurementChartGridColor: (color: string) => void;
  measurementChartAxisLineColor: string;
  setMeasurementChartAxisLineColor: (color: string) => void;
  measurementChartAxisTicksFontColor: string;
  setMeasurementChartAxisTicksFontColor: (color: string) => void;
  measurementChartAxisLabelFontColor: string;
  setMeasurementChartAxisLabelFontColor: (color: string) => void;
  measurementChartCurrentValuesColors: string[];
  setMeasurementChartCurrentValuesColors: (allColor: string[]) => void;
  // Slider
  coloredSliderBigValueFontSize: string;
  setColoredSliderBigValueFontSize: (size: string) => void;
  coloredSliderBigValueFontColor: string;
  setColoredSliderBigValueFontColor: (color: string) => void;
  coloredSliderLabelFontSize: string;
  setColoredSliderLabelFontSize: (size: string) => void;
  coloredSliderLabelFontColor: string;
  setColoredSliderLabelFontColor: (color: string) => void;
  coloredSliderArrowColor: string;
  setColoredSliderArrowColor: (color: string) => void;
  coloredSliderUnitFontSize: string;
  setColoredSliderUnitFontSize: (size: string) => void;

  // Slider Overview
  sliderCurrentFontColor: string;
  setSliderCurrentFontColor: (color: string) => void;
  sliderMaximumFontColor: string;
  setSliderMaximumFontColor: (color: string) => void;
  sliderGeneralFontColor: string;
  setSliderGeneralFontColor: (color: string) => void;
  sliderCurrentColor: string;
  setSliderCurrentColor: (color: string) => void;
  sliderMaximumColor: string;
  setsliderMaximumColor: (color: string) => void;

  // Values
  wertFontSize: string;
  setWertFontSize: (size: string) => void;
  wertUnitFontSize: string;
  setWertUnitFontSize: (size: string) => void;
  wertFontColor: string;
  setWertFontColor: (color: string) => void;

  //WeatherWarning
  weatherWarningBgColor: string;
  setWeatherWarningBgColor: (color: string) => void;
  weatherWarningHeadlineColor: string;
  setWeatherWarningHeadlineColor: (color: string) => void;
  weatherInstructionsColor: string;
  setWeatherInstructionsColor: (color: string) => void;
  weatherAlertDescriptionColor: string;
  setWeatherAlertDescriptionColor: (color: string) => void;
  weatherDateColor: string;
  setWeatherDateColor: (color: string) => void;
  weatherWarningButtonBackgroundColor: string;
  setWeatherWarningButtonBackgroundColor: (color: string) => void;
  weatherWarningButtonIconColor: string;
  setWeatherWarningButtonIconColor: (color: string) => void;

  // ListView
  listviewBackgroundColor: string;
  setListviewBackgroundColor: (color: string) => void;
  listviewItemBackgroundColor: string;
  setListviewItemBackgroundColor: (color: string) => void;
  listviewItemBorderColor: string;
  setListviewItemBorderColor: (color: string) => void;
  listviewItemBorderRadius: string;
  setListviewItemBorderRadius: (value: string) => void;
  listviewItemBorderSize: string;
  setListviewItemBorderSize: (value: string) => void;
  listviewTitleFontColor: string;
  setListviewTitleFontColor: (color: string) => void;
  listviewTitleFontSize: string;
  setListviewTitleFontSize: (size: string) => void;
  listviewTitleFontWeight: string;
  setListviewTitleFontWeight: (weight: string) => void;
  listviewDescriptionFontColor: string;
  setListviewDescriptionFontColor: (color: string) => void;
  listviewDescriptionFontSize: string;
  setListviewDescriptionFontSize: (size: string) => void;
  listviewCounterFontColor: string;
  setListviewCounterFontColor: (color: string) => void;
  listviewCounterFontSize: string;
  setListviewCounterFontSize: (size: string) => void;
  listviewFilterButtonBackgroundColor: string;
  setListviewFilterButtonBackgroundColor: (color: string) => void;
  listviewFilterButtonBorderColor: string;
  setListviewFilterButtonBorderColor: (color: string) => void;
  listviewFilterButtonFontColor: string;
  setListviewFilterButtonFontColor: (color: string) => void;
  listviewFilterButtonHoverBackgroundColor: string;
  setListviewFilterButtonHoverBackgroundColor: (color: string) => void;
  listviewArrowIconColor: string;
  setListviewArrowIconColor: (color: string) => void;
  listviewBackButtonBackgroundColor: string;
  setListviewBackButtonBackgroundColor: (color: string) => void;
  listviewBackButtonHoverBackgroundColor: string;
  setListviewBackButtonHoverBackgroundColor: (color: string) => void;
  listviewBackButtonFontColor: string;
  setListviewBackButtonFontColor: (color: string) => void;
  listviewMapButtonBackgroundColor: string;
  setListviewMapButtonBackgroundColor: (color: string) => void;
  listviewMapButtonHoverBackgroundColor: string;
  setListviewMapButtonHoverBackgroundColor: (color: string) => void;
  listviewMapButtonFontColor: string;
  setListviewMapButtonFontColor: (color: string) => void;

  iconColor: string;
  borderColor: string;
  backgroundColor: string;
};

export default function ComponentsCiWizard({
  // Information
  informationTextFontSize,
  informationTextFontColor,
  iconWithLinkFontSize,
  setIconWithLinkFontSize,
  iconWithLinkFontColor,
  setIconWithLinkFontColor,
  iconWithLinkIconSize,
  setIconWithLinkIconSize,
  iconWithLinkIconColor,
  setIconWithLinkIconColor,

  // 180 and 360 Chart
  degreeChart180FontSize,
  setDegreeChart180FontSize,
  degreeChart180FontColor,
  setDegreeChart180FontColor,
  degreeChart180BgColor,
  setDegreeChart180BgColor,
  degreeChart180FillColor,
  setDegreeChart180FillColor,
  degreeChart180UnitFontSize,
  setDegreeChart180UnitFontSize,
  degreeChart360FontSize,
  setDegreeChart360FontSize,
  degreeChart360FontColor,
  setDegreeChart360FontColor,
  degreeChart360BgColor,
  setDegreeChart360BgColor,
  degreeChart360FillColor,
  setDegreeChart360FillColor,
  degreeChart360UnitFontSize,
  setDegreeChart360UnitFontSize,

  // Stageable Chart
  stageableChartTicksFontSize,
  setStageableChartTicksFontSize,
  stageableChartTicksFontColor,
  setStageableChartTicksFontColor,
  stageableChartFontSize,
  setStageableChartFontSize,
  stageableChartFontColor,
  setStageableChartFontColor,

  // Pie Chart
  pieChartFontSize,
  setPieChartFontSize,
  pieChartFontColor,
  setPieChartFontColor,
  pieChartCurrentValuesColors,
  setPieChartCurrentValuesColors,

  // Line Chart
  lineChartAxisTicksFontSize,
  setLineChartAxisTicksFontSize,
  lineChartAxisLabelSize,
  setLineChartAxisLabelSize,
  lineChartAxisLabelFontColor,
  setLineChartAxisLabelFontColor,
  lineChartFilterColor,
  setLineChartFilterColor,
  lineChartFilterTextColor,
  setLineChartFilterTextColor,
  lineChartLegendFontSize,
  setLineChartLegendFontSize,
  lineChartLegendFontColor,
  setLineChartLegendFontColor,
  lineChartTicksFontColor,
  setLineChartTicksFontColor,
  lineChartAxisLineColor,
  setLineChartAxisLineColor,
  lineChartGridColor,
  setLineChartGridColor,
  lineChartCurrentValuesColors,
  setLineChartCurrentValuesColors,

  // Bar Chart
  barChartAxisTicksFontSize,
  setBarChartAxisTicksFontSize,
  barChartAxisLabelSize,
  setBarChartAxisLabelSize,
  barChartAxisLabelFontColor,
  setBarChartAxisLabelFontColor,
  barChartFilterColor,
  setBarChartFilterColor,
  barChartFilterTextColor,
  setBarChartFilterTextColor,
  barChartLegendFontSize,
  setBarChartLegendFontSize,
  barChartLegendFontColor,
  setBarChartLegendFontColor,
  barChartTicksFontColor,
  setBarChartTicksFontColor,
  barChartAxisLineColor,
  setBarChartAxisLineColor,
  barChartGridColor,
  setBarChartGridColor,
  barChartCurrentValuesColors,
  setBarChartCurrentValuesColors,

  // Measurement Chart
  measurementChartBigValueFontSize,
  setMeasurementChartBigValueFontSize,
  measurementChartBigValueFontColor,
  setMeasurementChartBigValueFontColor,
  measurementChartTopButtonBgColor,
  setMeasurementChartTopButtonBgColor,
  measurementChartTopButtonInactiveBgColor,
  setMeasurementChartTopButtonInactiveBgColor,
  measurementChartTopButtonhHeaderSecondaryColor,
  measurementChartTopButtonHoverColor,
  setMeasurementChartTopButtonHoverColor,
  measurementChartTopButtonFontColor,
  setMeasurementChartTopButtonFontColor,
  measurementChartCardsBgColor,
  setMeasurementChartCardsBgColor,
  measurementChartCardsFontColor,
  setMeasurementChartCardsFontColor,
  measurementChartCardsIconColors,
  setMeasurementChartCardsIconColors,
  measurementChartBarColor,
  setMeasurementChartBarColor,
  measurementChartLabelFontColor,
  setMeasurementChartLabelFontColor,
  measurementChartGridColor,
  setMeasurementChartGridColor,
  measurementChartAxisLineColor,
  setMeasurementChartAxisLineColor,
  measurementChartAxisTicksFontColor,
  setMeasurementChartAxisTicksFontColor,
  measurementChartAxisLabelFontColor,
  setMeasurementChartAxisLabelFontColor,
  measurementChartCurrentValuesColors,
  setMeasurementChartCurrentValuesColors,

  // Slider
  coloredSliderBigValueFontSize,
  setColoredSliderBigValueFontSize,
  coloredSliderBigValueFontColor,
  setColoredSliderBigValueFontColor,
  coloredSliderLabelFontSize,
  setColoredSliderLabelFontSize,
  coloredSliderLabelFontColor,
  setColoredSliderLabelFontColor,
  coloredSliderArrowColor,
  setColoredSliderArrowColor,
  coloredSliderUnitFontSize,
  setColoredSliderUnitFontSize,

  // Slider Overview
  sliderCurrentFontColor,
  setSliderCurrentFontColor,
  sliderMaximumFontColor,
  setSliderMaximumFontColor,
  sliderGeneralFontColor,
  setSliderGeneralFontColor,
  sliderCurrentColor,
  setSliderCurrentColor,
  sliderMaximumColor,
  setsliderMaximumColor,

  // Values
  wertFontSize,
  setWertFontSize,
  wertUnitFontSize,
  setWertUnitFontSize,
  wertFontColor,
  setWertFontColor,

  //Weather Warning
  weatherWarningBgColor,
  setWeatherWarningBgColor,
  weatherWarningHeadlineColor,
  setWeatherWarningHeadlineColor,
  weatherInstructionsColor,
  setWeatherInstructionsColor,
  weatherAlertDescriptionColor,
  setWeatherAlertDescriptionColor,
  weatherDateColor,
  setWeatherDateColor,
  weatherWarningButtonBackgroundColor,
  setWeatherWarningButtonBackgroundColor,
  weatherWarningButtonIconColor,
  setWeatherWarningButtonIconColor,

  // ListView
  listviewBackgroundColor,
  setListviewBackgroundColor,
  listviewItemBackgroundColor,
  setListviewItemBackgroundColor,
  listviewItemBorderColor,
  setListviewItemBorderColor,
  listviewItemBorderRadius,
  setListviewItemBorderRadius,
  listviewItemBorderSize,
  setListviewItemBorderSize,
  listviewTitleFontColor,
  setListviewTitleFontColor,
  listviewTitleFontSize,
  setListviewTitleFontSize,
  listviewTitleFontWeight,
  setListviewTitleFontWeight,
  listviewDescriptionFontColor,
  setListviewDescriptionFontColor,
  listviewDescriptionFontSize,
  setListviewDescriptionFontSize,
  listviewCounterFontColor,
  setListviewCounterFontColor,
  listviewCounterFontSize,
  setListviewCounterFontSize,
  listviewFilterButtonBackgroundColor,
  setListviewFilterButtonBackgroundColor,
  listviewFilterButtonBorderColor,
  setListviewFilterButtonBorderColor,
  listviewFilterButtonFontColor,
  setListviewFilterButtonFontColor,
  listviewFilterButtonHoverBackgroundColor,
  setListviewFilterButtonHoverBackgroundColor,
  listviewArrowIconColor,
  setListviewArrowIconColor,
  listviewBackButtonBackgroundColor,
  setListviewBackButtonBackgroundColor,
  listviewBackButtonHoverBackgroundColor,
  setListviewBackButtonHoverBackgroundColor,
  listviewBackButtonFontColor,
  setListviewBackButtonFontColor,
  listviewMapButtonBackgroundColor,
  setListviewMapButtonBackgroundColor,
  listviewMapButtonHoverBackgroundColor,
  setListviewMapButtonHoverBackgroundColor,
  listviewMapButtonFontColor,
  setListviewMapButtonFontColor,

  iconColor,
  borderColor,
  backgroundColor,
}: Props): JSX.Element {
  const [selectedComponentType, setSelectedComponentType] =
    useState<string>('');
  const [selectedComponentSubType, setSelectedComponentSubType] =
    useState<string>('');

  const handleComponentTypeChange = (value: string): void => {
    setSelectedComponentType(value);
    setSelectedComponentSubType(''); // Reset sub-type when type changes
  };

  const handleComponentSubTypeChange = (value: string): void => {
    setSelectedComponentSubType(value);
  };

  const handleLineChartCurrentValuesColorsChange = (
    index: number,
    newColor: string,
  ): void => {
    const updatedColors = [...lineChartCurrentValuesColors];
    updatedColors[index] = newColor;
    setLineChartCurrentValuesColors(updatedColors);
  };
  const handleBarChartCurrentValuesColorsChange = (
    index: number,
    newColor: string,
  ): void => {
    const updatedColors = [...barChartCurrentValuesColors];
    updatedColors[index] = newColor;
    setBarChartCurrentValuesColors(updatedColors);
  };
  const handleMeasurementChartCardsIconColors = (
    index: number,
    newColor: string,
  ): void => {
    const updatedColors = [...measurementChartCardsIconColors];
    updatedColors[index] = newColor;
    setMeasurementChartCardsIconColors(updatedColors);
  };
  const handleMeasurementChartCurrentValuesColorsChange = (
    index: number,
    newColor: string,
  ): void => {
    const updatedColors = [...measurementChartCurrentValuesColors];
    updatedColors[index] = newColor;
    setMeasurementChartCurrentValuesColors(updatedColors);
  };
  const handlePieChartCurrentValuesColorsChange = (
    index: number,
    newColor: string,
  ): void => {
    const updatedColors = [...pieChartCurrentValuesColors];
    updatedColors[index] = newColor;
    setPieChartCurrentValuesColors(updatedColors);
  };

  const subtypeMapping: { [key: string]: string[] } = {
    [tabComponentTypeEnum.diagram]: [
      '',
      tabComponentSubTypeEnum.degreeChart180,
      tabComponentSubTypeEnum.degreeChart360,
      tabComponentSubTypeEnum.stageableChart,
      tabComponentSubTypeEnum.lineChart,
      tabComponentSubTypeEnum.barChart,
      tabComponentSubTypeEnum.pieChart,
      tabComponentSubTypeEnum.pieChartDynamic,
      tabComponentSubTypeEnum.measurement,
    ],
    [tabComponentTypeEnum.slider]: [
      '',
      tabComponentSubTypeEnum.coloredSlider,
      tabComponentSubTypeEnum.overviewSlider,
    ],
    [tabComponentTypeEnum.information]: [
      '',
      tabComponentSubTypeEnum.iconWithLink,
    ],
  };

  const showSubTypeDropdown = selectedComponentType in subtypeMapping;
  const subtypes = subtypeMapping[selectedComponentType] || [];

  return (
    <div className="flex flex-col w-full px-2 transition-opacity duration-500 opacity-100">
      <div className="flex flex-row w-full px-2">
        <div className="flex-grow basis-1/2 px-2">
          <div className="flex flex-col">
            <div className="flex-1">
              <WizardLabel label="Komponente" />
              <WizardDropdownSelection
                currentValue={selectedComponentType}
                selectableValues={Object.values(tabComponentTypeEnum).filter(
                  (value) =>
                    value !== 'iFrame' &&
                    value !== 'Bild' &&
                    value !== 'Karte' &&
                    value !== 'Kombinierte Komponente',
                )}
                onSelect={(value): void =>
                  handleComponentTypeChange(value.toString())
                }
                iconColor={iconColor}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
            <div className="flex-1">
              {showSubTypeDropdown && (
                <div className="mt-3">
                  <WizardLabel label="Sub-Komponente" />
                  <WizardDropdownSelection
                    currentValue={selectedComponentSubType}
                    selectableValues={subtypes}
                    onSelect={(value): void =>
                      handleComponentSubTypeChange(value.toString())
                    }
                    iconColor={iconColor}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              )}
            </div>
            <HorizontalDivider />
            {/* Add more columns as needed */}
            {/* Additional fields based on type or subtype */}
            {selectedComponentType === tabComponentTypeEnum.diagram && (
              <div className="flex-1">
                {selectedComponentSubType ===
                  tabComponentSubTypeEnum.degreeChart180 && (
                  <div className="flex-col">
                    <div className="flex flex-row">
                      <div className="flex flex-row w-1/2">
                        <div className="flex w-1/3">
                          <WizardLabel label="Schriftgröße" />
                        </div>
                        <div className="flex w-2/3">
                          <WizardTextfield
                            value={degreeChart180FontSize}
                            onChange={(value): void => {
                              setDegreeChart180FontSize(value.toString());
                            }}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      </div>
                      <div className="flex w-1/2 ml-4">
                        <ColorPickerComponent
                          currentColor={degreeChart180FontColor}
                          handleColorChange={setDegreeChart180FontColor}
                          label="Schriftfarbe"
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-1">
                      <div className="flex flex-row w-1/2">
                        <div className="flex w-1/3">
                          <WizardLabel label="Schriftgröße der Maßeinheit" />
                        </div>
                        <div className="flex w-2/3">
                          <WizardTextfield
                            value={degreeChart180UnitFontSize}
                            onChange={(value): void => {
                              setDegreeChart180UnitFontSize(value.toString());
                            }}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col w-1/2 ml-4">
                        <div className="flex mt-2">
                          <ColorPickerComponent
                            currentColor={degreeChart180BgColor}
                            handleColorChange={setDegreeChart180BgColor}
                            label="Hintergrundfarbe"
                          />
                        </div>
                        <div className="flex mt-2">
                          <ColorPickerComponent
                            currentColor={degreeChart180FillColor}
                            handleColorChange={setDegreeChart180FillColor}
                            label="Wert Farbe"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {selectedComponentSubType ===
                  tabComponentSubTypeEnum.degreeChart360 && (
                  <div className="flex-col">
                    <div className="flex flex-row">
                      <div className="flex flex-row w-1/2">
                        <div className="flex w-1/3">
                          <WizardLabel label="Schriftgröße" />
                        </div>
                        <div className="flex w-2/3">
                          <WizardTextfield
                            value={degreeChart360FontSize}
                            onChange={(value): void => {
                              setDegreeChart360FontSize(value.toString());
                            }}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      </div>
                      <div className="flex flex-row w-1/2 ml-4">
                        <ColorPickerComponent
                          currentColor={degreeChart360FontColor}
                          handleColorChange={setDegreeChart360FontColor}
                          label="Schriftfarbe"
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-1">
                      <div className="flex flex-row w-1/2">
                        <div className="flex w-1/3">
                          <WizardLabel label="Schriftgröße der Maßeinheit" />
                        </div>
                        <div className="flex w-2/3">
                          <WizardTextfield
                            value={degreeChart360UnitFontSize}
                            onChange={(value): void => {
                              setDegreeChart360UnitFontSize(value.toString());
                            }}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col w-1/2 ml-4">
                        <div className="flex mt-2">
                          <ColorPickerComponent
                            currentColor={degreeChart360BgColor}
                            handleColorChange={setDegreeChart360BgColor}
                            label="Hintergrundfarbe"
                          />
                        </div>
                        <div className="flex mt-2">
                          <ColorPickerComponent
                            currentColor={degreeChart360FillColor}
                            handleColorChange={setDegreeChart360FillColor}
                            label="Wert Farbe"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {selectedComponentSubType ===
                  tabComponentSubTypeEnum.stageableChart && (
                  <div className="flex flex-col">
                    <div className="flex flex-row mt-2">
                      <div className="flex flex-row w-1/2">
                        <div className="flex w-1/2">
                          <WizardLabel label="Schriftgröße des Hauptwerts" />
                        </div>
                        <div className="flex w-1/2">
                          <WizardTextfield
                            value={stageableChartFontSize}
                            onChange={(value): void => {
                              setStageableChartFontSize(value.toString());
                            }}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      </div>
                      <div className="flex w-1/2 ml-6 mt-1">
                        <ColorPickerComponent
                          currentColor={stageableChartFontColor}
                          handleColorChange={setStageableChartFontColor}
                          label="Textfarbe des Hauptwerts"
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-1">
                      <div className="flex flex-row w-1/2">
                        <div className="flex w-1/2">
                          <WizardLabel label="Schriftgröße der Zwischenwerte" />
                        </div>
                        <div className="flex w-1/2">
                          <WizardTextfield
                            value={stageableChartTicksFontSize}
                            onChange={(value): void => {
                              setStageableChartTicksFontSize(value.toString());
                            }}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      </div>
                      <div className="flex w-1/2 ml-6 mt-1">
                        <ColorPickerComponent
                          currentColor={stageableChartTicksFontColor}
                          handleColorChange={setStageableChartTicksFontColor}
                          label="Textfarbe der Zwischenwerte"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {selectedComponentSubType ===
                  tabComponentSubTypeEnum.lineChart && (
                  <div className="flex-col">
                    <WizardLabel label="Achse" />
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row mr-2 items-center">
                        {/* Axis Ticks Font Size */}
                        <div className="min-w-[350px]">
                          <WizardLabel label="Schriftgröße der Achsenwerte" />{' '}
                        </div>
                        <WizardTextfield
                          value={lineChartAxisTicksFontSize}
                          onChange={(value): void => {
                            setLineChartAxisTicksFontSize(value.toString());
                          }}
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                      <div className="flex flex-row mr-2 items-center">
                        {/* Axis Label Size */}
                        <div className="min-w-[350px]">
                          <WizardLabel label="Schriftgröße der Achsenbeschreibung" />{' '}
                        </div>
                        <WizardTextfield
                          value={lineChartAxisLabelSize}
                          onChange={(value): void => {
                            setLineChartAxisLabelSize(value.toString());
                          }}
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                      <div className="flex flex-row mr-2 items-center">
                        {/* Axis Label Color */}
                        <div className="min-w-[350px]">
                          <WizardLabel label="Schriftfarbe der Achsenbeschreibung" />{' '}
                        </div>
                        <ColorPickerComponent
                          currentColor={lineChartAxisLabelFontColor}
                          handleColorChange={setLineChartAxisLabelFontColor}
                          label="Achsenbeschreibung Farbe"
                        />
                      </div>
                    </div>
                    <HorizontalDivider />
                    <WizardLabel label="Legende" />
                    <div className="w-full flex flex-col gap-2">
                      <div className="flex flex-row mr-2 items-center">
                        {/* Axis Label Size */}
                        <div className="min-w-[350px]">
                          <WizardLabel label="Schriftgröße der Legende" />
                        </div>
                        <WizardTextfield
                          value={lineChartLegendFontSize}
                          onChange={(value): void => {
                            setLineChartLegendFontSize(value.toString());
                          }}
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                      <div className="flex flex-row mr-2 items-center">
                        {/* Axis Legend Font Color */}
                        <div className="min-w-[350px]">
                          <WizardLabel label="Schriftfarbe der Legende" />
                        </div>
                        <ColorPickerComponent
                          currentColor={lineChartLegendFontColor}
                          handleColorChange={setLineChartLegendFontColor}
                          label="Legenden Farbe"
                        />
                      </div>
                    </div>
                    <HorizontalDivider />
                    <div className="flex flex-row">
                      <div className="flex-col w-1/2 mt-3 ml-2">
                        {/* Ticks Font Color */}
                        <div className="flex mt-3">
                          <ColorPickerComponent
                            currentColor={lineChartTicksFontColor}
                            handleColorChange={setLineChartTicksFontColor}
                            label="Textfarbe der Zwischenwerte"
                          />
                        </div>
                        {/* Axis Line Color */}
                        <div className="flex mt-3">
                          <ColorPickerComponent
                            currentColor={lineChartAxisLineColor}
                            handleColorChange={setLineChartAxisLineColor}
                            label="Achsenfarbe"
                          />
                        </div>
                        {/* Grid Color */}
                        <div className="flex mt-3">
                          <ColorPickerComponent
                            currentColor={lineChartGridColor}
                            handleColorChange={setLineChartGridColor}
                            label="Gitter Farbe"
                          />
                        </div>
                        <div className="flex mt-2">
                          <ColorPickerComponent
                            currentColor={lineChartFilterColor}
                            handleColorChange={setLineChartFilterColor}
                            label="Filter Farbe"
                          />
                        </div>
                        <div className="flex mt-2">
                          <ColorPickerComponent
                            currentColor={lineChartFilterTextColor}
                            handleColorChange={setLineChartFilterTextColor}
                            label="Filter Textfarbe"
                          />
                        </div>
                      </div>
                      <div className="flex-col w-1/2 mt-3 ml-2">
                        {/* // Render 10 color picker components */}
                        <div className="mt-3">
                          <MultipleColorPicker
                            colors={lineChartCurrentValuesColors}
                            totalFields={10}
                            label="Linien Farben"
                            onColorChange={
                              handleLineChartCurrentValuesColorsChange
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {selectedComponentSubType ===
                  tabComponentSubTypeEnum.barChart && (
                  <div className="flex-col">
                    <WizardLabel label="Achse" />
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-row mr-2 items-center">
                        {/* Axis Ticks Font Size */}
                        <div className="min-w-[350px]">
                          <WizardLabel label="Schriftgröße der Achsenwerte" />
                        </div>
                        <WizardTextfield
                          value={barChartAxisTicksFontSize}
                          onChange={(value): void => {
                            setBarChartAxisTicksFontSize(value.toString());
                          }}
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                      <div className="flex flex-row mr-2 items-center">
                        {/* Axis Label Size */}
                        <div className="min-w-[350px]">
                          <WizardLabel label="Schriftgröße der Achsenbeschreibung" />
                        </div>
                        <WizardTextfield
                          value={barChartAxisLabelSize}
                          onChange={(value): void => {
                            setBarChartAxisLabelSize(value.toString());
                          }}
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                      <div className="flex flex-row mr-2 items-center">
                        {/* Axis Label Color */}
                        <div className="min-w-[350px]">
                          <WizardLabel label="Schriftfarbe der Achsenbeschreibung" />
                        </div>
                        <ColorPickerComponent
                          currentColor={barChartAxisLabelFontColor}
                          handleColorChange={setBarChartAxisLabelFontColor}
                          label="Achsenbeschreibung Farbe"
                        />
                      </div>
                    </div>
                    <HorizontalDivider />
                    <WizardLabel label="Legende" />
                    <div className="w-full flex flex-col gap-2">
                      <div className="flex flex-row mr-2 items-center">
                        {/* Axis Label Size */}
                        <div className="min-w-[350px]">
                          <WizardLabel label="Schriftgröße der Legende" />
                        </div>
                        <WizardTextfield
                          value={barChartLegendFontSize}
                          onChange={(value): void => {
                            setBarChartLegendFontSize(value.toString());
                          }}
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                      <div className="flex flex-row mr-2 items-center">
                        {/* Axis Legend Font Color */}
                        <div className="min-w-[350px]">
                          <WizardLabel label="Schriftfarbe der Legende" />
                        </div>
                        <ColorPickerComponent
                          currentColor={barChartLegendFontColor}
                          handleColorChange={setBarChartLegendFontColor}
                          label="Legenden Farbe"
                        />
                      </div>
                    </div>
                    <HorizontalDivider />
                    <div className="flex flex-row">
                      <div className="flex-col w-1/2 mt-3 ml-2">
                        {/* Ticks Font Color */}
                        <div className="flex mt-3">
                          <ColorPickerComponent
                            currentColor={barChartTicksFontColor}
                            handleColorChange={setBarChartTicksFontColor}
                            label="Textfarbe der Zwischenwerte"
                          />
                        </div>
                        {/* Axis Line Color */}
                        <div className="flex mt-3">
                          <ColorPickerComponent
                            currentColor={barChartAxisLineColor}
                            handleColorChange={setBarChartAxisLineColor}
                            label="Achsenfarbe"
                          />
                        </div>
                        {/* Grid Color */}
                        <div className="flex mt-3">
                          <ColorPickerComponent
                            currentColor={barChartGridColor}
                            handleColorChange={setBarChartGridColor}
                            label="Gitter Farbe"
                          />
                        </div>
                        <div className="flex mt-2">
                          <ColorPickerComponent
                            currentColor={barChartFilterColor}
                            handleColorChange={setBarChartFilterColor}
                            label="Filter Farbe"
                          />
                        </div>
                        <div className="flex mt-2">
                          <ColorPickerComponent
                            currentColor={barChartFilterTextColor}
                            handleColorChange={setBarChartFilterTextColor}
                            label="Filter Textfarbe"
                          />
                        </div>
                      </div>
                      <div className="flex-col w-1/2 mt-3 ml-2">
                        {/* // Render 10 color picker components */}
                        <div className="mt-3">
                          <MultipleColorPicker
                            colors={barChartCurrentValuesColors}
                            totalFields={10}
                            label="Balken Farben"
                            onColorChange={
                              handleBarChartCurrentValuesColorsChange
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {selectedComponentSubType ===
                  tabComponentSubTypeEnum.measurement && (
                  <div className="flex-col">
                    <div className="flex flex-col">
                      <div className="flex">
                        <WizardLabel label="Hauptwert" />
                      </div>
                      <div className="flex flex-row items-center">
                        <div className="flex flex-row w-1/2">
                          <div className="flex w-1/3">
                            <WizardLabel label="Schriftgröße des Hauptwerts" />
                          </div>
                          <div className="flex w-2/3 mt-2">
                            <WizardTextfield
                              value={measurementChartBigValueFontSize}
                              onChange={(value): void => {
                                setMeasurementChartBigValueFontSize(
                                  value.toString(),
                                );
                              }}
                              borderColor={borderColor}
                              backgroundColor={backgroundColor}
                            />
                          </div>
                        </div>
                        <div className="flex w-1/2 ml-2">
                          <ColorPickerComponent
                            currentColor={measurementChartBigValueFontColor}
                            handleColorChange={
                              setMeasurementChartBigValueFontColor
                            }
                            label="Hauptwert Farbe"
                          />
                        </div>
                      </div>
                    </div>
                    <HorizontalDivider />
                    <div className="flex flex-col">
                      <div className="flex">
                        <WizardLabel label="Oberster Wert" />
                      </div>
                      <div className="flex flex-row items-center">
                        <div className="flex w-1/2 mt-3">
                          <ColorPickerComponent
                            currentColor={measurementChartTopButtonBgColor}
                            handleColorChange={
                              setMeasurementChartTopButtonBgColor
                            }
                            label="Button Hintergrund Farbe"
                          />
                        </div>
                        <div className="flex w-1/2 mt-3">
                          <ColorPickerComponent
                            currentColor={
                              measurementChartTopButtonInactiveBgColor
                            }
                            handleColorChange={
                              setMeasurementChartTopButtonInactiveBgColor
                            }
                            label="Inaktive Button Hintergrund Farbe"
                          />
                        </div>
                      </div>
                      <div className="flex flex-row items-center">
                        <div className="flex w-1/2 mt-3">
                          <ColorPickerComponent
                            currentColor={measurementChartTopButtonHoverColor}
                            handleColorChange={
                              setMeasurementChartTopButtonHoverColor
                            }
                            label="Button Hover Farbe"
                          />
                        </div>
                        <div className="flex w-1/2 mt-3">
                          <ColorPickerComponent
                            currentColor={measurementChartTopButtonFontColor}
                            handleColorChange={
                              setMeasurementChartTopButtonFontColor
                            }
                            label="Button Text Farbe"
                          />
                        </div>
                      </div>
                    </div>
                    <HorizontalDivider />
                    <div className="flex flex-col">
                      <div className="flex">
                        <WizardLabel label="Tab Darstellung" />
                      </div>
                      <div className="flex flex-row">
                        <div className="flex flex-col w-1/2">
                          {/* // Must 4 color picker components */}
                          <MultipleColorPicker
                            colors={measurementChartCardsIconColors}
                            totalFields={4}
                            label="Iconfarbe"
                            onColorChange={
                              handleMeasurementChartCardsIconColors
                            }
                          />
                        </div>
                        <div className="flex flex-col w-1/2">
                          <div className="flex mt-3">
                            <ColorPickerComponent
                              currentColor={measurementChartCardsBgColor}
                              handleColorChange={
                                setMeasurementChartCardsBgColor
                              }
                              label="Info Hintergrundfarbe"
                            />
                          </div>
                          <div className="flex mt-3">
                            <ColorPickerComponent
                              currentColor={measurementChartCardsFontColor}
                              handleColorChange={
                                setMeasurementChartCardsFontColor
                              }
                              label="Info Text Farbe"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <HorizontalDivider />
                    <div className="flex flex-col">
                      <div className="flex">
                        <WizardLabel label="Diagramm Darstellung" />
                      </div>
                      <div className="flex flex-row mt-2">
                        <div className="flex flex-col w-1/2">
                          {/* // Render 10 color picker components */}
                          <MultipleColorPicker
                            colors={measurementChartCurrentValuesColors}
                            totalFields={1}
                            label="Liniendiagramm Farbe"
                            onColorChange={
                              handleMeasurementChartCurrentValuesColorsChange
                            }
                          />
                        </div>
                        <div className="flex flex-col w-1/2">
                          <div className="mt-3">
                            <ColorPickerComponent
                              currentColor={measurementChartBarColor}
                              handleColorChange={setMeasurementChartBarColor}
                              label="Balken Farbe"
                            />
                          </div>
                          <div className="mt-3">
                            <ColorPickerComponent
                              currentColor={measurementChartLabelFontColor}
                              handleColorChange={
                                setMeasurementChartLabelFontColor
                              }
                              label="Beschreibungstext-Farbe"
                            />
                          </div>
                          <div className="mt-3">
                            <ColorPickerComponent
                              currentColor={measurementChartGridColor}
                              handleColorChange={setMeasurementChartGridColor}
                              label="Gitter Farbe"
                            />
                          </div>
                          <div className="mt-3">
                            <ColorPickerComponent
                              currentColor={measurementChartAxisLineColor}
                              handleColorChange={
                                setMeasurementChartAxisLineColor
                              }
                              label="Achsenfarbe"
                            />
                          </div>
                          <div className="mt-3">
                            <ColorPickerComponent
                              currentColor={measurementChartAxisTicksFontColor}
                              handleColorChange={
                                setMeasurementChartAxisTicksFontColor
                              }
                              label="Achsenwert Farbe"
                            />
                          </div>
                          <div className="mt-3">
                            <ColorPickerComponent
                              currentColor={measurementChartAxisLabelFontColor}
                              handleColorChange={
                                setMeasurementChartAxisLabelFontColor
                              }
                              label="Achsenbeschreibungs Farbe"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {(selectedComponentSubType ===
                  tabComponentSubTypeEnum.pieChart ||
                  selectedComponentSubType ===
                    tabComponentSubTypeEnum.pieChartDynamic) && (
                  <div className="flex flex-col">
                    <div className="flex flex-row">
                      <div className="flex flex-row w-1/2 mt-1">
                        <div className="flex w-1/3">
                          <WizardLabel label="Schriftgröße" />
                        </div>
                        <div className="flex w-2/3">
                          <WizardTextfield
                            value={pieChartFontSize}
                            onChange={(value): void => {
                              setPieChartFontSize(value.toString());
                            }}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col w-1/2 ml-6">
                        <div className="flex mt-2">
                          <ColorPickerComponent
                            currentColor={pieChartFontColor}
                            handleColorChange={setPieChartFontColor}
                            label="Schriftfarbe"
                          />
                        </div>
                        <div className="flex mt-2">
                          <MultipleColorPicker
                            colors={pieChartCurrentValuesColors}
                            totalFields={10}
                            label="Piechart Farbe"
                            onColorChange={
                              handlePieChartCurrentValuesColorsChange
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {selectedComponentType === tabComponentTypeEnum.slider && (
              <div className="flex-1">
                {selectedComponentSubType ===
                  tabComponentSubTypeEnum.coloredSlider && (
                  <div className="flex-col">
                    <div className="flex flex-row">
                      <div className="flex flex-row w-1/2">
                        <div className="flex w-1/3">
                          <WizardLabel label="Schriftgröße des Hauptwerts" />
                        </div>
                        <div className="flex w-2/3">
                          <WizardTextfield
                            value={coloredSliderBigValueFontSize}
                            onChange={(value): void => {
                              setColoredSliderBigValueFontSize(
                                value.toString(),
                              );
                            }}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      </div>
                      <div className="flex w-1/2 mt-2 ml-4">
                        <ColorPickerComponent
                          currentColor={coloredSliderBigValueFontColor}
                          handleColorChange={setColoredSliderBigValueFontColor}
                          label="Hauptwert Farbe"
                        />
                      </div>
                    </div>
                    <div className="flex flex-row">
                      <div className="flex flex-row w-1/2">
                        <div className="flex w-1/3">
                          <WizardLabel label="Schriftgröße des Beschreibungstextes" />
                        </div>
                        <div className="flex w-2/3">
                          <WizardTextfield
                            value={coloredSliderLabelFontSize}
                            onChange={(value): void => {
                              setColoredSliderLabelFontSize(value.toString());
                            }}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      </div>
                      <div className="flex w-1/2 mt-2 ml-4">
                        <ColorPickerComponent
                          currentColor={coloredSliderLabelFontColor}
                          handleColorChange={setColoredSliderLabelFontColor}
                          label="Beschreibungstext Farbe"
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-2">
                      <div className="flex flex-row w-1/2">
                        <div className="flex w-1/3">
                          <WizardLabel label="Schriftgröße der Maßeinheit" />
                        </div>
                        <div className="flex w-2/3">
                          <WizardTextfield
                            value={coloredSliderUnitFontSize}
                            onChange={(value): void => {
                              setColoredSliderUnitFontSize(value.toString());
                            }}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      </div>
                      <div className="flex w-1/2 mt-2 ml-4">
                        <ColorPickerComponent
                          currentColor={coloredSliderArrowColor}
                          handleColorChange={setColoredSliderArrowColor}
                          label="Pfeilfarbe"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedComponentSubType ===
                  tabComponentSubTypeEnum.overviewSlider && (
                  <div className="flex-col">
                    <div className="flex flex-row">
                      <div className="flex w-1/2 mt-2 ml-4">
                        <ColorPickerComponent
                          currentColor={sliderCurrentFontColor}
                          handleColorChange={setSliderCurrentFontColor}
                          label="Schriftfarbe aktueller Wert"
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-2">
                      <div className="flex w-1/2 mt-2 ml-4">
                        <ColorPickerComponent
                          currentColor={sliderMaximumFontColor}
                          handleColorChange={setSliderMaximumFontColor}
                          label="Schriftfarbe maximaler Wert"
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-2">
                      <div className="flex w-1/2 mt-2 ml-4">
                        <ColorPickerComponent
                          currentColor={sliderGeneralFontColor}
                          handleColorChange={setSliderGeneralFontColor}
                          label="Allgemeine Schriftfarbe"
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-2">
                      <div className="flex w-1/2 mt-2 ml-4">
                        <ColorPickerComponent
                          currentColor={sliderCurrentColor}
                          handleColorChange={setSliderCurrentColor}
                          label="Slider Farbe aktueller Wert"
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-2">
                      <div className="flex w-1/2 mt-2 ml-4">
                        <ColorPickerComponent
                          currentColor={sliderMaximumColor}
                          handleColorChange={setsliderMaximumColor}
                          label="Slider Farbe maximaler Wert"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {selectedComponentType === tabComponentTypeEnum.information && (
              <div className="flex-1">
                {selectedComponentSubType ===
                  tabComponentSubTypeEnum.iconWithLink && (
                  <div className="flex-col">
                    <div className="flex flex-row mt-2">
                      <div className="flex flex-row w-1/2">
                        <div className="flex w-1/3">
                          <WizardLabel label="Schriftgröße" />
                        </div>
                        <div className="flex w-2/3">
                          <WizardTextfield
                            value={iconWithLinkFontSize}
                            onChange={(value): void => {
                              setIconWithLinkFontSize(value.toString());
                            }}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                      </div>
                      <div className="flex w-1/2 mt-1 ml-4">
                        <ColorPickerComponent
                          currentColor={iconWithLinkFontColor}
                          handleColorChange={setIconWithLinkFontColor}
                          label="Schriftfarbe"
                        />
                      </div>
                    </div>
                    <div className="flex flex-row mt-2">
                      <div className="flex flex-row w-1/2">
                        <div className="flex w-1/3">
                          <WizardLabel label="Icongröße" />
                        </div>
                        <div className="flex-col w-2/3">
                          <WizardTextfield
                            value={iconWithLinkIconSize}
                            onChange={(value): void => {
                              setIconWithLinkIconSize(value.toString());
                            }}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                          <span className="ml-2 mt-3">E.g. xs, sm, lg, xl</span>
                        </div>
                      </div>
                      <div className="flex w-1/2 mt-1 ml-4">
                        <ColorPickerComponent
                          currentColor={iconWithLinkIconColor}
                          handleColorChange={setIconWithLinkIconColor}
                          label="Iconfarbe"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {selectedComponentType === tabComponentTypeEnum.weatherWarning && (
              <div className="flex-col">
                <div className="flex w-1/2 mt-1 ml-4">
                  <ColorPickerComponent
                    currentColor={weatherWarningBgColor}
                    handleColorChange={setWeatherWarningBgColor}
                    label="Hintergrundfarbe"
                  />
                </div>

                <div className="flex w-1/2 mt-1 ml-4">
                  <ColorPickerComponent
                    currentColor={weatherWarningHeadlineColor}
                    handleColorChange={setWeatherWarningHeadlineColor}
                    label="Überschrift"
                  />
                </div>

                <div className="flex w-1/2 mt-1 ml-4">
                  <ColorPickerComponent
                    currentColor={weatherInstructionsColor}
                    handleColorChange={setWeatherInstructionsColor}
                    label="Anweisungstext"
                  />
                </div>

                <div className="flex w-1/2 mt-1 ml-4">
                  <ColorPickerComponent
                    currentColor={weatherAlertDescriptionColor}
                    handleColorChange={setWeatherAlertDescriptionColor}
                    label="Beschreibungstext"
                  />
                </div>

                <div className="flex w-1/2 mt-1 ml-4">
                  <ColorPickerComponent
                    currentColor={weatherDateColor}
                    handleColorChange={setWeatherDateColor}
                    label="Datumstext"
                  />
                </div>

                <div className="flex w-1/2 mt-1 ml-4">
                  <ColorPickerComponent
                    currentColor={weatherWarningButtonBackgroundColor}
                    handleColorChange={setWeatherWarningButtonBackgroundColor}
                    label="Button Hintergrundfarbe"
                  />
                </div>

                <div className="flex w-1/2 mt-1 ml-4">
                  <ColorPickerComponent
                    currentColor={weatherWarningButtonIconColor}
                    handleColorChange={setWeatherWarningButtonIconColor}
                    label="Button Iconfarbe"
                  />
                </div>
              </div>
            )}
            {selectedComponentType === tabComponentTypeEnum.value && (
              <div className="flex-1">
                <div className="flex flex-row">
                  <div className="flex flex-row w-1/2">
                    <div className="flex w-1/3">
                      <WizardLabel label="Schriftgröße" />
                    </div>
                    <div className="flex w-2/3">
                      <WizardTextfield
                        value={wertFontSize}
                        onChange={(value): void => {
                          setWertFontSize(value.toString());
                        }}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                  </div>
                  <div className="flex flex-row w-1/2 mt-2 ml-4">
                    <ColorPickerComponent
                      currentColor={wertFontColor}
                      handleColorChange={setWertFontColor}
                      label="Schriftfarbe"
                    />
                  </div>
                </div>
                <div className="flex flex-row w-1/2 mt-2">
                  <div className="flex w-1/3">
                    <WizardLabel label="Schriftgröße der Maßeinheit" />
                  </div>
                  <div className="flex w-2/3 mr-2">
                    <WizardTextfield
                      value={wertUnitFontSize}
                      onChange={(value): void => {
                        setWertUnitFontSize(value.toString());
                      }}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                </div>
              </div>
            )}
            {selectedComponentType === tabComponentTypeEnum.listview && (
              <div className="flex-1">
                {/* General ListView Background */}
                <div className="mt-4">
                  <WizardLabel label="Allgemeine Einstellungen" />
                  <div className="grid grid-cols-1 gap-4 mt-2">
                    <ColorPickerComponent
                      currentColor={listviewBackgroundColor}
                      handleColorChange={setListviewBackgroundColor}
                      label="ListView Hintergrund"
                    />
                  </div>
                </div>

                <HorizontalDivider />
                {/* List Item Styling */}
                <div className="mt-6">
                  <WizardLabel label="Listen Element Styling" />
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <ColorPickerComponent
                      currentColor={listviewItemBackgroundColor}
                      handleColorChange={setListviewItemBackgroundColor}
                      label="Element Hintergrund"
                    />
                    <ColorPickerComponent
                      currentColor={listviewItemBorderColor}
                      handleColorChange={setListviewItemBorderColor}
                      label="Element Rahmen Farbe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <WizardLabel label="Rahmen Radius" />
                      <WizardTextfield
                        value={listviewItemBorderRadius}
                        onChange={(value): void =>
                          setListviewItemBorderRadius(value.toString())
                        }
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                    <div>
                      <WizardLabel label="Rahmen Dicke" />
                      <WizardTextfield
                        value={listviewItemBorderSize}
                        onChange={(value): void =>
                          setListviewItemBorderSize(value.toString())
                        }
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                  </div>
                </div>

                <HorizontalDivider />
                {/* Typography Section */}
                <div className="mt-6">
                  <WizardLabel label="Schrift Einstellungen" />

                  {/* Title Typography */}
                  <div className="mt-4">
                    <WizardLabel label="Titel" />
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <ColorPickerComponent
                        currentColor={listviewTitleFontColor}
                        handleColorChange={setListviewTitleFontColor}
                        label="Titel Schriftfarbe"
                      />
                      <div>
                        <WizardLabel label="Titel Schriftgröße" />
                        <WizardTextfield
                          value={listviewTitleFontSize}
                          onChange={(value): void =>
                            setListviewTitleFontSize(value.toString())
                          }
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                      <div>
                        <WizardLabel label="Titel Schriftgewicht" />
                        <WizardDropdownSelection
                          currentValue={listviewTitleFontWeight}
                          selectableValues={[
                            'normal',
                            'bold',
                            '100',
                            '200',
                            '300',
                            '400',
                            '500',
                            '600',
                            '700',
                            '800',
                            '900',
                          ]}
                          onSelect={(value): void =>
                            setListviewTitleFontWeight(value.toString())
                          }
                          iconColor={iconColor}
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                    </div>
                  </div>

                  <HorizontalDivider />
                  {/* Description Typography */}
                  <div className="mt-4">
                    <WizardLabel label="Beschreibung" />
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <ColorPickerComponent
                        currentColor={listviewDescriptionFontColor}
                        handleColorChange={setListviewDescriptionFontColor}
                        label="Beschreibung Farbe"
                      />
                      <div>
                        <WizardLabel label="Beschreibung Größe" />
                        <WizardTextfield
                          value={listviewDescriptionFontSize}
                          onChange={(value): void =>
                            setListviewDescriptionFontSize(value.toString())
                          }
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                    </div>
                  </div>

                  <HorizontalDivider />
                  {/* Counter Typography */}
                  <div className="mt-4">
                    <WizardLabel label="Zähler" />
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <ColorPickerComponent
                        currentColor={listviewCounterFontColor}
                        handleColorChange={setListviewCounterFontColor}
                        label="Zähler Farbe"
                      />
                      <div>
                        <WizardLabel label="Zähler Größe" />
                        <WizardTextfield
                          value={listviewCounterFontSize}
                          onChange={(value): void =>
                            setListviewCounterFontSize(value.toString())
                          }
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <HorizontalDivider />
                {/* Filter Button Styling */}
                <div className="mt-6">
                  <WizardLabel label="Filter Button" />
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <ColorPickerComponent
                      currentColor={listviewFilterButtonBackgroundColor}
                      handleColorChange={setListviewFilterButtonBackgroundColor}
                      label="Filter Button Hintergrund"
                    />
                    <ColorPickerComponent
                      currentColor={listviewFilterButtonHoverBackgroundColor}
                      handleColorChange={
                        setListviewFilterButtonHoverBackgroundColor
                      }
                      label="Filter Button Hover"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <ColorPickerComponent
                      currentColor={listviewFilterButtonBorderColor}
                      handleColorChange={setListviewFilterButtonBorderColor}
                      label="Filter Button Rahmen"
                    />
                    <ColorPickerComponent
                      currentColor={listviewFilterButtonFontColor}
                      handleColorChange={setListviewFilterButtonFontColor}
                      label="Filter Button Text"
                    />
                  </div>
                </div>

                <HorizontalDivider />
                {/* Navigation Buttons */}
                <div className="mt-6">
                  <WizardLabel label="Navigation Buttons" />
                  <div className="grid grid-cols-2 gap-6 mt-2">
                    {/* Back Button */}
                    <div>
                      <WizardLabel label="Zurück Button" />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <ColorPickerComponent
                          currentColor={listviewBackButtonBackgroundColor}
                          handleColorChange={
                            setListviewBackButtonBackgroundColor
                          }
                          label="Hintergrund"
                        />
                        <ColorPickerComponent
                          currentColor={listviewBackButtonHoverBackgroundColor}
                          handleColorChange={
                            setListviewBackButtonHoverBackgroundColor
                          }
                          label="Hover"
                        />
                      </div>
                      <div className="mt-2">
                        <ColorPickerComponent
                          currentColor={listviewBackButtonFontColor}
                          handleColorChange={setListviewBackButtonFontColor}
                          label="Text Farbe"
                        />
                      </div>
                    </div>

                    {/* Map Button */}
                    <div>
                      <WizardLabel label="Karte Button" />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <ColorPickerComponent
                          currentColor={listviewMapButtonBackgroundColor}
                          handleColorChange={
                            setListviewMapButtonBackgroundColor
                          }
                          label="Hintergrund"
                        />
                        <ColorPickerComponent
                          currentColor={listviewMapButtonHoverBackgroundColor}
                          handleColorChange={
                            setListviewMapButtonHoverBackgroundColor
                          }
                          label="Hover"
                        />
                      </div>
                      <div className="mt-2">
                        <ColorPickerComponent
                          currentColor={listviewMapButtonFontColor}
                          handleColorChange={setListviewMapButtonFontColor}
                          label="Text Farbe"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <HorizontalDivider />
                {/* Icons */}
                <div className="mt-6">
                  <WizardLabel label="Icons" />
                  <div className="mt-2">
                    <ColorPickerComponent
                      currentColor={listviewArrowIconColor}
                      handleColorChange={setListviewArrowIconColor}
                      label="Pfeil Icon Farbe"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-grow basis-1/2 px-2">
          <div className="sticky top-1">
            <CIDashboardWidgetPreview
              key={`${selectedComponentType}-${selectedComponentSubType}`}
              componentType={selectedComponentType}
              componentSubType={selectedComponentSubType}
              // Information Text
              informationTextFontSize={informationTextFontSize}
              informationTextFontColor={informationTextFontColor}
              iconWithLinkFontSize={iconWithLinkFontSize}
              iconWithLinkFontColor={iconWithLinkFontColor}
              iconWithLinkIconSize={iconWithLinkIconSize}
              iconWithLinkIconColor={iconWithLinkIconColor}
              // 180 and 360 Diagram
              degreeChart180FontSize={degreeChart180FontSize}
              degreeChart180FontColor={degreeChart180FontColor}
              degreeChart180BgColor={degreeChart180BgColor}
              degreeChart180FillColor={degreeChart180FillColor}
              degreeChart180UnitFontSize={degreeChart180UnitFontSize}
              degreeChart360FontSize={degreeChart360FontSize}
              degreeChart360FontColor={degreeChart360FontColor}
              degreeChart360BgColor={degreeChart360BgColor}
              degreeChart360UnitFontSize={degreeChart360UnitFontSize}
              degreeChart360FillColor={degreeChart360FillColor}
              stageableChartTicksFontSize={stageableChartTicksFontSize}
              stageableChartTicksFontColor={stageableChartTicksFontColor}
              stageableChartFontSize={stageableChartFontSize}
              stageableChartFontColor={stageableChartFontColor}
              // Pie Chart
              pieChartFontSize={pieChartFontSize}
              pieChartFontColor={pieChartFontColor}
              pieChartCurrentValuesColors={pieChartCurrentValuesColors}
              // Line Chart
              lineChartAxisTicksFontSize={lineChartAxisTicksFontSize}
              lineChartAxisLabelSize={lineChartAxisLabelSize}
              lineChartAxisLabelFontColor={lineChartAxisLabelFontColor}
              lineChartFilterColor={lineChartFilterColor}
              lineChartFilterTextColor={lineChartFilterTextColor}
              lineChartLegendFontSize={lineChartLegendFontSize}
              lineChartLegendFontColor={lineChartLegendFontColor}
              lineChartTicksFontColor={lineChartTicksFontColor}
              lineChartAxisLineColor={lineChartAxisLineColor}
              lineChartCurrentValuesColors={lineChartCurrentValuesColors}
              lineChartGridColor={lineChartGridColor}
              // Bar Chart
              barChartAxisTicksFontSize={barChartAxisTicksFontSize}
              barChartAxisLabelSize={barChartAxisLabelSize}
              barChartAxisLabelFontColor={barChartAxisLabelFontColor}
              barChartFilterColor={barChartFilterColor}
              barChartFilterTextColor={barChartFilterTextColor}
              barChartLegendFontSize={barChartLegendFontSize}
              barChartLegendFontColor={barChartLegendFontColor}
              barChartTicksFontColor={barChartTicksFontColor}
              barChartAxisLineColor={barChartAxisLineColor}
              barChartCurrentValuesColors={barChartCurrentValuesColors}
              barChartGridColor={barChartGridColor}
              // Measurement Chart
              measurementChartBigValueFontSize={
                measurementChartBigValueFontSize
              }
              measurementChartBigValueFontColor={
                measurementChartBigValueFontColor
              }
              measurementChartTopButtonBgColor={
                measurementChartTopButtonBgColor
              }
              measurementChartTopButtonInactiveBgColor={
                measurementChartTopButtonInactiveBgColor
              }
              measurementChartTopButtonhHeaderSecondaryColor={
                measurementChartTopButtonhHeaderSecondaryColor
              }
              measurementChartTopButtonHoverColor={
                measurementChartTopButtonHoverColor
              }
              measurementChartTopButtonFontColor={
                measurementChartTopButtonFontColor
              }
              measurementChartCardsBgColor={measurementChartCardsBgColor}
              measurementChartCardsFontColor={measurementChartCardsFontColor}
              measurementChartCardsIconColors={measurementChartCardsIconColors}
              measurementChartBarColor={measurementChartBarColor}
              measurementChartLabelFontColor={measurementChartLabelFontColor}
              measurementChartGridColor={measurementChartGridColor}
              measurementChartAxisLineColor={measurementChartAxisLineColor}
              measurementChartAxisTicksFontColor={
                measurementChartAxisTicksFontColor
              }
              measurementChartAxisLabelFontColor={
                measurementChartAxisLabelFontColor
              }
              measurementChartCurrentValuesColors={
                measurementChartCurrentValuesColors
              }
              // Colored Slider
              coloredSliderBigValueFontSize={coloredSliderBigValueFontSize}
              coloredSliderBigValueFontColor={coloredSliderBigValueFontColor}
              coloredSliderLabelFontSize={coloredSliderLabelFontSize}
              coloredSliderLabelFontColor={coloredSliderLabelFontColor}
              coloredSliderArrowColor={coloredSliderArrowColor}
              coloredSliderUnitFontSize={coloredSliderUnitFontSize}
              // Slider Overview
              sliderCurrentFontColor={sliderCurrentFontColor}
              sliderMaximumFontColor={sliderMaximumFontColor}
              sliderGeneralFontColor={sliderGeneralFontColor}
              sliderCurrentColor={sliderCurrentColor}
              sliderMaximumColor={sliderMaximumColor}
              // Wert
              wertFontSize={wertFontSize}
              wertUnitFontSize={wertUnitFontSize}
              wertFontColor={wertFontColor}
              weatherWarningBackgroundColor={weatherWarningBgColor}
              weatherWarningHeadlineColor={weatherWarningHeadlineColor}
              weatherWarningInstructionsColor={weatherInstructionsColor}
              weatherWarningAlertDescriptionColor={weatherAlertDescriptionColor}
              weatherWarningDateColor={weatherDateColor}
              weatherWarningButtonBackgroundColor={
                weatherWarningButtonBackgroundColor
              }
              weatherWarningButtonIconColor={weatherWarningButtonIconColor}
              // ListView
              listviewBackgroundColor={listviewBackgroundColor}
              listviewItemBackgroundColor={listviewItemBackgroundColor}
              listviewItemBorderColor={listviewItemBorderColor}
              listviewItemBorderRadius={listviewItemBorderRadius}
              listviewItemBorderSize={listviewItemBorderSize}
              listviewTitleFontColor={listviewTitleFontColor}
              listviewTitleFontSize={listviewTitleFontSize}
              listviewTitleFontWeight={listviewTitleFontWeight}
              listviewDescriptionFontColor={listviewDescriptionFontColor}
              listviewDescriptionFontSize={listviewDescriptionFontSize}
              listviewCounterFontColor={listviewCounterFontColor}
              listviewCounterFontSize={listviewCounterFontSize}
              listviewFilterButtonBackgroundColor={
                listviewFilterButtonBackgroundColor
              }
              listviewFilterButtonBorderColor={listviewFilterButtonBorderColor}
              listviewFilterButtonFontColor={listviewFilterButtonFontColor}
              listviewFilterButtonHoverBackgroundColor={
                listviewFilterButtonHoverBackgroundColor
              }
              listviewArrowIconColor={listviewArrowIconColor}
              listviewBackButtonBackgroundColor={
                listviewBackButtonBackgroundColor
              }
              listviewBackButtonHoverBackgroundColor={
                listviewBackButtonHoverBackgroundColor
              }
              listviewBackButtonFontColor={listviewBackButtonFontColor}
              listviewMapButtonBackgroundColor={
                listviewMapButtonBackgroundColor
              }
              listviewMapButtonHoverBackgroundColor={
                listviewMapButtonHoverBackgroundColor
              }
              listviewMapButtonFontColor={listviewMapButtonFontColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
