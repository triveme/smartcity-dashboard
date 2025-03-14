import { CSSProperties, ReactElement } from 'react';
import nextDynamic from 'next/dynamic';
import { cookies } from 'next/headers';

import PageHeadline from '@/ui/PageHeadline';
import {
  CorporateInfo,
  DashboardWithContent,
  MapModalChartStyle,
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

  const MapWithNoSSR = nextDynamic(() => import('@/components/Map/Map'), {
    // ssr: false,
  });
  const CombinedMapWithNoSSR = nextDynamic(
    () => import('@/components/Map/CombinedMap'),
    {
      // ssr: false,
    },
  );

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

  const tab = dashboard?.panels?.[0]?.widgets?.[0]?.tabs?.[0];
  let combinedMapData;
  let combinedQueryData;

  if (tab?.componentType === tabComponentTypeEnum.map) {
    const combinedWidgets: WidgetWithContent[] = isTabOfTypeCombinedWidget(
      dashboard?.panels?.[0]?.widgets?.[0]?.tabs?.[0],
    )
      ? (
          dashboard?.panels?.[0]?.widgets?.[0]
            ?.tabs?.[0] as TabWithCombinedWidgets
        ).combinedWidgets
      : [];

    // combine all attributes other than queryData
    combinedMapData = combineWidgetAttributes(combinedWidgets);

    const isSingleMap =
      tab.componentType === tabComponentTypeEnum.map &&
      tab.componentSubType !== tabComponentSubTypeEnum.combinedMap;
    const singleMapQueryData = (
      dashboard.panels?.[0]?.widgets?.[0].tabs?.[0] as TabWithQuery
    )?.query?.queryData;
    const mapFilterAttribute =
      dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapFilterAttribute || '';

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
    <div style={dashboardStyle} className="w-full h-full overflow-auto">
      {dashboard.type !== 'Karte' && (
        <div className="p-4 w-full">
          <div className="w-full flex justify-between items-center">
            <div className="w-full flex justify-start items-center gap-x-2">
              <div>
                <PageHeadline
                  headline={dashboard.name || 'Dashboardseite'}
                  fontColor={dashboard.headlineColor}
                  fontSize={generateResponsiveFontSize(
                    parseInt(ciColors.dashboardHeadlineFontSize || '18', 10),
                  )}
                />
              </div>
              {isEditable ? (
                <RedirectPageButton
                  url={`/${tenant}/admin/pages/edit?id=${dashboard?.id}`}
                  isShortStyle={true}
                />
              ) : null}
            </div>
            {dashboard.allowDataExport && (
              <DataExportButton id={dashboard.id || ''} type="dashboard" />
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
      {dashboard.type === 'Karte' &&
        dashboard?.panels?.[0].widgets?.[0].tabs?.[0].componentSubType !==
          tabComponentSubTypeEnum.combinedMap && (
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
                dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapMarkerIcon ||
                ''
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
              data={
                dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapObject || []
              }
              mapDisplayMode={
                dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapDisplayMode
                  ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapDisplayMode
                  : 'Only pin'
              }
              mapShapeOption={
                dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapShapeOption
                  ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapShapeOption
                  : 'Rectangle'
              }
              mapShapeColor={
                dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapShapeColor
                  ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapShapeColor
                  : '#FF0000'
              }
              mapWidgetValues={
                dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapWidgetValues
                  ? dashboard.panels?.[0]?.widgets?.[0].tabs?.[0]
                      .mapWidgetValues
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
              combinedQueryData={combinedQueryData as QueryDataWithAttributes[]}
              mapAllowLegend={
                dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapAllowLegend ||
                false
              }
              mapLegendValues={
                dashboard.panels?.[0]?.widgets?.[0].tabs?.[0].mapLegendValues
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
              mapAttributeForValueBased={tab.mapAttributeForValueBased || ''}
              mapIsFormColorValueBased={tab.mapIsFormColorValueBased || false}
              mapIsIconColorValueBased={tab.mapIsIconColorValueBased || false}
              staticValues={tab.chartStaticValues || []}
              staticValuesColors={tab.chartStaticValuesColors || []}
              mapFormSizeFactor={tab.mapFormSizeFactor || 1}
              mapWmsUrl={tab.mapWmsUrl || ''}
              mapWmsLayer={tab.mapWmsLayer || ''}
              ciColors={ciColors}
              // both dashboard and widget have to allowDataExport
              allowDataExport={
                dashboard.allowDataExport &&
                dashboard.panels?.[0].widgets?.[0].allowDataExport
              }
              widgetDownloadId={dashboard.panels?.[0].widgets?.[0].id || ''}
            />
          </div>
        )}
      {dashboard.type === 'Karte' &&
        dashboard?.panels?.[0].widgets?.[0].tabs?.[0].componentSubType ===
          tabComponentSubTypeEnum.combinedMap && (
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
              mapCombinedWmsUrl={
                dashboard.panels?.[0].widgets?.[0].tabs?.[0]
                  .mapCombinedWmsUrl || ''
              }
              mapCombinedWmsLayer={
                dashboard.panels?.[0].widgets?.[0].tabs?.[0]
                  .mapCombinedWmsLayer || ''
              }
              mapNames={(combinedMapData?.mapNames as string[]) || []}
              isFullscreenMap={true}
              chartStyle={chartStyle}
              menuStyle={menuStyle}
              ciColors={ciColors}
              allowDataExport={
                dashboard.allowDataExport &&
                dashboard.panels?.[0].widgets?.[0].allowDataExport
              }
              widgetDownloadId={dashboard.panels?.[0].widgets?.[0].id || ''}
            />
          </div>
        )}
    </div>
  );
}
