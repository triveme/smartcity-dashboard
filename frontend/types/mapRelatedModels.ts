/* eslint-disable @typescript-eslint/no-explicit-any */

import { CSSProperties } from 'react';
import {
  CorporateInfo,
  CustomMapSensor,
  MapModalLegend,
  MapModalWidget,
} from './dashboardModels';
import { QueryDataWithAttributes } from './queryData';

// Common props for both single and combined maps
export interface BaseMapProps {
  mapMaxZoom?: number;
  mapMinZoom?: number;
  mapAllowPopups?: boolean;
  mapStandardZoom?: number;
  mapAllowZoom?: boolean;
  mapAllowScroll?: boolean;
  mapAllowFilter?: boolean;
  mapFilterAttribute?: string;
  mapGeoJSON?: string;
  mapType?: string;
  mapSearch: boolean;
  mapGeoJSONSensorBasedColors?: boolean;
  mapGeoJSONSensorBasedNoDataColor?: string;
  mapGeoJSONBorderColor?: string;
  mapGeoJSONFillColor?: string;
  mapGeoJSONSelectionBorderColor?: string;
  mapGeoJSONSelectionFillColor?: string;
  mapGeoJSONHoverBorderColor?: string;
  mapGeoJSONHoverFillColor?: string;
  mapGeoJSONSensorData?: GeoJSONSensorData[];
  mapGeoJSONSelectedFeatures?: string[];
  mapGeoJSONHoveredFeature?: string;
  mapGeoJSONFeatureIdentifier?: string;
  mapAllowLegend?: boolean;
  mapLegendValues?: MapModalLegend[];
  mapLegendDisclaimer?: string[];
  mapLatitude?: number;
  mapLongitude?: number;
  mapUnitsTexts?: string[];
  data?: any[];
  mapWidgetValues?: MapModalWidget[];
  isFullscreenMap?: boolean;
  chartStyle?: MapModalChartStyle;
  menuStyle?: CSSProperties;
  ciColors?: CorporateInfo;
  allowShare?: boolean;
  dashboardId?: string;
  allowDataExport?: boolean;
  widgetDownloadId?: string;
  combinedQueryData?: QueryDataWithAttributes[];
  locateOnMap?: { pos: [number, number]; id: string };
  sendFeaturesToDynamicMap?: (features: string[]) => void;
  sendHoverFeatureToDynmaicMap?: (features: string) => void;
  handleOnMarkerClick?: (data: string) => void;
  customMapImageId?: string;
  customMapSensorValues?: CustomMapSensor[];
  isCustomMap: boolean;
}
// Single map specific props
export interface SingleMapProps extends BaseMapProps {
  mapMarkerColor: string;
  mapMarkerIcon: string;
  mapMarkerIconColor: string;
  mapActiveMarkerColor: string;
  mapShapeOption?: string;
  mapDisplayMode?: string;
  mapShapeColor?: string;
  mapAttributeForValueBased: string;
  mapFormSizeFactor: number;
  mapIsFormColorValueBased: boolean;
  mapIsIconColorValueBased: boolean;
  staticValues: (number | string)[];
  staticValuesColors: string[];
  staticValuesLogos: string[];
  mapWmsUrl: string;
  mapWmsLayer: string;
}

// Combined map specific props
export interface CombinedMapProps extends BaseMapProps {
  combinedMapData?: Record<string, boolean | any[] | null>;
  mapActiveMarkerColor: string[];
  mapMarkerColor?: string[];
  mapMarkerIconColor?: string[];
  mapMarkerIcon: string[];
  mapShapeColor?: string[];
  mapShapeOption?: string[];
  mapDisplayMode?: string[];
  mapCombinedWmsUrl?: string;
  mapCombinedWmsLayer?: string;
  mapNames?: string[];
  // Value-based coloring support for combined maps
  mapAttributeForValueBased?: string[];
  mapFormSizeFactor?: number[];
  mapIsFormColorValueBased?: boolean[];
  mapIsIconColorValueBased?: boolean[];
  staticValues?: (number | string)[][];
  staticValuesLogos?: string[][];
  staticValuesColors?: string[][];
}

export type MarkerType = {
  position: [number, number];
  title: string;
  details: any;
  dataSource?: number;
  color?: string;
  iconIndex?: number;
  unitsTexts?: string[];
};

export type SelectedMarker = {
  id: number | null;
  data: MarkerType | null;
  dataSource: number | null;
};

export type MapModalChartStyle = {
  degreeChart180BgColor: string;
  degreeChart180FillColor: string;
  degreeChart180FontColor: string;
  degreeChart180FontSize: string;
  degreeChart180UnitFontSize: string;
  stageableChartFontColor: string;
  stageableChartFontSize: string;
  stageableChartTicksFontColor: string;
  stageableChartTicksFontSize: string;
};

export type GeoJSONSensorData = {
  id: string;
  value: number;
};
