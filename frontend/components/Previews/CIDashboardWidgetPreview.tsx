import { ReactElement } from 'react';
import '@/components/dependencies/quill.snow.css';
import { tabComponentSubTypeEnum, tabComponentTypeEnum } from '@/types';
import Radial180Chart from '@/ui/Charts/radial180/Radial180Chart';
import Radial360Chart from '@/ui/Charts/radial360/Radial360Chart';
import PieChart from '@/ui/Charts/PieChart';
import LineChart from '@/ui/Charts/LineChart';
import BarChart from '@/ui/Charts/BarChart';
import { DashboardValues } from '@/ui/DashboardValues';
import MeasurementComponent from '../MeasurementComponent';
import IconWithLink from '@/ui/IconWithLink';
import StageableChart from '@/ui/Charts/stageablechart/StageableChart';
import Slider from '@/ui/Charts/slider/Slider';
import React from 'react';
import { DUMMY_CHART_DATA } from '@/utils/objectHelper';
import WeatherWarning from '@/ui/WeatherWarning';
import SliderOverview from '@/ui/Charts/slideroverview/SliderOverview';

type CIDashboardWidgetPreviewProps = {
  componentType: string;
  componentSubType: string;
  informationTextFontSize: string;
  informationTextFontColor: string;

  iconWithLinkFontSize: string;
  iconWithLinkFontColor: string;
  iconWithLinkIconSize: string;
  iconWithLinkIconColor: string;

  degreeChart180FontSize: string;
  degreeChart180FontColor: string;
  degreeChart180BgColor: string;
  degreeChart180FillColor: string;
  degreeChart180UnitFontSize: string;

  degreeChart360FontSize: string;
  degreeChart360FontColor: string;
  degreeChart360BgColor: string;
  degreeChart360FillColor: string;
  degreeChart360UnitFontSize: string;

  stageableChartTicksFontSize: string;
  stageableChartTicksFontColor: string;
  stageableChartFontSize: string;
  stageableChartFontColor: string;

  pieChartFontSize: string;
  pieChartFontColor: string;
  pieChartCurrentValuesColors: string[];

  lineChartAxisLabelFontColor: string;
  lineChartAxisLabelSize: string;
  lineChartAxisLineColor: string;
  lineChartAxisTicksFontSize: string;
  lineChartCurrentValuesColors: string[];
  lineChartFilterColor: string;
  lineChartFilterTextColor: string;
  lineChartGridColor: string;
  lineChartLegendFontColor: string;
  lineChartLegendFontSize: string;
  lineChartTicksFontColor: string;

  barChartAxisLabelFontColor: string;
  barChartAxisLabelSize: string;
  barChartAxisLineColor: string;
  barChartAxisTicksFontSize: string;
  barChartCurrentValuesColors: string[];
  barChartFilterColor: string;
  barChartFilterTextColor: string;
  barChartGridColor: string;
  barChartLegendFontColor: string;
  barChartLegendFontSize: string;
  barChartTicksFontColor: string;

  measurementChartBigValueFontSize: string;
  measurementChartBigValueFontColor: string;
  measurementChartTopButtonBgColor: string;
  measurementChartTopButtonInactiveBgColor: string;
  measurementChartTopButtonHoverColor: string;
  measurementChartTopButtonFontColor: string;
  measurementChartCardsBgColor: string;
  measurementChartCardsFontColor: string;
  measurementChartCardsIconColors: string[];
  measurementChartBarColor: string;
  measurementChartLabelFontColor: string;
  measurementChartGridColor: string;
  measurementChartAxisLineColor: string;
  measurementChartAxisTicksFontColor: string;
  measurementChartAxisLabelFontColor: string;
  measurementChartCurrentValuesColors: string[];

  coloredSliderBigValueFontSize: string;
  coloredSliderBigValueFontColor: string;
  coloredSliderLabelFontSize: string;
  coloredSliderLabelFontColor: string;
  coloredSliderArrowColor: string;
  coloredSliderUnitFontSize: string;

  sliderCurrentFontColor: string;
  sliderMaximumFontColor: string;
  sliderGeneralFontColor: string;
  sliderCurrentColor: string;
  sliderMaximumColor: string;

  wertFontSize: string;
  wertUnitFontSize: string;
  wertFontColor: string;

  weatherWarningBackgroundColor: string;
  weatherWarningHeadlineColor: string;
  weatherWarningInstructionsColor: string;
  weatherWarningAlertDescriptionColor: string;
  weatherWarningDateColor: string;
  weatherWarningButtonBackgroundColor: string;
  weatherWarningButtonIconColor: string;
};

