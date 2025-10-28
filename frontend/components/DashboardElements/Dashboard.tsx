import { CSSProperties, ReactElement } from 'react';
import nextDynamic from 'next/dynamic';
import { cookies } from 'next/headers';

import PageHeadline from '@/ui/PageHeadline';
import {
  CorporateInfo,
  dashboardTypeEnum,
  DashboardWithContent,
  MapModalLegend,
  MapModalWidget,
  MapObject,
  QueryDataWithAttributes,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
  TabWithCombinedWidgets,
  TabWithQuery,
  WidgetWithContent,
} from '@/types';
import DashboardPanel from './DashboardPanel';
import { getCorporateInfosWithLogos } from '@/app/actions';
import DataExportButton from '@/ui/Buttons/DataExportButton';
import {
  combineQueryData,
  combineWidgetAttributes,
} from '@/utils/combinedMapDataHelper';
import { isTabOfTypeCombinedWidget } from '@/utils/tabTypeHelper';
import RedirectPageButton from '@/ui/Buttons/RedirectPageButton';
import { generateResponsiveFontSize } from '@/utils/fontUtil';
import ShareLinkButton from '@/ui/Buttons/ShareLinkButton';
import { MapModalChartStyle } from '@/types/mapRelatedModels';
import IFrameComponent from '@/ui/IFrameComponent';

type DashboardProps = {
  dashboard: DashboardWithContent;
  tenant: string | undefined;
};

