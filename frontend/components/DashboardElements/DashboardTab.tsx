import { CSSProperties, ReactElement } from 'react';
import nextDynamic from 'next/dynamic';

import '@/components/dependencies/quill.snow.css';
import '../../app/quill.css';
import {
  CorporateInfo,
  MapModalLegend,
  MapModalWidget,
  MapObject,
  QueryDataWithAttributes,
  Tab,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
  TabWithQuery,
  WidgetWithContent,
} from '@/types';
import Radial180Chart from '@/ui/Charts/radial180/Radial180Chart';
import Radial360Chart from '@/ui/Charts/radial360/Radial360Chart';
import PieChart from '@/ui/Charts/PieChart';
import PieChartDynamic from '@/ui/Charts/PieChartDynamic';
import LineChart from '@/ui/Charts/LineChart';
import BarChart from '@/ui/Charts/BarChart';
import ImageComponent from '@/ui/ImageComponent';
import { DashboardValues } from '@/ui/DashboardValues';
import IFrameComponent from '@/ui/IFrameComponent';
import MeasurementComponent from '../MeasurementComponent';
import IconWithLink from '@/ui/IconWithLink';
import { getCorporateInfosWithLogos } from '@/app/actions';
import StageableChart from '@/ui/Charts/stageablechart/StageableChart';
import Slider from '@/ui/Charts/slider/Slider';
import SliderOverview from '@/ui/Charts/slideroverview/SliderOverview';
import DashboardWidget from './DashboardWidget';
import { isTabOfTypeCombinedWidget } from '@/utils/tabTypeHelper';
import {
  combineQueryData,
  combineWidgetAttributes,
} from '@/utils/combinedMapDataHelper';
import { DUMMY_CHART_DATA } from '@/utils/objectHelper';
import WeatherWarning from '@/ui/WeatherWarning';
import NoDataWarning from '@/ui/NoDataWarning';
import { MapModalChartStyle } from '@/types/mapRelatedModels';
import { ListView } from '../listview/listview';

type DashboardTabProps = {
  tab: Tab;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabData: any;
  tenant: string | undefined;
  isCombinedWidget?: boolean;
};
const Map = nextDynamic(() => import('@/components/Map/Map'), {
  // ssr: false,
});
const MapDynamic = nextDynamic(() => import('@/components/Map/MapDynamic'), {
  // ssr: false,
});

