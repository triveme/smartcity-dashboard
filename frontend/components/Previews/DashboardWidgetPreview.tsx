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
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import IFrameComponent from '@/ui/IFrameComponent';
import MeasurementComponent from '../MeasurementComponent';
import ImageComponent from '../../ui/ImageComponent';
import { getCorporateInfosWithLogos } from '@/app/actions';
import IconWithLink from '@/ui/IconWithLink';
import { getTenantOfPage } from '@/utils/tenantHelper';
import StageableChart from '@/ui/Charts/stageablechart/StageableChart';
import Slider from '@/ui/Charts/slider/Slider';

const Map = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

type DashboardWidgetPreviewProps = {
  widget: Widget;
  tab: Tab;
  widgetCount?: number;
  moveWidget?: (widgetId: string, direction: 'left' | 'right') => void;
  deleteRelation?: (widgetId: string) => void;
  hideControlIcons?: boolean;
  index?: number;
};

export default function DashboardWidgetPreview(
  props: DashboardWidgetPreviewProps,
): ReactElement {
  const {
    widget,
    tab,
    widgetCount,
    moveWidget,
    deleteRelation,
    hideControlIcons,
    index,
  } = props;

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
              mainColor={data?.dashboardSecondaryColor || '#3D4760'}
              secondaryColor={data?.dashboardFontColor || '#FFF'}
              fontColor={data?.dashboardFontColor || '#fff'}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.stageableChart && (
            <StageableChart
              unit={tab.chartUnit || ''}
              minValue={tab.chartMinimum || 0}
              maxValue={tab.chartMaximum || 100}
              staticValues={tab.chartStaticValues || [0]}
              staticValuesColors={tab.chartStaticValuesColors || ['#808080']}
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
              secondaryColor={data?.dashboardSecondaryColor || '#3D4760'}
              fontColor={data?.dashboardFontColor || '#fff'}
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
              labels={undefined}
              data={undefined}
              xAxisLabel={tab.chartXAxisLabel || ''}
              yAxisLabel={tab.chartYAxisLabel || ''}
              allowZoom={tab.mapAllowZoom || false}
              isStepline={tab.isStepline || false}
              showLegend={tab.showLegend || false}
              staticValues={tab.chartStaticValues || []}
              staticValuesColors={tab.chartStaticValuesColors || []}
              fontColor={data?.dashboardFontColor || '#fff'}
              axisColor={data?.headerPrimaryColor || '#fff'}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.barChart && (
            <BarChart
              labels={undefined}
              data={undefined}
              xAxisLabel={tab.chartXAxisLabel || ''}
              yAxisLabel={tab.chartYAxisLabel || ''}
              allowZoom={tab.mapAllowZoom || false}
              showLegend={tab.showLegend || false}
              staticValues={tab.chartStaticValues || []}
              staticValuesColors={tab.chartStaticValuesColors || []}
              fontColor={data?.dashboardFontColor || '#fff'}
              axisColor={data?.headerPrimaryColor || '#fff'}
            />
          )}
          {tab.componentSubType === tabComponentSubTypeEnum.measurement && (
            <MeasurementComponent
              dataValues={tab.chartValues || []}
              timeValues={tab.chartLabels || []}
              valueWarning={tab.chartStaticValues?.[0] || 0}
              valueAlarm={tab.chartStaticValues?.[1] || 0}
              valueMax={tab.chartStaticValues?.[2] || 0}
              unit={tab.chartUnit || ''}
              chartXAxisLabel={tab.chartXAxisLabel || ''}
              chartYAxisLabel={tab.chartYAxisLabel || ''}
              fontColor={data?.dashboardFontColor || '#fff'}
              axisColor={data?.headerPrimaryColor || '#fff'}
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
              staticValues={tab.chartStaticValues || [0]}
              staticValuesColors={tab.chartStaticValuesColors || ['#808080']}
              staticValuesTicks={tab.chartStaticValuesTicks || []}
              staticValuesLogos={tab.chartStaticValuesLogos || ['']}
              staticValuesTexts={tab.chartStaticValuesTexts || ['']}
              iconColor={tab.iconColor || '#000000'}
              labelColor={tab.labelColor || '#000000'}
              value={tab.chartValues ? tab.chartValues[0] : 25}
            />
          )}
        </div>
      )}
      {tab.componentType === tabComponentTypeEnum.value && (
        <DashboardValues
          decimalPlaces={tab.decimalPlaces || 0}
          value={tab.chartValues?.[0] || 6.5791231231321312}
          unit={tab.chartUnit || ''}
          fontColor={data?.dashboardFontColor || '#fff'}
        />
      )}
      {tab.componentType === tabComponentTypeEnum.information && (
        <div className="h-full p-2 overflow-y-auto">
          {tab.componentSubType === tabComponentSubTypeEnum.text && (
            <div
              style={{ color: data?.fontColor || 'white' }}
              className="ql-editor flex items-center no-border-ql-editor"
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
          ></Map>
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
      {/* For wizards display only widget name and move icons*/}
      {!hideControlIcons && !tab.componentType && (
        <div className="w-full h-full">
          <div className="p-2 flex justify-end gap-4">
            {widgetCount && widgetCount > 1 && index !== 0 && (
              <button onClick={(): void => moveWidget!(widget.id!, 'left')}>
                <DashboardIcons iconName="ChevronLeft" color="white" />
              </button>
            )}
            {widgetCount && widgetCount > 1 && index !== widgetCount - 1 && (
              <button
                className="pl-4"
                onClick={(): void => moveWidget!(widget.id!, 'right')}
              >
                <DashboardIcons iconName="ChevronRight" color="white" />
              </button>
            )}
            <button onClick={(): void => deleteRelation!(widget.id!)}>
              <DashboardIcons iconName="Trashcan" color="#FA4141" />
            </button>
          </div>
          <div>{widget.name}</div>
        </div>
      )}
    </div>
  );
}