export default async function Dashboard(
  props: DashboardProps,
): Promise<ReactElement> {
  const { dashboard, tenant } = props;
  const cookieStore = await cookies();
  const isEditable = cookieStore.get('allowEdit')?.value === 'true';

  const Map = nextDynamic(() => import('@/components/Map/Map'), {
    // ssr: false,
  });
  const MapDynamic = nextDynamic(() => import('@/components/Map/MapDynamic'), {
    // ssr: false,
  });

  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);

  //Dynamic Styling
  const dashboardStyle: CSSProperties = {
    backgroundColor: ciColors.dashboardPrimaryColor || '#2B3244',
    color: ciColors.dashboardFontColor,
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

  const menuStyle: CSSProperties = {
    backgroundColor: ciColors.menuPrimaryColor || '#3D4760',
    color: ciColors.menuFontColor || '#FFF',
  };

  let tab;
  let combinedMapData;
  let combinedQueryData;
  if (dashboard.type === dashboardTypeEnum.map) {
    tab = dashboard?.panels?.[0]?.widgets?.[0]?.tabs?.[0];

    if (tab?.componentType === tabComponentTypeEnum.map) {
      // The issue is here - we need to properly detect combined widgets
      // and extract their mapObject data correctly

      // Check if this is a combined map
      const isCombinedMap =
        tab?.componentSubType === tabComponentSubTypeEnum.combinedMap;

      // Get combined widgets differently based on whether this is a regular tab or a combined map
      const combinedWidgets: WidgetWithContent[] = isCombinedMap
        ? dashboard?.panels?.[0]?.widgets?.[0]?.widgetData?.data
            ?.combinedWidgets || []
        : isTabOfTypeCombinedWidget(tab)
          ? (tab as TabWithCombinedWidgets)?.combinedWidgets || []
          : [];

      // Get map data from combinedWidgets if available, or use tab's mapObject directly
      const mapObjects =
        combinedWidgets.length > 0
          ? combinedWidgets.flatMap(
              (widget) =>
                // Look for mapObject in both places it might be stored
                widget?.tabs?.[0]?.mapObject ||
                widget?.widgetData?.data?.mapObject ||
                [],
            )
          : tab?.mapObject || [];

      // Combine all attributes other than queryData
      combinedMapData = combineWidgetAttributes(combinedWidgets);

      // Make sure mapObject is populated from the child widgets
      if (!combinedMapData.mapObject && mapObjects.length > 0) {
        combinedMapData = { ...combinedMapData, mapObject: mapObjects };
      }

      const isSingleMap =
        tab?.componentType === tabComponentTypeEnum.map &&
        tab?.componentSubType !== tabComponentSubTypeEnum.combinedMap;
      const singleMapQueryData = (
        dashboard.panels?.[0]?.widgets?.[0].tabs?.[0] as TabWithQuery
      )?.query?.queryData;
      const mapFilterAttribute =
        dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapFilterAttribute || '';

      // merge queryData from all combinedWidgets, ensuring we look in both possible locations
      const allWidgetQueryData = combinedWidgets.map((widget) => {
        const queryData = (widget?.tabs?.[0] as TabWithQuery)?.query?.queryData;
        // If no queryData directly in tab, check in widgetData
        return queryData || widget?.widgetData?.data?.queryData || [];
      });

      // merge queryData and format to use in filter modal list
      combinedQueryData = combineQueryData(
        isSingleMap ? [singleMapQueryData] : allWidgetQueryData,
        isSingleMap
          ? [mapFilterAttribute]
          : (combinedMapData.mapFilterAttribute as string[]),
      );
    }
  }

  return (
    <div style={dashboardStyle} className="w-full h-full overflow-auto">
      {dashboard.type !== dashboardTypeEnum.map &&
        dashboard.type !== dashboardTypeEnum.iframe && (
          <div className="p-4 w-full">
            <div className="w-full flex justify-between items-center">
              <div className="w-full flex justify-start items-center gap-x-2">
                <div>
                  <PageHeadline
                    headline={dashboard.name || 'Dashboardseite'}
                    fontColor={ciColors.dashboardFontColor}
                    fontSize={generateResponsiveFontSize(
                      parseInt(ciColors.dashboardHeadlineFontSize || '18', 10),
                    )}
                  />
                </div>
                {dashboard.allowShare ? (
                  <ShareLinkButton
                    type="dashboard"
                    id={dashboard.id || ''}
                    widgetPrimaryColor={ciColors?.dashboardPrimaryColor}
                    widgetFontColor={ciColors?.dashboardFontColor}
                  />
                ) : null}
                {isEditable ? (
                  <RedirectPageButton
                    url={`/${tenant}/admin/pages/edit?id=${dashboard?.id}`}
                    isShortStyle={true}
                    headerPrimaryColor={ciColors.headerPrimaryColor}
                    headerFontColor={ciColors.headerFontColor}
                  />
                ) : null}
              </div>
              {dashboard.allowDataExport && (
                <DataExportButton
                  id={dashboard.id || ''}
                  type="dashboard"
                  headerPrimaryColor={ciColors?.headerPrimaryColor}
                  headerFontColor={ciColors?.headerFontColor}
                  panelFontColor={ciColors?.panelFontColor}
                  widgetFontColor={ciColors?.widgetFontColor}
                />
              )}
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-12 gap-1 pt-2">
              {dashboard.panels?.length > 0 &&
                dashboard.panels.map((panel) => (
                  <DashboardPanel
                    key={`dashboardPanel-${panel.id}`}
                    panel={panel}
                    tenant={tenant}
                    dashboardId={dashboard.id!}
                  />
                ))}
            </div>
          </div>
        )}
      {dashboard.type === dashboardTypeEnum.map && (
        <div id="map" className="w-full h-full">
          {dashboard?.panels?.[0].widgets?.[0].tabs?.[0].componentSubType !==
            tabComponentSubTypeEnum.geoJSONDynamic &&
          dashboard?.panels?.[0].widgets?.[0].tabs?.[0].componentSubType !==
            tabComponentSubTypeEnum.pinDynamic ? (
            <>
              {dashboard?.panels?.[0].widgets?.[0].tabs?.[0]
                .componentSubType === tabComponentSubTypeEnum.combinedMap ? (
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
                  mapCombinedWmsUrl={
                    dashboard.panels?.[0].widgets?.[0].tabs?.[0]
                      .mapCombinedWmsUrl || ''
                  }
                  mapCombinedWmsLayer={
                    dashboard.panels?.[0].widgets?.[0].tabs?.[0]
                      .mapCombinedWmsLayer || ''
                  }
                  mapNames={(combinedMapData?.mapNames as string[]) || []}
                  mapGeoJSON={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapGeoJSON ||
                    ''
                  }
                  mapGeoJSONSensorBasedColors={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONSensorBasedColors || false
                  }
                  mapGeoJSONBorderColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONBorderColor || '#3388ff'
                  }
                  mapGeoJSONFillColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONFillColor || '#3388ff'
                  }
                  mapGeoJSONSelectionBorderColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONSelectionBorderColor || '#0b63de'
                  }
                  mapGeoJSONSelectionFillColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONSelectionFillColor || '#0b63de'
                  }
                  mapGeoJSONHoverBorderColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONHoverBorderColor || '#0347a6'
                  }
                  mapGeoJSONHoverFillColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONHoverFillColor || '#0347a6'
                  }
                  mapType={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .componentSubType || ''
                  }
                  isFullscreenMap={true}
                  mapAttributeForValueBased={
                    combinedMapData?.mapAttributeForValueBased as string[]
                  }
                  mapIsIconColorValueBased={
                    combinedMapData?.mapIsIconColorValueBased as boolean[]
                  }
                  mapIsFormColorValueBased={
                    combinedMapData?.mapIsFormColorValueBased as boolean[]
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
                  allowShare={dashboard.allowShare}
                  dashboardId={dashboard.id || ''}
                  allowDataExport={
                    dashboard.allowDataExport &&
                    dashboard.panels?.[0].widgets?.[0].allowDataExport
                  }
                  widgetDownloadId={dashboard.panels?.[0].widgets?.[0].id || ''}
                />
              ) : (
                <Map
                  mapMaxZoom={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapMaxZoom ||
                    18
                  }
                  mapMinZoom={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapMinZoom ||
                    0
                  }
                  mapAllowPopups={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapAllowPopups || false
                  }
                  mapStandardZoom={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapStandardZoom || 13
                  }
                  mapAllowZoom={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapAllowZoom || false
                  }
                  mapAllowScroll={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapAllowScroll || false
                  }
                  mapMarkerColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapMarkerColor || '#257dc9'
                  }
                  mapMarkerIcon={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapMarkerIcon || ''
                  }
                  mapMarkerIconColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapMarkerIconColor || 'white'
                  }
                  mapLongitude={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapLongitude
                      ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                          .mapLongitude
                      : 13.404954
                  }
                  mapLatitude={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapLatitude
                      ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                          .mapLatitude
                      : 52.520008
                  }
                  mapActiveMarkerColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapActiveMarkerColor || '#FF0000'
                  }
                  data={
                    dashboard.panels?.[0]?.widgets?.[0].widgetData?.data
                      ?.mapObject || []
                  }
                  mapDisplayMode={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapDisplayMode
                      ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                          .mapDisplayMode
                      : 'Only pin'
                  }
                  mapShapeOption={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapShapeOption
                      ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                          .mapShapeOption
                      : 'Rectangle'
                  }
                  mapShapeColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapShapeColor
                      ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                          .mapShapeColor
                      : '#FF0000'
                  }
                  mapWidgetValues={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapWidgetValues
                      ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                          .mapWidgetValues
                      : []
                  }
                  mapAllowFilter={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapAllowFilter || false
                  }
                  mapFilterAttribute={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapFilterAttribute || ''
                  }
                  mapGeoJSON={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapGeoJSON ||
                    ''
                  }
                  mapGeoJSONSensorBasedColors={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONSensorBasedColors || false
                  }
                  mapGeoJSONBorderColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONBorderColor || '#3388ff'
                  }
                  mapGeoJSONFillColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONFillColor || '#3388ff'
                  }
                  mapGeoJSONSelectionBorderColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONSelectionBorderColor || '#0b63de'
                  }
                  mapGeoJSONSelectionFillColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONSelectionFillColor || '#0b63de'
                  }
                  mapGeoJSONHoverBorderColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONHoverBorderColor || '#0347a6'
                  }
                  mapGeoJSONHoverFillColor={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapGeoJSONHoverFillColor || '#0347a6'
                  }
                  mapType={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .componentSubType || ''
                  }
                  combinedQueryData={
                    combinedQueryData as QueryDataWithAttributes[]
                  }
                  mapAllowLegend={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapAllowLegend || false
                  }
                  mapLegendValues={
                    dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapLegendValues
                      ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                          .mapLegendValues
                      : []
                  }
                  mapLegendDisclaimer={
                    tab?.mapLegendDisclaimer ? [tab.mapLegendDisclaimer] : []
                  }
                  isFullscreenMap={true}
                  chartStyle={chartStyle}
                  menuStyle={menuStyle}
                  mapAttributeForValueBased={
                    tab?.mapAttributeForValueBased || ''
                  }
                  mapIsFormColorValueBased={
                    tab?.mapIsFormColorValueBased || false
                  }
                  mapIsIconColorValueBased={
                    tab?.mapIsIconColorValueBased || false
                  }
                  staticValues={tab?.chartStaticValues || []}
                  staticValuesColors={tab?.chartStaticValuesColors || []}
                  staticValuesLogos={tab?.chartStaticValuesLogos || []}
                  mapFormSizeFactor={tab?.mapFormSizeFactor || 1}
                  mapWmsUrl={tab?.mapWmsUrl || ''}
                  mapWmsLayer={tab?.mapWmsLayer || ''}
                  ciColors={ciColors}
                  allowShare={dashboard.allowShare}
                  dashboardId={dashboard.id || ''}
                  allowDataExport={
                    dashboard.allowDataExport &&
                    dashboard.panels?.[0].widgets?.[0].allowDataExport
                  }
                  widgetDownloadId={dashboard.panels?.[0].widgets?.[0].id || ''}
                />
              )}
            </>
          ) : (
            <MapDynamic
              isCombinedMap={false}
              tabData={
                dashboard.panels?.[0]?.widgets?.[0].widgetData?.data || []
              }
              chartStyle={chartStyle}
              menuStyle={menuStyle}
              ciColors={ciColors}
              allowShare={dashboard.allowShare}
              dashboardId={dashboard.id || ''}
              allowDataExport={
                dashboard.allowDataExport &&
                dashboard.panels?.[0].widgets?.[0].allowDataExport
              }
              widgetDownloadId={dashboard.panels?.[0].widgets?.[0].id || ''}
              tab={tab}
              combinedMapData={combinedMapData}
            />
          )}
        </div>
      )}
      {dashboard.type === dashboardTypeEnum.iframe && (
        <IFrameComponent
          src={dashboard?.panels?.[0].widgets?.[0].tabs?.[0].iFrameUrl ?? ''}
        ></IFrameComponent>
      )}
    </div>
  );
}
