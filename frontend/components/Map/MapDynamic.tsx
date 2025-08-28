'use client';

import { CSSProperties, ReactElement, useEffect, useState } from 'react';
import Map from './Map';
import {
  CorporateInfo,
  MapModalLegend,
  MapModalWidget,
  MapObject,
  QueryDataWithAttributes,
  Tab,
  TabWithQuery,
} from '@/types';
import {
  GeoJSONSensorData,
  MapModalChartStyle,
} from '@/types/mapRelatedModels';
import eventBus, {
  GEOJSON_FEATURE_SELECTION_EVENT,
  YEAR_INDEX_SELECTION_EVENT,
} from '@/app/EventBus';

type MapDynamicProps = {
  isCombinedMap: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabData?: any;
  chartStyle?: MapModalChartStyle;
  menuStyle?: CSSProperties;
  ciColors?: CorporateInfo;
  allowShare?: boolean;
  dashboardId?: string;
  allowDataExport?: boolean;
  widgetDownloadId?: string;
  tab?: Tab | TabWithQuery;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  combinedMapData: any;
};

export default function MapDynamic(props: MapDynamicProps): ReactElement {
  const {
    isCombinedMap,
    tabData,
    chartStyle,
    menuStyle,
    ciColors,
    allowShare,
    dashboardId,
    allowDataExport,
    widgetDownloadId,
    tab,
    combinedMapData,
  } = props;

  const [queryData, setQueryData] = useState<QueryDataWithAttributes[]>([]);
  const [filteredData, setFilteredData] = useState<GeoJSONSensorData[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(0);

  useEffect(() => {
    if (combinedMapData.combinedQueryData) {
      setQueryData(combinedMapData.combinedQueryData);
    }

    eventBus.on(YEAR_INDEX_SELECTION_EVENT, handleYearIndexUpdate);
    eventBus.on(GEOJSON_FEATURE_SELECTION_EVENT, handleSelectedFeaturesUpdate);

    return () => {
      eventBus.off(YEAR_INDEX_SELECTION_EVENT, handleYearIndexUpdate);
      eventBus.off(
        GEOJSON_FEATURE_SELECTION_EVENT,
        handleSelectedFeaturesUpdate,
      );
    };
  }, []);

  useEffect(() => {
    filterData(selectedYearIndex);
  }, [selectedYearIndex]);

  function handleFeaturesFromMap(features: string[]): void {
    eventBus.emit(GEOJSON_FEATURE_SELECTION_EVENT, {
      data: features,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleYearIndexUpdate(dataFromEvent: any): void {
    setSelectedYearIndex(dataFromEvent.data);
    filterData(dataFromEvent.data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleSelectedFeaturesUpdate(dataFromEvent: any): void {
    setSelectedFeatures(dataFromEvent.data);
  }

  function filterData(sYearIndex: number): void {
    if (tabData?.chartData) {
      const data: GeoJSONSensorData[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chartData: { id: string; values: any[][] }[] = tabData?.chartData;
      chartData.forEach((element) => {
        data.push({ id: element.id, value: element.values[sYearIndex]?.[1] });
      });
      if (data.some((d) => d === null || d === undefined)) {
        setFilteredData([]);
      } else {
        setFilteredData(data);
      }
    }
  }

  return (
    <>
      {isCombinedMap ? (
        <Map
          data={combinedMapData?.mapObject as MapObject[]}
          combinedMapData={combinedMapData}
          mapAllowFilter={true}
          combinedQueryData={queryData}
          mapAllowPopups={combinedMapData?.mapAllowPopups as boolean}
          mapAllowScroll={combinedMapData?.mapAllowScroll as boolean}
          mapAllowZoom={combinedMapData?.mapAllowZoom as boolean}
          mapAllowLegend={combinedMapData?.mapAllowLegend as boolean}
          mapLegendValues={combinedMapData?.mapLegendValues as MapModalLegend[]}
          mapLegendDisclaimer={combinedMapData?.mapLegendDisclaimer as string[]}
          mapActiveMarkerColor={
            combinedMapData?.mapActiveMarkerColor as string[]
          }
          mapMarkerColor={combinedMapData?.mapMarkerColor as string[]}
          mapMarkerIcon={combinedMapData?.mapMarkerIcon as string[]}
          mapMarkerIconColor={combinedMapData?.mapMarkerIconColor as string[]}
          mapShapeOption={combinedMapData?.mapShapeOption as string[]}
          mapShapeColor={combinedMapData?.mapShapeColor as string[]}
          mapDisplayMode={combinedMapData?.mapDisplayMode as string[]}
          mapWidgetValues={combinedMapData?.mapWidgetValues as MapModalWidget[]}
          mapCombinedWmsUrl={tab?.mapCombinedWmsUrl || ''}
          mapCombinedWmsLayer={tab?.mapCombinedWmsLayer || ''}
          mapNames={(combinedMapData?.mapNames as string[]) || []}
          mapGeoJSON={tab?.mapGeoJSON || ''}
          mapGeoJSONSensorBasedColors={
            tab?.mapGeoJSONSensorBasedColors || false
          }
          mapGeoJSONBorderColor={tab?.mapGeoJSONBorderColor || '#3388ff'}
          mapGeoJSONFillColor={tab?.mapGeoJSONFillColor || '#3388ff'}
          mapGeoJSONSelectionBorderColor={
            tab?.mapGeoJSONSelectionBorderColor || '#0b63de'
          }
          mapGeoJSONSelectionFillColor={
            tab?.mapGeoJSONSelectionFillColor || '#0b63de'
          }
          mapGeoJSONHoverBorderColor={
            tab?.mapGeoJSONHoverBorderColor || '#0347a6'
          }
          mapGeoJSONHoverFillColor={tab?.mapGeoJSONHoverFillColor || '#0347a6'}
          mapGeoJSONSensorData={filteredData || []}
          mapGeoJSONSelectedFeatures={selectedFeatures || []}
          mapType={tab?.componentSubType || ''}
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
          staticValues={combinedMapData?.chartStaticValues as number[][]}
          staticValuesColors={
            combinedMapData?.chartStaticValuesColors as string[][]
          }
          chartStyle={chartStyle}
          menuStyle={menuStyle}
          ciColors={ciColors}
          allowShare={allowShare || false}
          dashboardId={dashboardId || ''}
          allowDataExport={allowDataExport || false}
          widgetDownloadId={widgetDownloadId || ''}
          sendFeaturesToDynamicMap={handleFeaturesFromMap}
        />
      ) : (
        <Map
          mapMaxZoom={tab?.mapMaxZoom || 18}
          mapMinZoom={tab?.mapMinZoom || 0}
          mapAllowPopups={tab?.mapAllowPopups || false}
          mapStandardZoom={tab?.mapStandardZoom || 13}
          mapAllowZoom={tab?.mapAllowZoom || false}
          mapAllowScroll={tab?.mapAllowScroll || false}
          mapMarkerColor={tab?.mapMarkerColor || '#257dc9'}
          mapMarkerIcon={tab?.mapMarkerIcon || ''}
          mapMarkerIconColor={tab?.mapMarkerIconColor || 'white'}
          mapLongitude={tab?.mapLongitude ? tab?.mapLongitude : 13.404954}
          mapLatitude={tab?.mapLatitude ? tab?.mapLatitude : 52.520008}
          mapActiveMarkerColor={tab?.mapActiveMarkerColor || '#FF0000'}
          data={tabData?.mapObject || []}
          mapDisplayMode={
            tab?.mapDisplayMode ? tab?.mapDisplayMode : 'Only pin'
          }
          mapShapeOption={
            tab?.mapShapeOption ? tab?.mapShapeOption : 'Rectangle'
          }
          mapShapeColor={tab?.mapShapeColor ? tab?.mapShapeColor : '#FF0000'}
          mapWidgetValues={tab?.mapWidgetValues ? tab?.mapWidgetValues : []}
          mapAllowFilter={tab?.mapAllowFilter || false}
          mapFilterAttribute={tab?.mapFilterAttribute || ''}
          mapGeoJSON={tab?.mapGeoJSON || ''}
          mapGeoJSONSensorBasedColors={
            tab?.mapGeoJSONSensorBasedColors || false
          }
          mapGeoJSONBorderColor={tab?.mapGeoJSONBorderColor || '#3388ff'}
          mapGeoJSONFillColor={tab?.mapGeoJSONFillColor || '#3388ff'}
          mapGeoJSONSelectionBorderColor={
            tab?.mapGeoJSONSelectionBorderColor || '#0b63de'
          }
          mapGeoJSONSelectionFillColor={
            tab?.mapGeoJSONSelectionFillColor || '#0b63de'
          }
          mapGeoJSONHoverBorderColor={
            tab?.mapGeoJSONHoverBorderColor || '#0347a6'
          }
          mapGeoJSONHoverFillColor={tab?.mapGeoJSONHoverFillColor || '#0347a6'}
          mapGeoJSONSensorData={filteredData || []}
          mapGeoJSONSelectedFeatures={selectedFeatures || []}
          mapType={tab?.componentSubType || ''}
          combinedQueryData={queryData}
          mapAllowLegend={tab?.mapAllowLegend || false}
          mapLegendValues={tab?.mapLegendValues ? tab?.mapLegendValues : []}
          mapLegendDisclaimer={
            tab?.mapLegendDisclaimer ? [tab?.mapLegendDisclaimer] : []
          }
          isFullscreenMap={true}
          chartStyle={chartStyle}
          menuStyle={menuStyle}
          mapAttributeForValueBased={tab?.mapAttributeForValueBased || ''}
          mapIsFormColorValueBased={tab?.mapIsFormColorValueBased || false}
          mapIsIconColorValueBased={tab?.mapIsIconColorValueBased || false}
          staticValues={tab?.chartStaticValues || []}
          staticValuesColors={tab?.chartStaticValuesColors || []}
          mapFormSizeFactor={tab?.mapFormSizeFactor || 1}
          mapWmsUrl={tab?.mapWmsUrl || ''}
          mapWmsLayer={tab?.mapWmsLayer || ''}
          ciColors={ciColors}
          allowShare={allowShare || false}
          dashboardId={dashboardId || ''}
          allowDataExport={allowDataExport || false}
          widgetDownloadId={widgetDownloadId || ''}
          sendFeaturesToDynamicMap={handleFeaturesFromMap}
        />
      )}
    </>
  );
}
