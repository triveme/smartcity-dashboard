import { ReactElement } from 'react';
import '@/components/dependencies/quill.snow.css';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';

import {
  Tab,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
  Widget,
} from '@/types';
import Radial180Chart from '@/ui/Charts/radial180/Radial180Chart';
import Radial360Chart from '@/ui/Charts/radial360/Radial360Chart';
import PieChart from '@/ui/Charts/PieChart';
import LineChart from '@/ui/Charts/LineChart';
import BarChart from '@/ui/Charts/BarChart';
import { DashboardValues } from '@/ui/DashboardValues';
import IFrameComponent from '@/ui/IFrameComponent';
import MeasurementComponent from '../MeasurementComponent';
import ImageComponent from '../../ui/ImageComponent';
import { getCorporateInfosWithLogos } from '@/app/actions';
import IconWithLink from '@/ui/IconWithLink';
import { getTenantOfPage } from '@/utils/tenantHelper';
import StageableChart from '@/ui/Charts/stageablechart/StageableChart';
import Slider from '@/ui/Charts/slider/Slider';
import SliderOverview from '@/ui/Charts/slideroverview/SliderOverview';
import { DUMMY_CHART_DATA, DUMMY_CHART_DATA_YEAR } from '@/utils/objectHelper';

const Map = dynamic(() => import('@/components/Map/Map'), {
  // ssr: false,
});

type DashboardWidgetPreviewProps = {
  widget: Widget;
  tab: Tab;
};

