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
  Event,
  GEOJSON_FEATURE_HOVER_EVENT,
  GEOJSON_FEATURE_SELECTION_EVENT,
  MAP_FOCUS_EVENT,
  PLACES_FILTER_CHANGED_EVENT,
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
  const [mapData, setMapData] = useState<MapObject[] | undefined>(
    isCombinedMap
      ? (combinedMapData?.mapObject as MapObject[])
      : tabData?.mapObject,
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [hoveredFeature, setHoveredFeature] = useState<string>('');
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(0);
  const [locateOnMap, setLocateOnMap] = useState<
    { pos: [number, number]; id: string } | undefined
  >(undefined);
  useEffect(() => {
    if (combinedMapData.combinedQueryData) {
      setQueryData(combinedMapData.combinedQueryData);
    }

    eventBus.on(YEAR_INDEX_SELECTION_EVENT, handleYearIndexUpdate);
    eventBus.on(GEOJSON_FEATURE_SELECTION_EVENT, handleSelectedFeaturesUpdate);
    eventBus.on(GEOJSON_FEATURE_HOVER_EVENT, handleHoveredFeatureUpdate);

    eventBus.on(MAP_FOCUS_EVENT, handleLocateOnMap);
    eventBus.on(PLACES_FILTER_CHANGED_EVENT, handleFilterChanged);

    return () => {
      eventBus.off(YEAR_INDEX_SELECTION_EVENT, handleYearIndexUpdate);
      eventBus.off(MAP_FOCUS_EVENT, handleLocateOnMap);
      eventBus.off(PLACES_FILTER_CHANGED_EVENT, handleFilterChanged);
      eventBus.off(
        GEOJSON_FEATURE_SELECTION_EVENT,
        handleSelectedFeaturesUpdate,
      );
      eventBus.off(GEOJSON_FEATURE_HOVER_EVENT, handleHoveredFeatureUpdate);
    };
  }, []);

  useEffect(() => {
    filterData(selectedYearIndex);
  }, [selectedYearIndex]);

  const handleLocateOnMap = (data: { data: unknown }): void => {
    const location = data.data as {
      lat: number;
      lng: number;
      id: string;
    };
    setLocateOnMap({ pos: [location.lat, location.lng], id: location.id });
  };

  const handleFilterChanged = (data: { data: unknown }): void => {
    const filteredItems = data.data as {
      location: { coordinates: [number, number] };
      name: string;
    }[];
    if (filteredItems?.length) {
      const newMapData = mapData?.filter(
        (m: MapObject & { title?: { value: string } }) => {
          const isInFilter = filteredItems.some((l) => {
            if (
              l.location.coordinates[0] === m.position.coordinates[1] &&
              l.location.coordinates[1] === m.position.coordinates[0] &&
              l.name === m.title?.value
            ) {
              return true;
            } else {
              return false;
            }
          });
          return isInFilter;
        },
      );
      setMapData(newMapData);
    } else {
      setMapData(
        isCombinedMap
          ? (combinedMapData?.mapObject as MapObject[])
          : tabData?.mapObject,
      );
    }
  };

  function handleSelectedFeaturesFromMap(features: string[]): void {
    eventBus.emit(GEOJSON_FEATURE_SELECTION_EVENT, {
      data: features,
    });
  }

  function handleHoverFeatureFromMap(feature: string): void {
    eventBus.emit(GEOJSON_FEATURE_HOVER_EVENT, {
      data: feature,
    });
  }

  function handleYearIndexUpdate(dataFromEvent: Event): void {
    setSelectedYearIndex(dataFromEvent.data);
    filterData(dataFromEvent.data);
  }

  function handleSelectedFeaturesUpdate(dataFromEvent: Event): void {
    setSelectedFeatures(dataFromEvent.data);
  }

  function handleHoveredFeatureUpdate(dataFromEvent: Event): void {
    setHoveredFeature(dataFromEvent.data);
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
          data={mapData || []}
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
          mapGeoJSONSensorBasedNoDataColor={
            tab?.mapGeoJSONSensorBasedNoDataColor || '#ff0000'
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
          mapGeoJSONHoveredFeature={hoveredFeature || ''}
          mapType={tab?.componentSubType || ''}
          isFullscreenMap={false}
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
            combinedMapData?.chartStaticValuesText
              ? ((combinedMapData?.chartStaticValuesTexts || []) as string[][])
              : ((combinedMapData?.chartStaticValues || []) as number[][])
          }
          staticValuesColors={
            combinedMapData?.chartStaticValuesColors as string[][]
          }
          staticValuesLogos={combinedMapData?.chartStaticValuesLogos || []}
          chartStyle={chartStyle}
          menuStyle={menuStyle}
          ciColors={ciColors}
          allowShare={allowShare || false}
          dashboardId={dashboardId || ''}
          allowDataExport={allowDataExport || false}
          widgetDownloadId={widgetDownloadId || ''}
          sendFeaturesToDynamicMap={handleSelectedFeaturesFromMap}
          sendHoverFeatureToDynmaicMap={handleHoverFeatureFromMap}
          locateOnMap={locateOnMap}
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
          data={mapData || []}
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
          mapGeoJSONSensorBasedNoDataColor={
            tab?.mapGeoJSONSensorBasedNoDataColor || '#ff0000'
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
          mapGeoJSONHoveredFeature={hoveredFeature || ''}
          mapType={tab?.componentSubType || ''}
          combinedQueryData={queryData}
          mapAllowLegend={tab?.mapAllowLegend || false}
          mapLegendValues={tab?.mapLegendValues ? tab?.mapLegendValues : []}
          mapLegendDisclaimer={
            tab?.mapLegendDisclaimer ? [tab?.mapLegendDisclaimer] : []
          }
          isFullscreenMap={false}
          chartStyle={chartStyle}
          menuStyle={menuStyle}
          mapAttributeForValueBased={tab?.mapAttributeForValueBased || ''}
          mapIsFormColorValueBased={tab?.mapIsFormColorValueBased || false}
          mapIsIconColorValueBased={tab?.mapIsIconColorValueBased || false}
          staticValues={
            tab?.chartStaticValuesText
              ? tab?.chartStaticValuesTexts || []
              : tab?.chartStaticValues || []
          }
          staticValuesColors={tab?.chartStaticValuesColors || []}
          staticValuesLogos={tab?.chartStaticValuesLogos || []}
          mapFormSizeFactor={tab?.mapFormSizeFactor || 1}
          mapWmsUrl={tab?.mapWmsUrl || ''}
          mapWmsLayer={tab?.mapWmsLayer || ''}
          mapUnitsTexts={tab?.mapUnitsTexts || []}
          ciColors={ciColors}
          allowShare={allowShare || false}
          dashboardId={dashboardId || ''}
          allowDataExport={allowDataExport || false}
          widgetDownloadId={widgetDownloadId || ''}
          sendFeaturesToDynamicMap={handleSelectedFeaturesFromMap}
          sendHoverFeatureToDynmaicMap={handleHoverFeatureFromMap}
          locateOnMap={locateOnMap}
        />
      )}
    </>
  );
}