export default async function DashboardTab(
  props: DashboardTabProps,
): Promise<ReactElement> {
  const { tab, tabData, tenant } = props;
  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);

  //Dynamic Styling
  const fontStyle: CSSProperties = {
    color: ciColors.informationTextFontColor ?? '#FFF',
    fontSize: ciColors.informationTextFontSize,
  };

  const menuStyle: CSSProperties = {
    backgroundColor: ciColors.menuPrimaryColor || '#3D4760',
    color: ciColors.menuFontColor || '#FFF',
  };

  const chartStyle: MapModalChartStyle = {
    degreeChart180BgColor: ciColors.degreeChart180BgColor,
    degreeChart180FillColor: ciColors.degreeChart180FillColor,
    degreeChart180FontColor: ciColors.degreeChart180FontColor,
    degreeChart180FontSize: ciColors.degreeChart180FontSize,
    degreeChart180UnitFontSize: ciColors.degreeChart180UnitFontSize,
    stageableChartFontColor: ciColors.stageableChartFontColor,
    stageableChartFontSize: ciColors.stageableChartFontSize,
    stageableChartTicksFontColor: ciColors.stageableChartTicksFontColor,
    stageableChartTicksFontSize: ciColors.stageableChartTicksFontSize,
  };

  // Stop if no data exists for tab
  const isSpecialType = [
    tabComponentTypeEnum.information,
    tabComponentTypeEnum.iframe,
    tabComponentTypeEnum.image,
    tabComponentTypeEnum.combinedComponent,
  ].includes(tab.componentType as tabComponentTypeEnum);

  const hasCombinedWidgetData =
    !isTabOfTypeCombinedWidget(tab) ||
    (tabData?.combinedWidgets && tabData.combinedWidgets.length > 0);

  if (tabData === null || (!isSpecialType && !hasCombinedWidgetData)) {
    return (
      <NoDataWarning
        iconColor={ciColors.headerPrimaryColor}
        fontColor={ciColors.widgetFontColor}
      />
    );
  }

  let combinedMapData;
  let combinedQueryData;

  if (tab?.componentType === tabComponentTypeEnum.map) {
    const combinedWidgets: WidgetWithContent[] = isTabOfTypeCombinedWidget(tab)
      ? tabData.combinedWidgets
      : [];

    // combine all attributes other than queryData
    combinedMapData = combineWidgetAttributes(combinedWidgets);

    const isSingleMap =
      tab.componentType === tabComponentTypeEnum.map &&
      tab.componentSubType !== tabComponentSubTypeEnum.combinedMap;
    const singleMapQueryData = (tab as TabWithQuery).query?.queryData;
    const mapFilterAttribute = tab.mapFilterAttribute || '';

    // merge queryData from all combinedWidgets
    const allWidgetQueryData = combinedWidgets.map(
      (widget) => (widget?.tabs?.[0] as TabWithQuery)?.query?.queryData ?? [],
    );

    // merge queryData and format to use in filter modal list
    combinedQueryData = combineQueryData(
      isSingleMap ? [singleMapQueryData] : allWidgetQueryData,
      isSingleMap
        ? [mapFilterAttribute]
        : (combinedMapData.mapFilterAttribute as string[]),
    );
  }
  return (
    <div
      className={`w-full h-full justify-center items-center ${tab.componentType === tabComponentTypeEnum.combinedComponent ? 'p-4' : ''}`}
    >
      {tab.componentType === tabComponentTypeEnum.diagram && (
        <div className="w-full h-full">
          {tab.componentSubType === tabComponentSubTypeEnum.degreeChart180 && (
            <Radial180Chart
              minValue={tab.chartMinimum || 0}
              maxValue={tab.chartMaximum || 100}
              unit={tab.chartUnit || ''}
              value={
                tabData?.chartValues?.length > 0 ? tabData.chartValues[0] : 25
              }
              fontColor={ciColors.degreeChart180FontColor || '#fff'}
              fontSize={ciColors.degreeChart180FontSize || '11'}
              backgroundColor={ciColors.degreeChart180BgColor}
              fillColor={ciColors.degreeChart180FillColor}
              unitFontSize={ciColors.degreeChart180UnitFontSize}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.degreeChart360 && (
            <Radial360Chart
              minValue={tab.chartMinimum || 0}
              maxValue={tab.chartMaximum || 100}
              unit={tab.chartUnit || ''}
              value={
                tabData?.chartValues?.length > 0 ? tabData.chartValues[0] : 25
              }
              mainColor={ciColors.dashboardSecondaryColor || '#3D4760'}
              fontColor={ciColors.dashboardFontColor || '#FFF'}
              fontSize={ciColors.degreeChart360FontSize || '11'}
              backgroundColor={ciColors.degreeChart360BgColor}
              fillColor={ciColors.degreeChart360FillColor}
              unitFontSize={ciColors.degreeChart360UnitFontSize}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.pieChart && (
            <PieChart
              labels={
                tabData?.chartData?.map(
                  (item: { name: string }) => item.name,
                ) ||
                tab.chartLabels ||
                []
              }
              data={
                tabData?.chartData?.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (item: { values: any[][] }) => item.values[0]?.[1],
                ) ||
                tabData?.chartValues ||
                []
              }
              fontSize={ciColors.pieChartFontSize}
              fontColor={ciColors.pieChartFontColor}
              currentValuesColors={
                ciColors.pieChartCurrentValuesColors || [
                  '#4CAF50',
                  '#2196F3',
                  '#FF9800',
                  '#F44336',
                  '#9C27B0',
                ]
              }
              unit={tab.chartUnit || ''}
              allowImageDownload={tab.chartAllowImageDownload || false}
              pieChartRadius={tab.chartPieRadius || 70}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.pieChartDynamic && (
            <PieChartDynamic
              tab={tab}
              tabData={tabData}
              corporateInfo={ciColors}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.lineChart && (
            <LineChart
              chartYAxisScaleChartMinValue={
                tab?.chartYAxisScaleChartMinValue !== undefined &&
                tab?.chartYAxisScaleChartMinValue !== null
                  ? tab.chartYAxisScaleChartMinValue
                  : undefined
              }
              chartYAxisScaleChartMaxValue={
                tab?.chartYAxisScaleChartMaxValue !== undefined &&
                tab?.chartYAxisScaleChartMaxValue !== null
                  ? tab.chartYAxisScaleChartMaxValue
                  : undefined
              }
              chartYAxisScale={
                tab?.chartYAxisScale !== undefined &&
                tab?.chartYAxisScale !== null
                  ? tab.chartYAxisScale
                  : undefined
              }
              chartDateRepresentation={
                tab?.chartDateRepresentation || 'Default'
              }
              labels={tab.chartLabels}
              data={tabData.chartData || DUMMY_CHART_DATA}
              xAxisLabel={tab.chartXAxisLabel || ''}
              yAxisLabel={tab.chartYAxisLabel || ''}
              allowImageDownload={tab.chartAllowImageDownload || false}
              allowZoom={tab.mapAllowZoom || false}
              isStepline={tab.isStepline || false}
              isStackedChart={tab?.isStackedChart || false}
              showLegend={tab.showLegend || false}
              staticValues={tab.chartStaticValues || []}
              staticValuesColors={tab.chartStaticValuesColors || []}
              axisLabelFontColor={
                ciColors.lineChartAxisLabelFontColor || '#FFF'
              }
              axisLineColor={ciColors.lineChartAxisLineColor || '#FFF'}
              axisFontSize={ciColors.lineChartAxisTicksFontSize || '15'}
              gridColor={ciColors.lineChartGridColor || '#FFFFF'}
              legendFontSize={ciColors.lineChartLegendFontSize || '12'}
              legendFontColor={ciColors.lineChartLegendFontColor || '#FFFFF'}
              axisLabelSize={ciColors.lineChartAxisLabelSize || '13'}
              currentValuesColors={
                ciColors.lineChartCurrentValuesColors || [
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                ]
              }
              axisTicksFontColor={ciColors.lineChartTicksFontColor}
              legendAlignment={tab.chartLegendAlign || 'Top'}
              hasAdditionalSelection={tab.chartHasAdditionalSelection || false}
              filterColor={ciColors.lineChartFilterColor || '#F1B434'}
              filterTextColor={ciColors.lineChartFilterTextColor || '#1D2330'}
              decimalPlaces={tab?.decimalPlaces || 0}
              chartHasAutomaticZoom={tab?.chartHasAutomaticZoom}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.barChart && (
            <BarChart
              chartYAxisScaleChartMinValue={
                tab?.chartYAxisScaleChartMinValue !== undefined &&
                tab?.chartYAxisScaleChartMinValue !== null
                  ? tab.chartYAxisScaleChartMinValue
                  : undefined
              }
              chartYAxisScaleChartMaxValue={
                tab?.chartYAxisScaleChartMaxValue !== undefined &&
                tab?.chartYAxisScaleChartMaxValue !== null
                  ? tab.chartYAxisScaleChartMaxValue
                  : undefined
              }
              chartYAxisScale={
                tab?.chartYAxisScale !== undefined &&
                tab?.chartYAxisScale !== null
                  ? tab.chartYAxisScale
                  : undefined
              }
              chartDateRepresentation={
                tab?.chartDateRepresentation || 'Default'
              }
              labels={tab.chartLabels}
              data={tabData.chartData || DUMMY_CHART_DATA}
              xAxisLabel={tab.chartXAxisLabel || ''}
              yAxisLabel={tab.chartYAxisLabel || ''}
              allowImageDownload={tab.chartAllowImageDownload || false}
              allowZoom={tab.mapAllowZoom || false}
              showLegend={tab.showLegend || false}
              staticValues={tab.chartStaticValues || []}
              staticValuesColors={tab.chartStaticValuesColors || []}
              fontColor={ciColors.dashboardFontColor || '#FFFFF'}
              axisColor={ciColors.barChartAxisLineColor || '#FFFFF'}
              axisFontSize={ciColors.barChartAxisTicksFontSize || '14'}
              gridColor={ciColors.barChartGridColor || '#FFFFF'}
              legendFontSize={ciColors.barChartLegendFontSize || '14'}
              axisLabelSize={ciColors.barChartAxisLabelSize || '14'}
              currentValuesColors={
                ciColors.barChartCurrentValuesColors || [
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                  '#70AAFF',
                ]
              }
              showGrid={false}
              legendAlignment={tab.chartLegendAlign || 'Top'}
              hasAdditionalSelection={tab.chartHasAdditionalSelection || false}
              isStackedChart={tab.isStackedChart || false}
              legendFontColor={ciColors.lineChartLegendFontColor || '#FFFFFF'}
              filterColor={ciColors.barChartFilterColor || '#F1B434'}
              filterTextColor={ciColors.barChartFilterTextColor || '#1D2330'}
              axisFontColor={ciColors.barChartAxisLabelFontColor || '#FFF'}
              decimalPlaces={tab?.decimalPlaces || 0}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.measurement && (
            <MeasurementComponent
              preview={false}
              dataValues={
                tabData?.chartData?.length > 0
                  ? tabData.chartData[0].values
                  : []
              }
              timeValues={
                tab.chartLabels && tab.chartLabels.length > 0
                  ? tab.chartLabels
                  : []
              }
              valueWarning={
                tab.chartStaticValues && tab.chartStaticValues.length > 0
                  ? tab.chartStaticValues[0]
                  : 0
              }
              valueAlarm={
                tab.chartStaticValues && tab.chartStaticValues.length > 1
                  ? tab.chartStaticValues[1]
                  : 0
              }
              valueMax={
                tab.chartStaticValues && tab.chartStaticValues.length > 2
                  ? tab.chartStaticValues[2]
                  : 0
              }
              unit={tab.chartUnit ? tab.chartUnit : ''}
              bigValueFontSize={
                ciColors.measurementChartBigValueFontSize || '120'
              }
              bigValueFontColor={
                ciColors.measurementChartBigValueFontColor || '#FF5733'
              }
              topButtonBackgroundColor={
                ciColors.measurementChartTopButtonBgColor || '#2C3E50'
              }
              topButtonInactiveBackgroundColor={
                ciColors.measurementChartTopButtonInactiveBgColor || '#BDC3C7'
              }
              topButtonHeaderSecondaryColor={
                ciColors.headerSecondaryColor || '#3D4760'
              }
              topButtonHoverColor={
                ciColors.measurementChartTopButtonHoverColor || '#1ABC9C'
              }
              topButtonFontColor={
                ciColors.measurementChartTopButtonFontColor || '#ECF0F1'
              }
              cardsBackgroundColor={
                ciColors.measurementChartCardsBgColor || '#34495E'
              }
              cardsFontColor={ciColors.measurementChartCardsFontColor || '#FFF'}
              cardsIconColors={
                ciColors.measurementChartCardsIconColors || [
                  '#3498DB',
                  '#3498DB',
                  '#3498DB',
                  '#3498DB',
                ]
              }
              barColor={ciColors.measurementChartBarColor || '#2980B9'}
              labelFontColor={
                ciColors.measurementChartLabelFontColor || '#2C3E50'
              }
              gridColor={ciColors.measurementChartGridColor || '#D5D8DC'}
              axisLineColor={
                ciColors.measurementChartAxisLineColor || '#7F8C8D'
              }
              axisTicksFontColor={
                ciColors.measurementChartAxisTicksFontColor || '#95A5A6'
              }
              axisLabelFontColor={
                ciColors.measurementChartAxisLabelFontColor || '#34495E'
              }
              currentValuesColors={
                ciColors.measurementChartCurrentValuesColors || [
                  '#E67E22',
                  '#3498DB',
                  '#2ECC71',
                  '#E74C3C',
                ]
              }
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.stageableChart && (
            <StageableChart
              unit={tab.chartUnit || ''}
              tiles={tab.tiles || 5}
              minValue={tab.chartMinimum || 0}
              maxValue={tab.chartMaximum || 100}
              staticValues={tab.chartStaticValues || []}
              staticValuesColors={tab.chartStaticValuesColors || []}
              staticValuesTexts={tab.chartStaticValuesTexts || ['Label']}
              value={
                tabData?.chartValues?.length > 0 ? tabData.chartValues[0] : 25
              }
              fontColor={ciColors.stageableChartFontColor || '#FFFFF'}
              fontSize={ciColors.stageableChartFontSize || '32'}
              ticksFontColor={ciColors.stageableChartTicksFontColor || '#FFFFF'}
              ticksFontSize={ciColors.stageableChartTicksFontSize || '20'}
            />
          )}
        </div>
      )}
      {tab.componentType === tabComponentTypeEnum.slider && (
        <div className="h-full p-2 overflow-y-auto">
          {tab.componentSubType === tabComponentSubTypeEnum.coloredSlider && (
            <div className="flex w-full h-full justify-center items-center px-6">
              <Slider
                unit={tab.chartUnit || ''}
                minValue={tab.chartMinimum || 0}
                maxValue={tab.chartMaximum || 100}
                staticValues={tab.rangeStaticValuesMax || []}
                staticValuesColors={tab.rangeStaticValuesColors || ['#808080']}
                staticValuesTicks={tab.chartStaticValuesTicks || []}
                staticValuesLogos={tab.chartStaticValuesLogos || []}
                staticValuesTexts={tab.chartStaticValuesTexts || []}
                iconColor={tab.iconColor || '#000000'}
                labelColor={tab.labelColor || '#000000'}
                value={
                  tabData?.chartValues?.length > 0 ? tabData.chartValues[0] : 25
                }
                bigValueFontSize={
                  ciColors.coloredSliderBigValueFontSize || '50'
                }
                bigValueFontColor={
                  ciColors.coloredSliderBigValueFontColor || '#FFFFF'
                }
                labelFontSize={ciColors.coloredSliderLabelFontSize || '25'}
                labelFontColor={
                  ciColors.coloredSliderLabelFontColor || '#FFFFF'
                }
                arrowColor={ciColors.coloredSliderArrowColor || '#FFFFF'}
                unitFontSize={ciColors.coloredSliderUnitFontSize || '35'}
              />
            </div>
          )}

          {tab.componentSubType === tabComponentSubTypeEnum.overviewSlider && (
            <SliderOverview
              data={tabData?.chartData || []}
              currentCapacityAttribute={tab.sliderCurrentAttribute || ''}
              maximumCapacityAttribute={tab.sliderMaximumAttribute || ''}
              fontColorCurrent={ciColors.sliderCurrentFontColor || '#000000'}
              fontColorMaximum={ciColors.sliderMaximumFontColor || '#FFFFFF'}
              fontColorGeneral={ciColors.sliderGeneralFontColor || '#FFFFFF'}
              colorCurrent={ciColors.sliderCurrentColor || '#DC2626'}
              colorMaximum={ciColors.sliderMaximumColor || '#000000'}
            />
          )}
        </div>
      )}
      {tab.componentType === tabComponentTypeEnum.value && (
        <DashboardValues
          decimalPlaces={tab.decimalPlaces || 0}
          value={
            tabData?.chartValues?.length > 0 &&
            tabData.chartValues[0] !== undefined &&
            tabData.chartValues[0] !== null
              ? tabData.chartValues[0]
              : tab.chartValues
                ? tab.chartValues[0]
                : tabData.textValue
                  ? tabData.textValue
                  : 6.5791231231321312
          }
          unit={tab.chartUnit || ''}
          staticValues={tab.chartStaticValues || []}
          staticValuesColors={tab.chartStaticValuesColors || []}
          staticValuesTexts={tab.chartStaticValuesTexts || []}
          staticValuesLogos={tab.chartStaticValuesLogos || []}
          fontSize={ciColors.wertFontSize || '50'}
          unitFontSize={ciColors.wertUnitFontSize || '30'}
          fontColor={ciColors.wertFontColor || '#FFF'}
        />
      )}
      {tab.componentType === tabComponentTypeEnum.information && (
        <div className="h-full w-full p-2 overflow-y-auto">
          {tab.componentSubType === tabComponentSubTypeEnum.text && (
            <div
              style={fontStyle}
              className={`h-full w-full ql-editor no-border-ql-editor`}
              dangerouslySetInnerHTML={{
                __html: tab.textValue || '',
              }}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.iconWithLink && (
            <IconWithLink
              icon={tab.icon || ''}
              iconColor={tab.iconColor}
              iconText={tab.iconText}
              iconUrl={tab.iconUrl || ''}
            />
          )}
        </div>
      )}
      {tab.componentType === tabComponentTypeEnum.map && (
        <div id="map" className="h-full w-full">
          {tab.componentSubType !== tabComponentSubTypeEnum.geoJSONDynamic ? (
            <>
              {tab.componentSubType === tabComponentSubTypeEnum.combinedMap ? (
                <Map
                  data={combinedMapData?.mapObject as MapObject[]}
                  combinedMapData={combinedMapData}
                  mapAllowFilter={true}
                  combinedQueryData={
                    combinedQueryData as QueryDataWithAttributes[]
                  }
                  mapAllowPopups={combinedMapData?.mapAllowPopups as boolean}
                  mapAllowScroll={combinedMapData?.mapAllowScroll as boolean}
                  mapAllowZoom={combinedMapData?.mapAllowZoom as boolean}
                  mapAllowLegend={combinedMapData?.mapAllowLegend as boolean}
                  mapLegendValues={
                    combinedMapData?.mapLegendValues as MapModalLegend[]
                  }
                  mapLegendDisclaimer={
                    combinedMapData?.mapLegendDisclaimer as string[]
                  }
                  mapActiveMarkerColor={
                    combinedMapData?.mapActiveMarkerColor as string[]
                  }
                  mapMarkerColor={combinedMapData?.mapMarkerColor as string[]}
                  mapMarkerIcon={combinedMapData?.mapMarkerIcon as string[]}
                  mapMarkerIconColor={
                    combinedMapData?.mapMarkerIconColor as string[]
                  }
                  mapShapeOption={combinedMapData?.mapShapeOption as string[]}
                  mapShapeColor={combinedMapData?.mapShapeColor as string[]}
                  mapDisplayMode={combinedMapData?.mapDisplayMode as string[]}
                  mapWidgetValues={
                    combinedMapData?.mapWidgetValues as MapModalWidget[]
                  }
                  mapCombinedWmsUrl={tab.mapCombinedWmsUrl || ''}
                  mapCombinedWmsLayer={tab.mapCombinedWmsLayer || ''}
                  mapNames={(combinedMapData?.mapNames as string[]) || []}
                  mapGeoJSON={tab.mapGeoJSON || ''}
                  mapGeoJSONSensorBasedColors={
                    tab.mapGeoJSONSensorBasedColors || false
                  }
                  mapGeoJSONBorderColor={tab.mapGeoJSONBorderColor || '#3388ff'}
                  mapGeoJSONFillColor={tab.mapGeoJSONFillColor || '#3388ff'}
                  mapGeoJSONSelectionBorderColor={
                    tab.mapGeoJSONSelectionBorderColor || '#0b63de'
                  }
                  mapGeoJSONSelectionFillColor={
                    tab.mapGeoJSONSelectionFillColor || '#0b63de'
                  }
                  mapGeoJSONHoverBorderColor={
                    tab.mapGeoJSONHoverBorderColor || '#0347a6'
                  }
                  mapGeoJSONHoverFillColor={
                    tab.mapGeoJSONHoverFillColor || '#0347a6'
                  }
                  mapType={tab.componentSubType || ''}
                  isFullscreenMap={false}
                  mapAttributeForValueBased={
                    combinedMapData?.mapAttributeForValueBased as string[]
                  }
                  mapIsIconColorValueBased={
                    combinedMapData?.mapIsIconColorValueBased as boolean[]
                  }
                  staticValues={
                    combinedMapData?.chartStaticValues as number[][]
                  }
                  staticValuesColors={
                    combinedMapData?.chartStaticValuesColors as string[][]
                  }
                  chartStyle={chartStyle}
                  menuStyle={menuStyle}
                  ciColors={ciColors}
                />
              ) : (
                <Map
                  mapMaxZoom={tab.mapMaxZoom ? tab.mapMaxZoom : 18}
                  mapMinZoom={tab.mapMinZoom ? tab.mapMinZoom : 0}
                  mapAllowPopups={
                    tab.mapAllowPopups ? tab.mapAllowPopups : false
                  }
                  mapStandardZoom={
                    tab.mapStandardZoom ? tab.mapStandardZoom : 13
                  }
                  mapAllowZoom={tab.mapAllowZoom ? tab.mapAllowZoom : false}
                  mapAllowScroll={
                    tab.mapAllowScroll ? tab.mapAllowScroll : false
                  }
                  mapMarkerColor={
                    tab.mapMarkerColor ? tab.mapMarkerColor : '#257dc9'
                  }
                  mapMarkerIcon={tab.mapMarkerIcon ? tab.mapMarkerIcon : ''}
                  mapMarkerIconColor={
                    tab.mapMarkerIconColor ? tab.mapMarkerIconColor : '#FFF'
                  }
                  mapLongitude={tab.mapLongitude ? tab.mapLongitude : 13.404954}
                  mapLatitude={tab.mapLatitude ? tab.mapLatitude : 52.520008}
                  mapActiveMarkerColor={
                    tab.mapActiveMarkerColor
                      ? tab.mapActiveMarkerColor
                      : '#FF0000'
                  }
                  data={tabData?.mapObject || []}
                  mapShapeOption={
                    tab.mapShapeOption ? tab.mapShapeOption : 'Rectangle'
                  }
                  mapDisplayMode={
                    tab.mapDisplayMode ? tab.mapDisplayMode : 'Only pin'
                  }
                  mapShapeColor={
                    tab.mapShapeColor ? tab.mapShapeColor : '#FF0000'
                  }
                  isFullscreenMap={false}
                  mapAllowFilter={tab.mapAllowFilter || false}
                  mapFilterAttribute={tab.mapFilterAttribute || ''}
                  mapGeoJSON={tab.mapGeoJSON || ''}
                  mapGeoJSONSensorBasedColors={
                    tab.mapGeoJSONSensorBasedColors || false
                  }
                  mapGeoJSONBorderColor={tab.mapGeoJSONBorderColor || '#3388ff'}
                  mapGeoJSONFillColor={tab.mapGeoJSONFillColor || '#3388ff'}
                  mapGeoJSONSelectionBorderColor={
                    tab.mapGeoJSONSelectionBorderColor || '#0b63de'
                  }
                  mapGeoJSONSelectionFillColor={
                    tab.mapGeoJSONSelectionFillColor || '#0b63de'
                  }
                  mapGeoJSONHoverBorderColor={
                    tab.mapGeoJSONHoverBorderColor || '#0347a6'
                  }
                  mapGeoJSONHoverFillColor={
                    tab.mapGeoJSONHoverFillColor || '#0347a6'
                  }
                  mapType={tab.componentSubType || ''}
                  combinedQueryData={
                    combinedQueryData as QueryDataWithAttributes[]
                  }
                  mapAllowLegend={tab.mapAllowLegend || false}
                  mapLegendValues={
                    tab.mapLegendValues ? tab.mapLegendValues : []
                  }
                  mapLegendDisclaimer={
                    tab.mapLegendDisclaimer ? [tab.mapLegendDisclaimer] : []
                  }
                  mapAttributeForValueBased={
                    tab.mapAttributeForValueBased || ''
                  }
                  mapFormSizeFactor={tab.mapFormSizeFactor || 1}
                  mapIsFormColorValueBased={
                    tab.mapIsFormColorValueBased || false
                  }
                  mapIsIconColorValueBased={
                    tab.mapIsIconColorValueBased || false
                  }
                  staticValues={tab.chartStaticValues || []}
                  staticValuesColors={tab.chartStaticValuesColors || []}
                  mapWmsUrl={tab.mapWmsUrl || ''}
                  mapWmsLayer={tab.mapWmsLayer || ''}
                  menuStyle={menuStyle}
                  ciColors={ciColors}
                />
              )}
            </>
          ) : (
            <MapDynamic
              isCombinedMap={false}
              tabData={tabData}
              chartStyle={chartStyle}
              menuStyle={menuStyle}
              ciColors={ciColors}
              tab={tab}
              combinedMapData={combinedMapData}
            />
          )}
        </div>
      )}
      {tab.componentType === tabComponentTypeEnum.iframe && (
        <IFrameComponent src={tab.iFrameUrl || ''} />
      )}
      {tab.componentType === tabComponentTypeEnum.image && (
        <ImageComponent
          imageBase64={tab?.imageSrc || ''}
          imageUrl={tab.imageUrl || ''}
          imageAllowJumpoff={tab.imageAllowJumpoff || false}
          imageJumpoffUrl={tab.imageJumpoffUrl || ''}
        />
      )}
      {tab.componentType === tabComponentTypeEnum.weatherWarning && (
        <WeatherWarning
          data={tab.weatherWarnings || []}
          backgroundColor={ciColors.weatherWarningBgColor || '#3498DB'}
          headlineColor={ciColors.weatherWarningHeadlineColor || '#E74C3C'}
          instructionsColor={ciColors.weatherInstructionsColor || '#000000'}
          alertDescriptionColor={
            ciColors.weatherAlertDescriptionColor || '#000000'
          }
          dateColor={ciColors.weatherDateColor || '#FFFFFF'}
          buttonBackgroundColor={
            ciColors.weatherWarningButtonBackgroundColor || '#2C3E50'
          }
          buttonIconColor={ciColors.weatherWarningButtonIconColor || '#FFFFFF'}
        />
      )}
      {isTabOfTypeCombinedWidget(tab) &&
        tab.componentSubType !== tabComponentSubTypeEnum.combinedMap && (
          <div
            className={`w-full flex flex-wrap ${
              tab.isLayoutVertical !== undefined
                ? tab.isLayoutVertical
                  ? 'lg:flex-row gap-4 justify-center'
                  : 'flex-col items-center gap-4'
                : 'flex-col items-center gap-4'
            }`}
          >
            {tabData?.combinedWidgets?.length > 0 &&
              tabData.combinedWidgets.map(
                (widget: WidgetWithContent, index: number) => (
                  <div
                    key={`widget-in-panel-${widget.id}-${index}`}
                    className={`${
                      tab.isLayoutVertical
                        ? `w-full lg:w-[${
                            tabData.combinedWidgets?.length === 2
                              ? '49%'
                              : tabData.combinedWidgets?.length === 3
                                ? '32%'
                                : tabData.combinedWidgets?.length === 4
                                  ? '24%'
                                  : tabData.combinedWidgets?.length === 5
                                    ? '19%'
                                    : '100%'
                          }] max-w-[200px] transition-all duration-200`
                        : 'w-full'
                    }`}
                  >
                    <DashboardWidget
                      widget={widget}
                      tenant={tenant}
                      isCombinedWidget={true}
                    />
                  </div>
                ),
              )}
          </div>
        )}
      {tab.componentType === tabComponentTypeEnum.listview && (
        <ListView
          data={tabData?.listviewData || []}
          listName={tab.listviewName || ''}
          isFilteringAllowed={tab.listviewIsFilteringAllowed || false}
          poiBackgroundColor={ciColors.listviewBackgroundColor || '#F9FAFB'}
          headlineYellowColor={ciColors.listviewTitleFontColor || '#FCD34D'}
          headlineGrayColor={ciColors.listviewDescriptionFontColor || '#6B7280'}
          iconColor={ciColors.listviewArrowIconColor || '#374151'}
          listviewItemBackgroundColor={
            ciColors.listviewItemBackgroundColor || '#FFFFFF'
          }
          listviewItemBorderColor={
            ciColors.listviewItemBorderColor || '#E5E7EB'
          }
          listviewItemBorderRadius={ciColors.listviewItemBorderRadius || '8px'}
          listviewItemBorderSize={ciColors.listviewItemBorderSize || '1px'}
          listviewTitleFontSize={ciColors.listviewTitleFontSize || '16px'}
          listviewTitleFontWeight={ciColors.listviewTitleFontWeight || '600'}
          listviewDescriptionFontSize={
            ciColors.listviewDescriptionFontSize || '14px'
          }
          listviewCounterFontColor={
            ciColors.listviewCounterFontColor || '#6B7280'
          }
          listviewCounterFontSize={ciColors.listviewCounterFontSize || '14px'}
          listviewFilterButtonBackgroundColor={
            ciColors.listviewFilterButtonBackgroundColor || '#FFFFFF'
          }
          listviewFilterButtonBorderColor={
            ciColors.listviewFilterButtonBorderColor || '#D1D5DB'
          }
          listviewFilterButtonFontColor={
            ciColors.listviewFilterButtonFontColor || '#374151'
          }
          listviewFilterButtonHoverBackgroundColor={
            ciColors.listviewFilterButtonHoverBackgroundColor || '#F9FAFB'
          }
          listviewBackButtonBackgroundColor={
            ciColors.listviewBackButtonBackgroundColor || '#3B82F6'
          }
          listviewBackButtonHoverBackgroundColor={
            ciColors.listviewBackButtonHoverBackgroundColor || '#2563EB'
          }
          listviewBackButtonFontColor={
            ciColors.listviewBackButtonFontColor || '#FFFFFF'
          }
          listviewMapButtonBackgroundColor={
            ciColors.listviewMapButtonBackgroundColor || '#10B981'
          }
          listviewMapButtonHoverBackgroundColor={
            ciColors.listviewMapButtonHoverBackgroundColor || '#059669'
          }
          listviewMapButtonFontColor={
            ciColors.listviewMapButtonFontColor || '#FFFFFF'
          }
          showAddress={tab.listviewShowAddress || false}
          showCategory={tab.listviewShowCategory || false}
        />
      )}
    </div>
  );
}