export default function DashboardWidgetPreview(
  props: DashboardWidgetPreviewProps,
): ReactElement {
  const { widget, tab } = props;

  // Multi Tenancy
  const tenant = getTenantOfPage();

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });
  //Dynamic Styling
  const widgetStyle = {
    height: '400px',
    maxHeight: '100%',
    backgroundColor: data?.widgetPrimaryColor,
    color: data?.widgetFontColor,
    borderColor: data?.widgetBorderColor || '#59647D',
  };

  return (
    <div
      key={`widget-in-panel-${widget.id!}`}
      className={`flex justify-center items-center content-center text-center rounded-lg border-2 col-span-${widget.width}`}
      style={widgetStyle}
    >
      {/* TAB */}
      {tab.componentType === tabComponentTypeEnum.diagram && (
        <div className="w-full h-full">
          {tab.componentSubType === tabComponentSubTypeEnum.degreeChart180 && (
            <Radial180Chart
              minValue={tab.chartMinimum || 0}
              maxValue={tab.chartMaximum || 100}
              unit={tab.chartUnit || ''}
              value={tab.chartValues ? tab.chartValues[0] : 25}
              fontColor={data?.dashboardFontColor || '#fff'}
              fontSize={data?.degreeChart180FontSize || '11'}
              unitFontSize={data?.degreeChart180UnitFontSize || '11'}
              backgroundColor={data?.degreeChart180BgColor || '#fff'}
              fillColor={data?.degreeChart180FillColor || '#fff'}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.stageableChart && (
            <StageableChart
              unit={tab.chartUnit || ''}
              tiles={tab.tiles || 5}
              minValue={tab.chartMinimum || 0}
              maxValue={tab.chartMaximum || 100}
              staticValues={tab.chartStaticValues || [0]}
              staticValuesColors={tab.chartStaticValuesColors || ['#808080']}
              staticValuesTexts={tab.chartStaticValuesTexts || ['Label']}
              value={tab.chartValues ? tab.chartValues[0] : 25}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.degreeChart360 && (
            <Radial360Chart
              minValue={tab.chartMinimum || 0}
              maxValue={tab.chartMaximum || 100}
              unit={tab.chartUnit || ''}
              value={tab.chartValues ? tab.chartValues[0] : 25}
              mainColor={data?.dashboardPrimaryColor || '#3D4760'}
              fontColor={data?.dashboardFontColor || '#fff'}
              fontSize={data?.degreeChart360FontSize || '11'}
              unitFontSize={data?.degreeChart360UnitFontSize || '#fff'}
              backgroundColor={data?.degreeChart360BgColor || '#fff'}
              fillColor={data?.degreeChart360FillColor || '#fff'}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.pieChart && (
            <PieChart
              labels={tab.chartLabels || []}
              data={tab.chartValues || []}
              fontSize={data?.pieChartFontSize || '11'}
              fontColor={data?.pieChartFontColor || '#fff'}
              unit={tab.chartUnit || ''}
              currentValuesColors={
                data?.pieChartCurrentValuesColors || [
                  '#4CAF50',
                  '#2196F3',
                  '#FF9800',
                  '#F44336',
                  '#9C27B0',
                ]
              }
              allowImageDownload={tab.chartAllowImageDownload || false}
              pieChartRadius={tab.chartPieRadius || 70}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.lineChart && (
            <LineChart
              chartYAxisScaleChartMinValue={
                tab?.chartYAxisScaleChartMinValue !== undefined
                  ? tab.chartYAxisScaleChartMinValue
                  : undefined
              }
              chartYAxisScaleChartMaxValue={
                tab?.chartYAxisScaleChartMaxValue !== undefined
                  ? tab.chartYAxisScaleChartMaxValue
                  : undefined
              }
              chartYAxisScale={
                tab?.chartYAxisScale !== undefined
                  ? tab.chartYAxisScale
                  : undefined
              }
              chartDateRepresentation={
                tab?.chartDateRepresentation || 'Default'
              }
              labels={undefined}
              chartHasAutomaticZoom={tab.chartHasAutomaticZoom}
              data={
                tab?.chartDateRepresentation !== 'Default'
                  ? DUMMY_CHART_DATA_YEAR
                  : DUMMY_CHART_DATA
              }
              xAxisLabel={tab.chartXAxisLabel || ''}
              yAxisLabel={tab.chartYAxisLabel || ''}
              allowImageDownload={tab.chartAllowImageDownload || false}
              allowZoom={tab.mapAllowZoom || false}
              isStepline={tab.isStepline || false}
              isStackedChart={tab.isStackedChart || false}
              showLegend={tab.showLegend || false}
              staticValues={tab.chartStaticValues || []}
              staticValuesColors={tab.chartStaticValuesColors || []}
              axisLabelFontColor={data?.lineChartAxisLabelFontColor || '#fff'}
              axisLineColor={data?.lineChartAxisLineColor || '#fff'}
              axisTicksFontColor={data?.lineChartAxisLabelFontColor || '#fff'}
              legendFontSize={data?.lineChartLegendFontSize || '11'}
              legendFontColor={data?.lineChartLegendFontColor || '#FFFFF'}
              axisFontSize={data?.lineChartAxisTicksFontSize || '11'}
              axisLabelSize={data?.lineChartAxisLabelSize || '11'}
              currentValuesColors={
                data?.lineChartCurrentValuesColors || [
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                ]
              }
              gridColor={'#fff'}
              legendAlignment={tab.chartLegendAlign || 'Top'}
              hasAdditionalSelection={tab.chartHasAdditionalSelection || false}
              filterColor={data?.lineChartFilterColor || '#F1B434'}
              filterTextColor={data?.lineChartFilterTextColor || '#1D2330'}
              decimalPlaces={tab?.decimalPlaces || 0}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.barChart && (
            <BarChart
              chartYAxisScaleChartMinValue={
                tab?.chartYAxisScaleChartMinValue !== undefined
                  ? tab.chartYAxisScaleChartMinValue
                  : undefined
              }
              chartYAxisScaleChartMaxValue={
                tab?.chartYAxisScaleChartMaxValue !== undefined
                  ? tab.chartYAxisScaleChartMaxValue
                  : undefined
              }
              chartYAxisScale={
                tab?.chartYAxisScale !== undefined
                  ? tab.chartYAxisScale
                  : undefined
              }
              chartDateRepresentation={
                tab?.chartDateRepresentation || 'Default'
              }
              labels={undefined}
              data={
                tab?.chartDateRepresentation !== 'Default'
                  ? DUMMY_CHART_DATA_YEAR
                  : DUMMY_CHART_DATA
              }
              xAxisLabel={tab.chartXAxisLabel || ''}
              yAxisLabel={tab.chartYAxisLabel || ''}
              allowImageDownload={tab.chartAllowImageDownload || false}
              allowZoom={tab.mapAllowZoom || false}
              showLegend={tab.showLegend || false}
              staticValues={tab.chartStaticValues || []}
              staticValuesColors={tab.chartStaticValuesColors || []}
              fontColor={data?.dashboardFontColor || '#fff'}
              axisColor={data?.barChartAxisLineColor || '#fff'}
              axisFontSize={data?.barChartAxisTicksFontSize || '11'}
              currentValuesColors={
                data?.barChartCurrentValuesColors || [
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                ]
              }
              gridColor={data?.barChartGridColor || '#3D4760'}
              legendFontSize={data?.barChartLegendFontSize || '11'}
              axisLabelSize={data?.barChartAxisLabelSize || '11'}
              legendAlignment={tab.chartLegendAlign || 'Top'}
              legendFontColor={data?.barChartLegendFontColor || '#FFFFF'}
              hasAdditionalSelection={tab.chartHasAdditionalSelection || false}
              isStackedChart={tab.isStackedChart || false}
              filterColor={data?.barChartFilterColor || '#F1B434'}
              filterTextColor={data?.barChartFilterTextColor || '#1D2330'}
              axisFontColor={data?.barChartAxisLabelFontColor || '#FFFFFF'}
              decimalPlaces={tab?.decimalPlaces || 0}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.measurement && (
            <MeasurementComponent
              preview={true}
              dataValues={tab && tab.chartData ? tab.chartData[0]?.values : []}
              timeValues={tab.chartLabels || []}
              valueWarning={tab.chartStaticValues?.[0] || 0}
              valueAlarm={tab.chartStaticValues?.[1] || 0}
              valueMax={tab.chartStaticValues?.[2] || 0}
              unit={tab.chartUnit || ''}
              chartXAxisLabel={tab.chartXAxisLabel || ''}
              chartYAxisLabel={tab.chartYAxisLabel || ''}
              bigValueFontSize={data?.measurementChartBigValueFontSize || '168'}
              bigValueFontColor={
                data?.measurementChartBigValueFontColor || '#fffff'
              }
              topButtonBackgroundColor={
                data?.measurementChartTopButtonBgColor || '#fffff'
              }
              topButtonInactiveBackgroundColor={
                data?.measurementChartTopButtonBgColor || '#fffff'
              }
              topButtonHeaderSecondaryColor={
                data?.headerSecondaryColor || '#3D4760'
              }
              topButtonHoverColor={
                data?.measurementChartTopButtonHoverColor || '#fffff'
              }
              topButtonFontColor={
                data?.measurementChartTopButtonFontColor || '#fffff'
              }
              cardsBackgroundColor={
                data?.measurementChartCardsBgColor || '#fffff'
              }
              cardsFontColor={data?.measurementChartCardsFontColor || '#fffff'}
              cardsIconColors={
                data?.measurementChartCardsIconColors || [
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                ]
              }
              barColor={data?.measurementChartBarColor || '#fffff'}
              labelFontColor={data?.measurementChartLabelFontColor || '#fffff'}
              gridColor={data?.measurementChartGridColor || '#fffff'}
              axisLineColor={data?.measurementChartAxisLineColor || '#fffff'}
              axisTicksFontColor={
                data?.measurementChartAxisTicksFontColor || '#fffff'
              }
              axisLabelFontColor={
                data?.measurementChartAxisLabelFontColor || '#fffff'
              }
              currentValuesColors={
                data?.measurementChartCurrentValuesColors || [
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                  '#FFDE21',
                ]
              }
            />
          )}
        </div>
      )}
      {tab.componentType === tabComponentTypeEnum.slider && (
        <div className="w-full h-full">
          {tab.componentSubType === tabComponentSubTypeEnum.coloredSlider && (
            <Slider
              unit={tab.chartUnit || ''}
              minValue={tab.chartMinimum || 0}
              maxValue={tab.chartMaximum || 100}
              staticValues={tab.rangeStaticValuesMax || [0]}
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
              bigValueFontSize={data?.coloredSliderBigValueFontSize || '11'}
              bigValueFontColor={data?.coloredSliderBigValueFontColor || '#fff'}
              labelFontSize={data?.coloredSliderLabelFontSize || '11'}
              labelFontColor={data?.coloredSliderLabelFontColor || '#fff'}
              arrowColor={data?.coloredSliderArrowColor || '#fff'}
              unitFontSize={data?.coloredSliderUnitFontSize || '#fff'}
            />
          )}

          {tab.componentSubType === tabComponentSubTypeEnum.overviewSlider && (
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
              fontColorCurrent={data?.sliderCurrentFontColor || '#000000'}
              fontColorMaximum={data?.sliderMaximumFontColor || '#FFFFFF'}
              fontColorGeneral={data?.sliderGeneralFontColor || '#FFFFFF'}
              colorCurrent={data?.sliderCurrentColor || '#DC2626'}
              colorMaximum={data?.sliderMaximumColor || '#000000'}
            />
          )}
        </div>
      )}
      {tab.componentType === tabComponentTypeEnum.value && (
        <DashboardValues
          decimalPlaces={tab.decimalPlaces || 0}
          value={tab.chartValues?.[0] || 6.5791231231321312}
          unit={tab.chartUnit || ''}
          staticValues={tab.chartStaticValues || []}
          staticValuesColors={tab.chartStaticValuesColors || []}
          staticValuesTexts={tab.chartStaticValuesTexts || []}
          staticValuesLogos={tab.chartStaticValuesLogos || []}
          fontSize={data?.wertFontSize || '50'}
          fontColor={data?.wertFontColor || '#fff'}
          unitFontSize={data?.wertUnitFontSize || '30'}
        />
      )}
      {tab.componentType === tabComponentTypeEnum.information && (
        <div className="h-full p-2 overflow-y-auto">
          {tab.componentSubType === tabComponentSubTypeEnum.text && (
            <div
              style={{ color: data?.fontColor || 'white' }}
              className="ql-editor content-center no-border-ql-editor"
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
              fontColor={data?.widgetFontColor || 'white'}
            />
          )}
        </div>
      )}
      {tab.componentType === tabComponentTypeEnum.map && (
        <div id="map" className="h-full w-full">
          <Map
            mapMaxZoom={tab.mapMaxZoom || 18}
            mapMinZoom={tab.mapMinZoom || 0}
            mapAllowPopups={tab.mapAllowPopups ? tab.mapAllowPopups : false}
            mapStandardZoom={tab.mapStandardZoom ? tab.mapStandardZoom : 13}
            mapAllowZoom={tab.mapAllowZoom ? tab.mapAllowZoom : false}
            mapAllowScroll={tab.mapAllowScroll ? tab.mapAllowScroll : false}
            mapMarkerColor={tab.mapMarkerColor ? tab.mapMarkerColor : '#257dc9'}
            mapMarkerIcon={tab.mapMarkerIcon ? tab.mapMarkerIcon : ''}
            mapMarkerIconColor={
              tab.mapMarkerIconColor ? tab.mapMarkerIconColor : 'white'
            }
            mapLongitude={tab.mapLongitude ? tab.mapLongitude : 13.404954}
            mapLatitude={tab.mapLatitude ? tab.mapLatitude : 52.520008}
            mapActiveMarkerColor={
              tab.mapActiveMarkerColor ? tab.mapActiveMarkerColor : '#FF0000'
            }
            data={tab.mapObject || []}
            mapShapeOption={
              tab.mapShapeOption ? tab.mapShapeOption : 'Rectangle'
            }
            mapDisplayMode={
              tab.mapDisplayMode ? tab.mapDisplayMode : 'Only pin'
            }
            mapShapeColor={tab.mapShapeColor ? tab.mapShapeColor : '#FF0000'}
            mapAttributeForValueBased={tab.mapAttributeForValueBased || ''}
            mapIsFormColorValueBased={tab.mapIsFormColorValueBased || false}
            mapIsIconColorValueBased={tab.mapIsIconColorValueBased || false}
            staticValues={tab.chartStaticValues || []}
            staticValuesColors={tab.chartStaticValuesColors || []}
            mapFormSizeFactor={tab?.mapFormSizeFactor || 1}
            mapWmsUrl={tab.mapWmsUrl || ''}
            mapWmsLayer={tab.mapWmsLayer || ''}
          />
        </div>
      )}
      {tab.componentType === tabComponentTypeEnum.iframe && (
        <div className="w-full h-full">
          <IFrameComponent src={tab.iFrameUrl || ''} />
        </div>
      )}

      {tab.componentType === tabComponentTypeEnum.image && (
        <div className="w-full h-full">
          {tab.imageUrl && <ImageComponent imageUrl={tab.imageUrl} />}
          {!tab.imageUrl && tab.imageSrc && (
            <ImageComponent imageBase64={tab.imageSrc} />
          )}
        </div>
      )}
    </div>
  );
}
