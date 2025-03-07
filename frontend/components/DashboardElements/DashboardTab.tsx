import { CSSProperties, ReactElement } from 'react';
import nextDynamic from 'next/dynamic';

import '@/components/dependencies/quill.snow.css';
import '../../app/quill.css';
import {
  CorporateInfo,
  MapModalChartStyle,
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

type DashboardTabProps = {
  tab: Tab;
  tenant: string | undefined;
  isCombinedWidget?: boolean;
};
const MapWithNoSSR = nextDynamic(() => import('@/components/Map/Map'), {
  // ssr: false,
});
const CombinedMapWithNoSSR = nextDynamic(
  () => import('@/components/Map/CombinedMap'),
  {
    // ssr: false,
  },
);

export default async function DashboardTab(
  props: DashboardTabProps,
): Promise<ReactElement> {
  const { tab, tenant } = props;

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

  let combinedMapData;
  let combinedQueryData;

  if (tab?.componentType === tabComponentTypeEnum.map) {
    const combinedWidgets: WidgetWithContent[] = isTabOfTypeCombinedWidget(tab)
      ? tab.combinedWidgets
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
                tab.chartValues && tab.chartValues.length > 0
                  ? tab.chartValues[0]
                  : 25
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
                tab.chartValues && tab.chartValues.length > 0
                  ? tab.chartValues[0]
                  : 25
              }
              mainColor={ciColors.dashboardSecondaryColor || '#3D4760'}
              secondaryColor={ciColors.dashboardFontColor || '#FFF'}
              fontColor={ciColors.dashboardFontColor || '#FFF'}
              fontSize={ciColors.degreeChart360FontSize || '11'}
              backgroundColor={ciColors.degreeChart360BgColor}
              fillColor={ciColors.degreeChart360FillColor}
              unitFontSize={ciColors.degreeChart360UnitFontSize}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.pieChart && (
            <PieChart
              labels={tab.chartLabels || []}
              data={tab.chartValues || []}
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
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.lineChart && (
            <LineChart
              labels={tab.chartLabels}
              data={tab.chartData || DUMMY_CHART_DATA}
              xAxisLabel={tab.chartXAxisLabel || ''}
              yAxisLabel={tab.chartYAxisLabel || ''}
              allowZoom={tab.mapAllowZoom || false}
              isStepline={tab.isStepline || false}
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
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.barChart && (
            <BarChart
              labels={tab.chartLabels}
              data={tab.chartData || DUMMY_CHART_DATA}
              xAxisLabel={tab.chartXAxisLabel || ''}
              yAxisLabel={tab.chartYAxisLabel || ''}
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
              isStackedChart={tab.isStepline || false}
              legendFontColor={ciColors.lineChartLegendFontColor || '#FFFFFF'}
              filterColor={ciColors.barChartFilterColor || '#F1B434'}
              filterTextColor={ciColors.barChartFilterTextColor || '#1D2330'}
              axisFontColor={ciColors.barChartAxisLabelFontColor || '#FFF'}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.measurement && (
            <MeasurementComponent
              preview={false}
              dataValues={
                tab.chartData && tab.chartData.length > 0
                  ? tab.chartData[0].values
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
                tab.chartValues && tab.chartValues.length > 0
                  ? tab.chartValues[0]
                  : 25
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
            <div className="flex justify-center items-center px-6">
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
                  tab.chartValues && tab.chartValues.length > 0
                    ? tab.chartValues[0]
                    : 25
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
              data={tab.chartData || []}
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
            tab.chartValues?.[0] !== undefined && tab.chartValues?.[0] !== null
              ? tab.chartValues?.[0]
              : tab.textValue
                ? tab.textValue
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
      {tab.componentType === tabComponentTypeEnum.map &&
        tab.componentSubType !== tabComponentSubTypeEnum.combinedMap && (
          <div id="map" className="h-full w-full">
            <MapWithNoSSR
              mapMaxZoom={tab.mapMaxZoom ? tab.mapMaxZoom : 18}
              mapMinZoom={tab.mapMinZoom ? tab.mapMinZoom : 0}
              mapAllowPopups={tab.mapAllowPopups ? tab.mapAllowPopups : false}
              mapStandardZoom={tab.mapStandardZoom ? tab.mapStandardZoom : 13}
              mapAllowZoom={tab.mapAllowZoom ? tab.mapAllowZoom : false}
              mapAllowScroll={tab.mapAllowScroll ? tab.mapAllowScroll : false}
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
                tab.mapActiveMarkerColor ? tab.mapActiveMarkerColor : '#FF0000'
              }
              data={tab.mapObject}
              mapShapeOption={
                tab.mapShapeOption ? tab.mapShapeOption : 'Rectangle'
              }
              mapDisplayMode={
                tab.mapDisplayMode ? tab.mapDisplayMode : 'Only pin'
              }
              mapShapeColor={tab.mapShapeColor ? tab.mapShapeColor : '#FF0000'}
              isFullscreenMap={false}
              mapAllowFilter={tab.mapAllowFilter || false}
              mapFilterAttribute={tab.mapFilterAttribute || ''}
              mapAllowLegend={tab.mapAllowLegend || false}
              mapLegendValues={tab.mapLegendValues ? tab.mapLegendValues : []}
              mapLegendDisclaimer={
                tab.mapLegendDisclaimer ? [tab.mapLegendDisclaimer] : []
              }
              menuStyle={menuStyle}
              mapAttributeForValueBased={tab.mapAttributeForValueBased || ''}
              mapIsFormColorValueBased={tab.mapIsFormColorValueBased || false}
              mapIsIconColorValueBased={tab.mapIsIconColorValueBased || false}
              staticValues={tab.chartStaticValues || []}
              staticValuesColors={tab.chartStaticValuesColors || []}
              mapFormSizeFactor={tab.mapFormSizeFactor || 1}
              mapWmsUrl={tab.mapWmsUrl || ''}
              mapWmsLayer={tab.mapWmsLayer || ''}
              ciColors={ciColors}
            />
          </div>
        )}
      {tab.componentType === tabComponentTypeEnum.map &&
        tab.componentSubType === tabComponentSubTypeEnum.combinedMap && (
          <div id="map" className="w-full h-full">
            <CombinedMapWithNoSSR
              data={combinedMapData?.mapObject as MapObject[]}
              combinedMapData={combinedMapData}
              mapAllowFilter={true}
              combinedQueryData={combinedQueryData as QueryDataWithAttributes[]}
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
              mapShapeOption={combinedMapData?.mapShapeOption as string[]}
              mapShapeColor={combinedMapData?.mapShapeColor as string[]}
              mapDisplayMode={combinedMapData?.mapDisplayMode as string[]}
              mapWidgetValues={
                combinedMapData?.mapWidgetValues as MapModalWidget[]
              }
              mapNames={(combinedMapData?.mapNames as string[]) || []}
              isFullscreenMap={false}
              chartStyle={chartStyle}
              menuStyle={menuStyle}
              ciColors={ciColors}
            />
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
            className={`flex ${
              tab.isLayoutVertical !== undefined
                ? tab.isLayoutVertical
                  ? 'flex-row gap-4'
                  : 'flex-col'
                : 'flex-col'
            }`}
          >
            {tab.combinedWidgets?.length > 0 &&
              tab.combinedWidgets.map(
                (widget: WidgetWithContent, index: number) => (
                  <DashboardWidget
                    key={`widget-in-panel-${widget.id}-${index}`}
                    widget={widget}
                    tenant={tenant}
                    isCombinedWidget={true}
                  />
                ),
              )}
          </div>
        )}
    </div>
  );
}
