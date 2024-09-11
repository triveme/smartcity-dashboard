import { CSSProperties, ReactElement } from 'react';
import nextDynamic from 'next/dynamic';

import '@/components/dependencies/quill.snow.css';
import '../../app/quill.css';
import {
  CorporateInfo,
  Tab,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
  TabWithQuery,
  TabWithCombinedWidgets,
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

type DashboardTabProps = {
  tab: Tab;
  tenant: string | undefined;
  isCombinedWidget?: boolean;
};
const MapWithNoSSR = nextDynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});
export default async function DashboardTab(
  props: DashboardTabProps,
): Promise<ReactElement> {
  const { tab, tenant } = props;

  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);

  //Dynamic Styling
  const fontStyle = {
    color: ciColors.fontColor ?? '#FFF',
  };

  const menuStyle: CSSProperties = {
    backgroundColor: ciColors.menuPrimaryColor || '#3D4760',
    color: ciColors.menuFontColor || '#FFF',
  };

  function isTabWithCombinedWidget(tab: Tab): tab is TabWithCombinedWidgets {
    return tab.componentType === tabComponentTypeEnum.combinedComponent;
  }

  console.log('tab.chartData', tab.chartData);
  console.log('tab.chartValues', tab.chartValues);
  console.log('tab.textValue', tab.textValue);

  return (
    <div className={`w-full h-full justify-center items-center`}>
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
              mainColor={ciColors.dashboardSecondaryColor || '#3D4760'}
              secondaryColor={ciColors.dashboardFontColor || '#FFF'}
              fontColor={ciColors.dashboardFontColor || '#fff'}
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
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.pieChart && (
            <PieChart
              labels={tab.chartLabels || []}
              data={tab.chartValues || []}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.lineChart && (
            <LineChart
              labels={tab.chartLabels}
              data={tab.chartData || undefined}
              xAxisLabel={tab.chartXAxisLabel || ''}
              yAxisLabel={tab.chartYAxisLabel || ''}
              allowZoom={tab.mapAllowZoom || false}
              isStepline={tab.isStepline || false}
              showLegend={tab.showLegend || false}
              staticValues={tab.chartStaticValues || []}
              staticValuesColors={tab.chartStaticValuesColors || []}
              fontColor={ciColors.dashboardFontColor || '#FFF'}
              axisColor={ciColors.headerPrimaryColor || '#FFF'}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.barChart && (
            <BarChart
              labels={tab.chartLabels}
              data={tab.chartData || undefined}
              xAxisLabel={tab.chartXAxisLabel || ''}
              yAxisLabel={tab.chartYAxisLabel || ''}
              allowZoom={tab.mapAllowZoom || false}
              showLegend={tab.showLegend || false}
              staticValues={tab.chartStaticValues || []}
              staticValuesColors={tab.chartStaticValuesColors || []}
              fontColor={ciColors.dashboardFontColor || '#FFF'}
              axisColor={ciColors.headerPrimaryColor || '#FFF'}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.measurement && (
            <MeasurementComponent
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
              fontColor={ciColors.dashboardFontColor || '#FFF'}
              axisColor={ciColors.headerPrimaryColor || '#FFF'}
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
              value={
                tab.chartValues && tab.chartValues.length > 0
                  ? tab.chartValues[0]
                  : 25
              }
            />
          )}
        </div>
      )}
      {tab.componentType === tabComponentTypeEnum.slider && (
        <div className="h-full p-2 overflow-y-auto">
          {tab.componentSubType === tabComponentSubTypeEnum.coloredSlider && (
            <Slider
              unit={tab.chartUnit || ''}
              minValue={tab.chartMinimum || 0}
              maxValue={tab.chartMaximum || 100}
              staticValues={tab.chartStaticValues || []}
              staticValuesColors={tab.chartStaticValuesColors || []}
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
            />
          )}

          {tab.componentSubType === tabComponentSubTypeEnum.overviewSlider && (
            <SliderOverview data={tab.chartData || []} />
          )}
        </div>
      )}
      {tab.componentType === tabComponentTypeEnum.value && (
        <DashboardValues
          decimalPlaces={tab.decimalPlaces || 0}
          value={tab.chartValues?.[0] || tab.textValue || 6.5791231231321312}
          unit={tab.chartUnit || ''}
          fontColor={ciColors.dashboardFontColor || '#FFF'}
        />
      )}
      {tab.componentType === tabComponentTypeEnum.information && (
        <div className="h-full p-2 overflow-y-auto">
          {tab.componentSubType === tabComponentSubTypeEnum.text && (
            <div
              style={fontStyle}
              className={`ql-editor no-border-ql-editor`}
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
          <MapWithNoSSR
            mapMaxZoom={tab.mapMaxZoom ? tab.mapMaxZoom : 18}
            mapMinZoom={tab.mapMinZoom ? tab.mapMinZoom : 0}
            mapAllowPopups={tab.mapAllowPopups ? tab.mapAllowPopups : false}
            mapStandardZoom={tab.mapStandardZoom ? tab.mapStandardZoom : 13}
            mapAllowZoom={tab.mapAllowZoom ? tab.mapAllowZoom : false}
            mapAllowScroll={tab.mapAllowScroll ? tab.mapAllowScroll : false}
            mapMarkerColor={tab.mapMarkerColor ? tab.mapMarkerColor : '#257dc9'}
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
            mapQueryDataAttributes={
              (tab as TabWithQuery)?.query.queryData?.attrs || [
                { attrName: '', types: [] },
              ]
            }
            mapAllowLegend={tab.mapAllowLegend || false}
            mapLegendValues={tab.mapLegendValues ? tab.mapLegendValues : []}
            mapLegendDisclaimer={tab.mapLegendDisclaimer || ''}
            menuStyle={menuStyle}
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
        />
      )}
      {isTabWithCombinedWidget(tab) && (
        <>
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
        </>
      )}
    </div>
  );
}
