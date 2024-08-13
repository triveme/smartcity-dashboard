import { CSSProperties, ReactElement } from 'react';
import nextDynamic from 'next/dynamic';

import PageHeadline from '@/ui/PageHeadline';
import {
  CorporateInfo,
  DashboardWithContent,
  MapModalChartStyle,
  TabWithQuery,
} from '@/types';
import DashboardPanel from './DashboardPanel';
import { getCorporateInfosWithLogos } from '@/app/actions';

type DashboardProps = {
  dashboard: DashboardWithContent;
  tenant: string | undefined;
};

export default async function Dashboard(
  props: DashboardProps,
): Promise<ReactElement> {
  const { dashboard, tenant } = props;

  const MapWithNoSSR = nextDynamic(() => import('@/components/Map/Map'), {
    ssr: false,
  });

  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);

  //Dynamic Styling
  const dashboardStyle: CSSProperties = {
    backgroundColor: ciColors.dashboardPrimaryColor || '#2B3244',
    color: ciColors.dashboardFontColor,
  };

  const chartStyle: MapModalChartStyle = {
    dashboardSecondaryColor: ciColors.dashboardSecondaryColor || '#3D4760',
    dashboardFontColor: ciColors.dashboardFontColor || '#FFF',
  };

  const menuStyle: CSSProperties = {
    backgroundColor: ciColors.menuPrimaryColor || '#3D4760',
    color: ciColors.menuFontColor || '#FFF',
  };

  return (
    <div style={dashboardStyle} className="w-full h-full overflow-auto">
      {dashboard.type !== 'Karte' && (
        <div className="p-4 w-full">
          <PageHeadline
            headline={dashboard.name || 'Dashboardseite'}
            fontColor={dashboardStyle.color}
          />
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-4">
            {dashboard.panels?.length > 0 &&
              dashboard.panels.map((panel) => (
                <DashboardPanel
                  key={`dashboardPanel-${panel.id}`}
                  panel={panel}
                  tenant={tenant}
                />
              ))}
          </div>
        </div>
      )}
      {dashboard.type === 'Karte' && (
        <div id="map" className="w-full h-full">
          <MapWithNoSSR
            mapMaxZoom={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapMaxZoom || 18
            }
            mapMinZoom={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapMinZoom || 0
            }
            mapAllowPopups={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapAllowPopups ||
              false
            }
            mapStandardZoom={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapStandardZoom ||
              13
            }
            mapAllowZoom={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapAllowZoom ||
              false
            }
            mapAllowScroll={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapAllowScroll ||
              false
            }
            mapMarkerColor={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapMarkerColor ||
              '#257dc9'
            }
            mapMarkerIcon={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapMarkerIcon || ''
            }
            mapMarkerIconColor={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                .mapMarkerIconColor || 'white'
            }
            mapLongitude={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapLongitude
                ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapLongitude
                : 13.404954
            }
            mapLatitude={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapLatitude
                ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapLatitude
                : 52.520008
            }
            mapActiveMarkerColor={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                .mapActiveMarkerColor || '#FF0000'
            }
            data={dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapObject || []}
            mapShapeOption={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapShapeOption
                ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapShapeOption
                : 'Rectangle'
            }
            mapDisplayMode={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapDisplayMode
                ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapDisplayMode
                : 'Only pin'
            }
            mapShapeColor={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapShapeColor
                ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapShapeColor
                : '#FF0000'
            }
            mapWidgetValues={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapWidgetValues
                ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapWidgetValues
                : []
            }
            mapAllowFilter={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapAllowFilter ||
              false
            }
            mapFilterAttribute={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                .mapFilterAttribute || ''
            }
            mapQueryDataAttributes={
              (dashboard.panels?.[0]?.widgets?.[0].tabs?.[0] as TabWithQuery)
                ?.query.queryData?.attrs || [{ attrName: '', types: [] }]
            }
            mapAllowLegend={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapAllowLegend ||
              false
            }
            mapLegendValues={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapLegendValues
                ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapLegendValues
                : []
            }
            mapLegendDisclaimer={
              dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                .mapLegendDisclaimer || ''
            }
            isFullscreenMap={true}
            chartStyle={chartStyle}
            menuStyle={menuStyle}
          />
        </div>
      )}
    </div>
  );
}