export default function CIDashboardWidgetPreview(
  props: CIDashboardWidgetPreviewProps,
): ReactElement {
  const {
    componentType,
    componentSubType,
    informationTextFontSize,
    informationTextFontColor,
    iconWithLinkFontSize,
    iconWithLinkFontColor,
    iconWithLinkIconSize,
    iconWithLinkIconColor,
    degreeChart180FontSize,
    degreeChart180FontColor,
    degreeChart180BgColor,
    degreeChart180FillColor,
    degreeChart180UnitFontSize,
    degreeChart360FontSize,
    degreeChart360FontColor,
    degreeChart360BgColor,
    degreeChart360FillColor,
    degreeChart360UnitFontSize,
    stageableChartTicksFontSize,
    stageableChartTicksFontColor,
    stageableChartFontSize,
    stageableChartFontColor,
    pieChartFontSize,
    pieChartFontColor,
    pieChartCurrentValuesColors,

    lineChartAxisLabelFontColor,
    lineChartAxisLabelSize,
    lineChartAxisLineColor,
    lineChartAxisTicksFontSize,
    lineChartCurrentValuesColors,
    lineChartFilterColor,
    lineChartFilterTextColor,
    lineChartGridColor,
    lineChartLegendFontColor,
    lineChartLegendFontSize,
    lineChartTicksFontColor,

    barChartAxisLabelFontColor,
    barChartAxisLabelSize,
    barChartAxisLineColor,
    barChartAxisTicksFontSize,
    barChartCurrentValuesColors,
    barChartFilterColor,
    barChartFilterTextColor,
    barChartGridColor,
    barChartLegendFontColor,
    barChartLegendFontSize,
    barChartTicksFontColor,

    measurementChartBigValueFontSize,
    measurementChartBigValueFontColor,

    measurementChartTopButtonBgColor,
    measurementChartTopButtonInactiveBgColor,
    measurementChartTopButtonHoverColor,
    measurementChartTopButtonFontColor,

    measurementChartCardsBgColor,
    measurementChartCardsFontColor,
    measurementChartCardsIconColors,

    measurementChartBarColor,
    measurementChartLabelFontColor,
    measurementChartGridColor,
    measurementChartAxisLineColor,
    measurementChartAxisTicksFontColor,
    measurementChartAxisLabelFontColor,
    measurementChartCurrentValuesColors,

    coloredSliderBigValueFontSize,
    coloredSliderBigValueFontColor,
    coloredSliderLabelFontSize,
    coloredSliderLabelFontColor,
    coloredSliderArrowColor,
    coloredSliderUnitFontSize,

    sliderCurrentFontColor,
    sliderMaximumFontColor,
    sliderGeneralFontColor,
    sliderCurrentColor,
    sliderMaximumColor,

    wertFontSize,
    wertUnitFontSize,
    wertFontColor,

    weatherWarningBackgroundColor,
    weatherWarningHeadlineColor,
    weatherWarningInstructionsColor,
    weatherWarningAlertDescriptionColor,
    weatherWarningDateColor,
    weatherWarningButtonBackgroundColor,
    weatherWarningButtonIconColor,
  } = props;

  // Static styling values
  const widgetStyle = {
    height: '400px',
    maxHeight: '100%',
    backgroundColor: '#1A1A1D',
    color: '#FFFFFF',
    borderColor: '#59647D',
  };

  return (
    <div
      className={`flex justify-center items-center content-center text-center rounded-lg border-2`}
      style={widgetStyle}
    >
      {/* TAB */}
      {componentType === tabComponentTypeEnum.diagram && (
        <div className="w-full h-full">
          {componentSubType === tabComponentSubTypeEnum.degreeChart180 && (
            <Radial180Chart
              minValue={0}
              maxValue={100}
              unit="cm"
              value={50} // Static value
              fontColor={degreeChart180FontColor}
              fontSize={degreeChart180FontSize}
              backgroundColor={degreeChart180BgColor}
              fillColor={degreeChart180FillColor}
              unitFontSize={degreeChart180UnitFontSize}
            />
          )}
          {componentSubType === tabComponentSubTypeEnum.stageableChart && (
            <StageableChart
              unit="%"
              tiles={5}
              minValue={0}
              maxValue={100}
              staticValues={[0]}
              staticValuesColors={['#808080']}
              staticValuesTexts={['Label']}
              value={25} // Static value
              fontColor={stageableChartFontColor}
              fontSize={stageableChartFontSize}
              ticksFontColor={stageableChartTicksFontColor}
              ticksFontSize={stageableChartTicksFontSize}
            />
          )}
          {componentSubType === tabComponentSubTypeEnum.degreeChart360 && (
            <Radial360Chart
              minValue={0}
              maxValue={100}
              unit="%"
              value={75} // Static value
              mainColor="#3D4760"
              secondaryColor="#3D4760"
              fontColor={degreeChart360FontColor}
              fontSize={degreeChart360FontSize}
              backgroundColor={degreeChart360BgColor}
              fillColor={degreeChart360FillColor}
              unitFontSize={degreeChart360UnitFontSize}
            />
          )}
          {componentSubType === tabComponentSubTypeEnum.pieChart && (
            <PieChart
              labels={[]}
              data={[30, 30, 30, 30, 30]} // Static values
              fontSize={pieChartFontSize}
              fontColor={pieChartFontColor}
              currentValuesColors={pieChartCurrentValuesColors}
              unit={''}
              pieChartRadius={70}
            />
          )}
          {componentSubType === tabComponentSubTypeEnum.lineChart && (
            <LineChart
              labels={undefined}
              data={DUMMY_CHART_DATA}
              xAxisLabel="Months"
              yAxisLabel="Value"
              allowImageDownload={false}
              allowZoom={false}
              isStepline={false}
              showLegend={true}
              staticValues={[]}
              axisLabelFontColor={lineChartAxisLabelFontColor}
              axisLineColor={lineChartAxisLineColor}
              axisTicksFontColor={lineChartTicksFontColor}
              staticValuesColors={[]}
              axisFontSize={lineChartAxisTicksFontSize || '11'}
              legendFontSize={lineChartLegendFontSize || '11'}
              legendFontColor={lineChartLegendFontColor || '#FFFFF'}
              axisLabelSize={lineChartAxisLabelSize || '11'}
              currentValuesColors={
                lineChartCurrentValuesColors || [
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                ]
              }
              gridColor={lineChartGridColor || '#fffff'}
              legendAlignment={'Top'}
              hasAdditionalSelection={true}
              filterColor={lineChartFilterColor || '#F1B434'}
              filterTextColor={lineChartFilterTextColor || '#1D2330'}
            />
          )}
          {componentSubType === tabComponentSubTypeEnum.barChart && (
            <BarChart
              labels={undefined}
              data={DUMMY_CHART_DATA}
              xAxisLabel="Quarter"
              yAxisLabel="Revenue"
              allowZoom={false}
              showLegend={true}
              showGrid={true}
              staticValues={[]}
              staticValuesColors={[]}
              fontColor={barChartTicksFontColor || '#fffff'}
              axisFontSize={barChartAxisTicksFontSize || '11'}
              axisColor={barChartAxisLineColor || '#fffff'}
              currentValuesColors={
                barChartCurrentValuesColors || [
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                  '#FFFFFF',
                ]
              }
              gridColor={barChartGridColor}
              legendFontSize={barChartLegendFontSize}
              axisLabelSize={barChartAxisLabelSize}
              legendAlignment={'Top'}
              legendFontColor={barChartLegendFontColor}
              hasAdditionalSelection={true}
              filterColor={barChartFilterColor || '#F1B434'}
              filterTextColor={barChartFilterTextColor || '#1D2330'}
              axisFontColor={barChartAxisLabelFontColor}
              isStackedChart={false}
            />
          )}
          {componentSubType === tabComponentSubTypeEnum.measurement && (
            <MeasurementComponent
              preview={true}
              dataValues={[
                ['T1', 10],
                ['T2', 20],
                ['T3', 30],
              ]}
              timeValues={['T1', 'T2', 'T3']}
              valueWarning={15}
              valueAlarm={25}
              valueMax={40}
              unit="kW"
              chartXAxisLabel="Time"
              chartYAxisLabel="Power"
              bigValueFontSize={measurementChartBigValueFontSize || '168'}
              bigValueFontColor={measurementChartBigValueFontColor || '#fffff'}
              topButtonBackgroundColor={
                measurementChartTopButtonBgColor || '#fffff'
              }
              topButtonInactiveBackgroundColor={
                measurementChartTopButtonInactiveBgColor || '#fffff'
              }
              topButtonHoverColor={
                measurementChartTopButtonHoverColor || '#fffff'
              }
              topButtonFontColor={
                measurementChartTopButtonFontColor || '#fffff'
              }
              cardsBackgroundColor={measurementChartCardsBgColor || '#fffff'}
              cardsFontColor={measurementChartCardsFontColor || '#fffff'}
              cardsIconColors={
                measurementChartCardsIconColors || [
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                ]
              }
              barColor={measurementChartBarColor || '#fffff'}
              labelFontColor={measurementChartLabelFontColor || '#fffff'}
              gridColor={measurementChartGridColor || '#fffff'}
              axisLineColor={measurementChartAxisLineColor || '#fffff'}
              axisTicksFontColor={
                measurementChartAxisTicksFontColor || '#fffff'
              }
              axisLabelFontColor={
                measurementChartAxisLabelFontColor || '#fffff'
              }
              currentValuesColors={
                measurementChartCurrentValuesColors || ['#FFDE21']
              }
            />
          )}
        </div>
      )}
      {componentType === tabComponentTypeEnum.slider && (
        <div className="w-full h-full">
          {componentSubType === tabComponentSubTypeEnum.coloredSlider && (
            <Slider
              unit="%"
              minValue={0}
              maxValue={100}
              staticValues={[0, 50, 100]} // Static values
              staticValuesColors={['#FF0000', '#00FF00', '#0000FF']}
              staticValuesTicks={[0, 50, 100]}
              staticValuesLogos={['', '', '']}
              staticValuesTexts={['Low', 'Medium', 'High']}
              iconColor="#000000"
              labelColor="#000000"
              value={50} // Static value
              bigValueFontSize={coloredSliderBigValueFontSize}
              bigValueFontColor={coloredSliderBigValueFontColor}
              labelFontSize={coloredSliderLabelFontSize}
              labelFontColor={coloredSliderLabelFontColor}
              arrowColor={coloredSliderArrowColor}
              unitFontSize={coloredSliderUnitFontSize}
            />
          )}
          {componentSubType === tabComponentSubTypeEnum.overviewSlider && (
            <SliderOverview
              data={[
                {
                  name: 'urn:ngsi-ld:ParkingSpot:',
                  values: [
                    ['status_isFreeSum', 0],
                    ['status_isOccupiedSum', 4],
                  ],
                },
              ]}
              currentCapacityAttribute={'status_isFreeSum'}
              maximumCapacityAttribute={'status_isOccupiedSum'}
              fontColorCurrent={sliderCurrentFontColor || '#000000'}
              fontColorMaximum={sliderMaximumFontColor || '#FFFFFF'}
              fontColorGeneral={sliderGeneralFontColor || '#FFFFFF'}
              colorCurrent={sliderCurrentColor || '#DC2626'}
              colorMaximum={sliderMaximumColor || '#000000'}
            />
          )}
        </div>
      )}
      {componentType === tabComponentTypeEnum.value && (
        <DashboardValues
          decimalPlaces={2}
          value={6.57} // Static value
          unit="kg"
          staticValues={[6.57]}
          staticValuesColors={['#FF4488']}
          staticValuesTexts={['Label']}
          staticValuesLogos={['faBars']}
          fontSize={wertFontSize || '50'}
          unitFontSize={wertUnitFontSize || '30'}
          fontColor={wertFontColor || '#FFFFF'}
        />
      )}
      {componentType === tabComponentTypeEnum.information && (
        <div className="h-full p-2 overflow-y-auto">
          {componentSubType === tabComponentSubTypeEnum.text && (
            <div
              style={{
                color: informationTextFontColor,
                fontSize: `${informationTextFontSize}px`,
              }}
              className="ql-editor content-center no-border-ql-editor"
              dangerouslySetInnerHTML={{
                __html: 'Static Information Text', // Static text
              }}
            />
          )}
          {componentSubType === tabComponentSubTypeEnum.iconWithLink && (
            <IconWithLink
              icon="Envelope"
              iconColor={iconWithLinkIconColor}
              iconSize={iconWithLinkIconSize}
              iconText="Static Link"
              iconUrl="https://example.com"
              fontColor={iconWithLinkFontColor}
              fontSize={`${iconWithLinkFontSize}px`}
            />
          )}
        </div>
      )}

      {componentType === tabComponentTypeEnum.weatherWarning && (
        <WeatherWarning
          data={[
            {
              subCategory: 'Amtliche WARNUNG vor LEICHTEM SCHNEEFALL',
              severity: 2,
              instructions:
                'Hinweis auf Rutschgefahr. Handlungsempfehlungen: Verhalten im Straßenverkehr anpassen Schnee/Glätte und mögliche Sichtbehinderungen',
              alertDescription:
                'Es tritt im Warnzeitraum oberhalb 800 m leichter Schneefall mit Mengen zwischen 1 cm und 5 cm auf. In Staulagen werden Mengen bis 10 cm erreicht. Verbreitet wird es glatt.',
              category: 'LEICHTEM SCHNEEFALL',
              validFrom: new Date(Date.now() - 86400000).toString(), // Yesterday
              validTo: new Date(Date.now() + 31536000000).toString(), // Next year
            },
            {
              subCategory: 'Amtliche WARNUNG vor LEICHTEM SCHNEEFALL',
              severity: 2,
              instructions:
                'Hinweis auf Rutschgefahr. Handlungsempfehlungen: Verhalten im Straßenverkehr anpassen Schnee/Glätte und mögliche Sichtbehinderungen',
              alertDescription:
                'Es tritt im Warnzeitraum oberhalb 800 m leichter Schneefall mit Mengen zwischen 1 cm und 5 cm auf. In Staulagen werden Mengen bis 10 cm erreicht. Verbreitet wird es glatt.',
              category: 'LEICHTEM SCHNEEFALL',
              validFrom: new Date(Date.now() - 86400000).toString(), // Yesterday
              validTo: new Date(Date.now() + 31536000000).toString(), // Next year
            },
          ]}
          backgroundColor={weatherWarningBackgroundColor}
          headlineColor={weatherWarningHeadlineColor}
          instructionsColor={weatherWarningInstructionsColor}
          alertDescriptionColor={weatherWarningAlertDescriptionColor}
          dateColor={weatherWarningDateColor}
          buttonBackgroundColor={weatherWarningButtonBackgroundColor}
          buttonIconColor={weatherWarningButtonIconColor}
        />
      )}
    </div>
  );
}
