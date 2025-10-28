/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState, useRef, CSSProperties, JSX } from 'react';
import {
  MapContainer,
  TileLayer,
  Popup,
  Rectangle,
  Circle,
  Polygon,
  WMSTileLayer,
  Marker,
  GeoJSON,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import L, { LatLngExpression, LeafletEvent, PathOptions } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import { env } from 'next-runtime-env';

import '@/components/Map/map.css';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import SetViewToBounds from './SetViewToBounds';
import { tabComponentSubTypeEnum } from '@/types';
import MapModal from './MapModal';
import MapPopupContent from './MapPopupContent';
import { DEFAULT_MARKERS, DUMMY_GEOJSON } from '@/utils/objectHelper';
import MapFilterModal from './MapFilterModal';
import MapLegendModal from './MapLegendModal';
import {
  createHexagonAroundMarker,
  createRectangleAroundMarker,
  createSquareAroundMarker,
  ZoomHandler,
  getColorForValue,
  createCustomIcon,
  createClusterCustomIcon,
  findValidWmsConfig,
  getIconForValue,
} from './MapUtils';
import DataExportButton from '@/ui/Buttons/DataExportButton';
import ShareLinkButton from '@/ui/Buttons/ShareLinkButton';
import {
  CombinedMapProps,
  MarkerType,
  SelectedMarker,
  SingleMapProps,
} from '@/types/mapRelatedModels';
import { MapRef } from 'react-leaflet/MapContainer';

// Union type for the component props
type MapNewProps = SingleMapProps | CombinedMapProps;

// Type guard to check if props are for a combined map
function isCombinedMapProps(props: MapNewProps): props is CombinedMapProps {
  return Array.isArray((props as CombinedMapProps).mapActiveMarkerColor);
}

export default function MapNew(props: MapNewProps): JSX.Element {
  const {
    isFullscreenMap,
    menuStyle,
    ciColors,
    allowShare,
    dashboardId,
    allowDataExport,
    widgetDownloadId,
    mapGeoJSONSelectedFeatures,
    mapGeoJSONHoveredFeature,
    locateOnMap,
  } = props;

  const isCombinedMap = isCombinedMapProps(props);

  const userLocale =
    typeof window !== 'undefined' ? navigator.language || 'en-US' : 'en-US';
  const numberFormat = new Intl.NumberFormat(userLocale);
  const decimalSeparator = numberFormat.format(1.1).charAt(1);

  const [mapZoom, setMapZoom] = useState(6);
  const iconRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapRef>(null);

  // const popupRefsMap = useRef<Map<string, L.Popup>>(new Map<string, L.Popup>());

  const [iconSvgMarkup, setIconSvgMarkup] = useState<string | string[]>('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker>({
    id: null,
    data: null,
    dataSource: null,
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);
  const [selectedMapFilterAttribute, setSelectedMapFilterAttribute] =
    useState('');
  const [selectedFilters, setSelectedFilters] = useState<(string | number)[]>(
    [],
  );
  const [selectedDataSources, setSelectedDataSources] = useState<number[]>([]);

  useEffect(() => {
    if (locateOnMap) {
      handleLocateOnMap({
        data: {
          lat: locateOnMap.pos[0],
          lng: locateOnMap.pos[1],
          id: locateOnMap.id,
        },
      });
    }
  }, [locateOnMap]);

  const selectedMapFeatures = useRef<string[]>([]);
  const hoveredMapFeature = useRef<string>('');

  const geoJSonLayers = useRef<{ [id: string]: L.GeoJSON }>({});

  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/${
    props.mapType === tabComponentSubTypeEnum.geoJSON ||
    props.mapType === tabComponentSubTypeEnum.geoJSONDynamic
      ? 'light-v11'
      : 'streets-v12'
  }/tiles/256/{z}/{x}/{y}?access_token=${env('NEXT_PUBLIC_MAPBOX_TOKEN')}`;

  const handleFilterChange = (
    newSelectedFilters: (string | number)[],
    filterAttribute?: string,
  ): void => {
    setSelectedFilters(newSelectedFilters);
    if (filterAttribute) {
      setSelectedMapFilterAttribute(filterAttribute);
    }
  };

  const highlightLocated = async (i: number, m: MarkerType): Promise<void> => {
    setSelectedMarker({
      id: i,
      data: m,
      dataSource: m.dataSource ?? 0,
    });
    setTimeout(() => {
      handleOnCloseModal();
    }, 1000);
  };

  const handleLocateOnMap = (data: { data: unknown }): void => {
    mapRef.current?.closePopup();
    const location = data.data as {
      lat: number;
      lng: number;
      id: string;
    };
    // mapRef.current?.setZoomAround(location, mapRef.current?.getMaxZoom() - 2);
    mapRef.current?.setView(location, mapRef.current?.getMaxZoom() - 2);
    const mains = getFilteredMarkers();
    const i = mains.findIndex((marker) => {
      if (
        marker.position[0] === location.lat &&
        marker.position[1] === location.lng &&
        marker.details.id === location.id
      ) {
        return marker;
      }
    });

    if (i > -1) {
      const m = mains[i];
      highlightLocated(i, m);
      // const pRef = popupRefsMap.current.get(m.details.id);
      // // const pRef = popupRefs.current[i];
      // if (pRef) {
      //   try {
      //     mapRef.current?.openPopup(pRef);
      //   } catch (error) {
      //     console.log('popup-error', error);
      //     mapRef.current?.closePopup();
      //     handleOnCloseModal();
      //   }
      // }
    }
  };

  const handleDataSourceFilterChange = (
    mapIndex: number,
    checked: boolean,
  ): void => {
    const updatedDataSources = checked
      ? [...selectedDataSources, mapIndex]
      : selectedDataSources.filter((source) => source !== mapIndex);

    setSelectedDataSources(updatedDataSources);
  };

  const closeFilterModal = (): void => {
    setIsFilterModalOpen(false);
  };

  const closeLegendModal = (): void => {
    setIsLegendModalOpen(false);
  };

  const toggleFilterModal = (): void => {
    if (
      ((isFullscreenMap && isMobileView) || !isFullscreenMap) &&
      isLegendModalOpen
    ) {
      closeLegendModal();
    }
    setIsFilterModalOpen(!isFilterModalOpen);
  };

  const toggleLegendModal = (): void => {
    if (
      ((isFullscreenMap && isMobileView) || !isFullscreenMap) &&
      isFilterModalOpen
    ) {
      closeFilterModal();
    }
    setIsLegendModalOpen(!isLegendModalOpen);
  };
  const getIconForMarker = (marker: MarkerType, markerValue: any): string => {
    if (!isCombinedMap) {
      const singleProps = props as SingleMapProps;
      // Use form-based value coloring if the flag is set
      if (
        singleProps.mapIsFormColorValueBased ||
        singleProps.mapIsIconColorValueBased
      ) {
        return getIconForValue(
          markerValue,
          singleProps.staticValues,
          singleProps.staticValuesLogos,
          singleProps.mapMarkerIcon,
        );
      }
      return singleProps.mapMarkerIcon || '';
    } else {
      // For combined maps, check if value-based coloring is enabled
      const combinedProps = props as CombinedMapProps;
      const dataSource = marker.dataSource ?? 0; // Default to 0 if undefined

      // Use form-based value coloring if the flag is set for this data source
      const fallback = combinedProps.mapMarkerIcon?.[dataSource];
      if (
        (combinedProps.mapIsFormColorValueBased?.[dataSource] ||
          combinedProps.mapIsIconColorValueBased?.[dataSource]) &&
        markerValue !== undefined
      ) {
        const staticValues = combinedProps.staticValues?.[dataSource];
        const staticColors = combinedProps.staticValuesLogos?.[dataSource];
        if (staticValues && staticColors) {
          const icon = getIconForValue(
            markerValue,
            staticValues,
            staticColors,
            fallback,
          );
          return icon;
        }
      }
      return fallback;
    }
  };

  const getColorForMarker = (marker: MarkerType, markerValue: any): string => {
    if (!isCombinedMap) {
      const singleProps = props as SingleMapProps;
      // Use form-based value coloring if the flag is set
      if (singleProps.mapIsFormColorValueBased) {
        return getColorForValue(
          markerValue,
          singleProps.staticValues,
          singleProps.staticValuesColors,
        );
      }

      // Use icon-based value coloring if the flag is set
      if (singleProps.mapIsIconColorValueBased) {
        return getColorForValue(
          markerValue,
          singleProps.staticValues,
          singleProps.staticValuesColors,
        );
      }

      // Default to static color if value-based coloring isn't enabled
      return singleProps.mapMarkerColor || '#000000';
    }

    // For combined maps, check if value-based coloring is enabled
    const combinedProps = props as CombinedMapProps;
    const dataSource = marker.dataSource ?? 0; // Default to 0 if undefined

    // Use form-based value coloring if the flag is set for this data source
    if (
      combinedProps.mapIsFormColorValueBased?.[dataSource] &&
      markerValue !== undefined
    ) {
      const staticValues = combinedProps.staticValues?.[dataSource];
      const staticColors = combinedProps.staticValuesColors?.[dataSource];
      if (staticValues && staticColors) {
        const color = getColorForValue(markerValue, staticValues, staticColors);
        return color;
      }
    }

    // Use icon-based value coloring if the flag is set for this data source
    if (
      combinedProps.mapIsIconColorValueBased?.[dataSource] &&
      markerValue !== undefined
    ) {
      const staticValues = combinedProps.staticValues?.[dataSource];
      const staticColors = combinedProps.staticValuesColors?.[dataSource];
      if (staticValues && staticColors) {
        const color = getColorForValue(markerValue, staticValues, staticColors);
        return color;
      }
    }

    // Default to marker color for this data source if value-based coloring isn't enabled
    const fallbackColor =
      combinedProps.mapMarkerColor?.[dataSource] ||
      combinedProps.mapShapeColor?.[dataSource] ||
      '#000000';
    return fallbackColor;
  };

  const geoJSONData = (props.mapGeoJSON ? props.mapGeoJSON : '') as any;

  const markerPositions: MarkerType[] = (props.data || []).map(
    (mapObject, index) => {
      let markerValue;
      let title;
      let color = '#000000';
      if (isCombinedMap) {
        // Combined map logic
        const combinedProps = props as CombinedMapProps;
        title = mapObject.name ? mapObject.name.value : `Sensor ${index + 1}`;

        // Extract marker value for combined maps if value-based coloring is enabled
        const dataSource = mapObject.dataSource ?? 0; // Default to 0 if undefined

        if (
          combinedProps.mapIsIconColorValueBased?.[dataSource] ||
          combinedProps.mapIsFormColorValueBased?.[dataSource]
        ) {
          const valueAttribute =
            combinedProps.mapAttributeForValueBased?.[dataSource];
          if (valueAttribute) {
            if (mapObject[valueAttribute]?.value !== undefined) {
              markerValue = mapObject[valueAttribute].value;
            } else if (mapObject[valueAttribute] !== undefined) {
              markerValue = mapObject[valueAttribute];
            }
          }
        }

        color = getColorForMarker(
          { ...mapObject, dataSource: dataSource },
          markerValue,
        );
      } else {
        // Single map logic
        const singleProps = props as SingleMapProps;
        // Handle different data structures for the attribute value
        // Only extract markerValue if value-based coloring is enabled
        if (
          singleProps.mapIsIconColorValueBased ||
          singleProps.mapIsFormColorValueBased
        ) {
          if (
            mapObject[singleProps.mapAttributeForValueBased]?.value !==
            undefined
          ) {
            markerValue =
              mapObject[singleProps.mapAttributeForValueBased].value;
          } else {
            markerValue = mapObject[singleProps.mapAttributeForValueBased];
          }
        }

        // Handle different data structures for the name/title
        if (mapObject.name?.value) {
          title = mapObject.name.value;
        } else if (mapObject.name) {
          title = mapObject.name;
        } else {
          title = `Sensor ${index + 1}`;
        }

        color = getColorForMarker(mapObject, markerValue);
      }
      const icon = getIconForMarker(mapObject, markerValue);
      let iconIndex = 0;
      if (isCombinedMap) {
        const dataSource = mapObject.dataSource ?? 0; // Default to 0 if undefined
        const staticValuesLogos = props.staticValuesLogos?.[dataSource] ?? [];
        iconIndex = staticValuesLogos.indexOf(icon);
      } else {
        iconIndex = props.staticValuesLogos?.indexOf(icon);
      }
      return {
        position: mapObject.position.coordinates ?? [52.520008, 13.404954],
        title: title,
        details: mapObject,
        dataSource: mapObject.dataSource,
        color: color,
        iconIndex: iconIndex + 1, // +1 bc of default icon at index 0
      };
    },
  );

  const getFilteredMarkers = (): MarkerType[] => {
    return markerPositions.filter((marker) => {
      // Filter by attribute and value
      if (selectedFilters.length > 0) {
        const filterAttribute = isCombinedMap
          ? selectedMapFilterAttribute
          : props.mapFilterAttribute;
        if (!filterAttribute) return false;
        const attributeDetails = marker.details[filterAttribute];
        if (!attributeDetails) return false;

        let propertyValue;
        if (attributeDetails.value !== undefined) {
          propertyValue = attributeDetails.value;
        } else {
          propertyValue = attributeDetails;
        }

        const normalizedValue =
          parseFloat(propertyValue) === 0 ? 0 : propertyValue;
        if (!selectedFilters.includes(normalizedValue)) return false;
      }

      // Filter by dataSource (map selection) - only for combined maps
      if (
        isCombinedMap &&
        selectedDataSources.length > 0 &&
        !selectedDataSources.includes(marker.dataSource ?? -1)
      ) {
        return false;
      }

      return true;
    });
  };

  const getColorForGeoJSONFeature = (
    featureId: string,
    defaultColor: string,
  ): string => {
    const combinedProps = props as CombinedMapProps;
    const values = props.mapGeoJSONSensorData?.filter(
      (item) => item.id == featureId,
    );
    if (values) {
      const value =
        values?.reduce((sum, current) => sum + current.value, 0) /
        values?.length;
      if (
        combinedProps.mapGeoJSONSensorBasedColors &&
        value &&
        !Number.isNaN(value)
      ) {
        if (
          Object.prototype.toString.call(props.staticValues?.[0]) ===
          '[object Array]'
        ) {
          const staticValues = combinedProps.staticValues?.[0];
          const staticColors = combinedProps.staticValuesColors?.[0];
          if (staticValues && staticColors) {
            return getColorForValue(value, staticValues, staticColors);
          }
        } else {
          return getColorForValue(
            value,
            (props.staticValues as (string | number)[]) || [],
            (props.staticValuesColors as string[]) || [],
          );
        }
      }
    }

    // Default to marker color for this data source if value-based coloring isn't enabled
    const fallbackColor =
      defaultColor || combinedProps.mapGeoJSONFillColor || '#000000';
    return fallbackColor;
  };

  function geoJSONStyle(
    feature?: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>,
    hovered: boolean = false,
  ): PathOptions {
    const geoJSONId = geoJSONGetIDProperty(feature?.properties);
    if (selectedMapFeatures.current.includes(geoJSONId)) {
      if (geoJSonLayers.current[geoJSONId]) {
        geoJSonLayers.current[geoJSONId].bringToFront();
      }

      return {
        color: props.mapGeoJSONSelectionBorderColor,
        fillColor: getColorForGeoJSONFeature(
          geoJSONId,
          props.mapGeoJSONSelectionFillColor!,
        ),
        fillOpacity: 0.4,
        weight: 2.5,
      };
    } else {
      if (geoJSonLayers.current[geoJSONId]) {
        geoJSonLayers.current[geoJSONId].bringToBack();
      }
    }
    if (hoveredMapFeature.current.includes(geoJSONId) || hovered) {
      return {
        color: props.mapGeoJSONHoverBorderColor,
        fillColor: props.mapGeoJSONHoverFillColor,
        fillOpacity: 0.5,
        weight: 1.5,
      };
    }
    return {
      color: props.mapGeoJSONBorderColor,
      fillColor: getColorForGeoJSONFeature(
        geoJSONId,
        props.mapGeoJSONFillColor!,
      ),
      fillOpacity: 0.3,
      weight: 1,
    };
  }

  function geoJSONOnEachFeature(
    feature: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>,
    layer: L.GeoJSON,
  ): void {
    layer.on({
      mouseover: geoJSONOnMouseOver,
      mouseout: geoJSONOnMouseOut,
      click: geoJSONOnMouseClick,
    });
    let tooltip: string = feature.properties?.GEN;
    const geoJSONId: string = geoJSONGetIDProperty(feature?.properties);
    if (props.mapGeoJSONSensorData && props.mapGeoJSONSensorData.length > 0) {
      const tooltipValue = props.mapGeoJSONSensorData?.find(
        (x) => x.id === geoJSONId,
      )?.value;
      if (tooltipValue) {
        tooltip += ': ' + tooltipValue;
      }
    }
    if (selectedMapFeatures.current.includes(geoJSONId)) {
      layer.bringToFront();
    } else {
      layer.bringToBack();
    }

    layer.bindTooltip(tooltip);

    geoJSonLayers.current[geoJSONId] = layer;
  }

  function geoJSONOnMouseOver(event: LeafletEvent): void {
    event.target.bringToFront();
    event.target.setStyle(geoJSONStyle(event.target.feature, true));

    if (props.sendHoverFeatureToDynmaicMap) {
      hoveredMapFeature.current = geoJSONGetIDProperty(
        event.target.feature.properties,
      );
      props.sendHoverFeatureToDynmaicMap(hoveredMapFeature.current);
    }
  }

  function geoJSONOnMouseOut(event: LeafletEvent): void {
    const geoJSONId = geoJSONGetIDProperty(event.target.feature.properties);
    if (!selectedMapFeatures.current.includes(geoJSONId)) {
      event.target.bringToBack();
    }
    event.target.setStyle(geoJSONStyle(event.target.feature));

    if (
      hoveredMapFeature.current ==
        geoJSONGetIDProperty(event.target.feature.properties) &&
      props.sendHoverFeatureToDynmaicMap
    ) {
      props.sendHoverFeatureToDynmaicMap('');
      hoveredMapFeature.current = '';
    }
  }

  function geoJSONOnMouseClick(event: LeafletEvent): void {
    const geoJSONId = geoJSONGetIDProperty(event.target.feature.properties);
    const id = selectedMapFeatures.current.findIndex((x) => x == geoJSONId);
    if (id != -1) {
      event.target.bringToBack();
      selectedMapFeatures.current.splice(id, 1);
    } else {
      event.target.bringToFront();
      selectedMapFeatures.current.push(geoJSONId);
    }
    if (props.sendFeaturesToDynamicMap) {
      props.sendFeaturesToDynamicMap(selectedMapFeatures.current);
    }
    event.target.setStyle(geoJSONStyle(event.target.feature));
  }

  function geoJSONGetIDProperty(properties: any): any {
    let id = '';
    if (props.mapGeoJSONFeatureIdentifier) {
      id = properties[props.mapGeoJSONFeatureIdentifier];
    } else {
      id = properties['AGS'];
    }
    if (id.substring(0, 1) == '0') {
      return id.substring(1);
    }
    return id;
  }

  const POSITION_CLASSES = {
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function GeoJSONLegend() {
    let staticValues: (number | string)[] = [];
    let staticColors: string[] = [];
    if (
      Object.prototype.toString.call(props.staticValues?.[0]) ===
      '[object Array]'
    ) {
      const combinedProps = props as CombinedMapProps;
      staticValues = combinedProps.staticValues?.[0] || [];
      staticColors = combinedProps.staticValuesColors?.[0] || [];
    } else {
      staticValues = (props.staticValues as number[]) || [];
      staticColors = (props.staticValuesColors as string[]) || [];
    }

    const labels = [];
    let from;
    let to;

    for (let i = 0; i < staticValues.length; i++) {
      from = staticValues[i];
      to = staticValues[i + 1];

      labels.push(
        '<i style="background:' +
          staticColors[i] +
          '"></i> ' +
          from +
          (to ? '&ndash;' + to : '+'),
      );
    }

    return (
      <div className="leaflet-control-container">
        <div className={POSITION_CLASSES.bottomleft}>
          <div className="leaflet-control leaflet-bar">
            <div
              className="geoJSONLegend"
              dangerouslySetInnerHTML={{
                __html: labels.join('<br>'),
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  const renderShape = (
    position: [number, number],
    shapeType: string,
    color: string,
    dataSource: number,
  ): JSX.Element => {
    const sizeFactor = isCombinedMap
      ? 1
      : (props as SingleMapProps).mapFormSizeFactor;

    switch (shapeType) {
      case 'Circle':
        return (
          <Circle
            key={`${color}-${dataSource}`}
            center={position}
            radius={isCombinedMap ? 1000 : 100 * sizeFactor}
            color={color}
            fillColor={color}
            fillOpacity={0.1}
          />
        );
      case 'Hexagon':
        return (
          <Polygon
            key={`${color}-${dataSource}`}
            positions={createHexagonAroundMarker(position, sizeFactor)}
            color={color}
            fillColor={color}
            fillOpacity={0.1}
          />
        );
      case 'Rectangle':
        return (
          <Rectangle
            key={`${color}-${dataSource}`}
            bounds={createRectangleAroundMarker(position, sizeFactor)}
            color={color}
            weight={2}
            fillColor={color}
            fillOpacity={0.1}
          />
        );
      default: // 'Square'
        return (
          <Rectangle
            key={`${color}-${dataSource}`}
            bounds={createSquareAroundMarker(position, sizeFactor)}
            color={color}
            weight={2}
            fillColor={color}
            fillOpacity={0.1}
          />
        );
    }
  };

  function handleOnCloseModal(): void {
    setSelectedMarker({
      id: null,
      data: null,
      dataSource: null,
    });
  }

  const getDivStyle = (): CSSProperties => {
    if (isFullscreenMap && !isMobileView) {
      return {
        zIndex: 1000,
        position: 'fixed',
        bottom: '1rem',
        fontSize: '1rem',
      };
    } else if (isFullscreenMap && isMobileView) {
      return {
        zIndex: 1000,
        position: 'fixed',
        bottom: '1.5rem',
        left: '4rem',
      };
    } else if (!isFullscreenMap && !isMobileView) {
      return {
        zIndex: 1000,
        position: 'absolute',
        bottom: '1.5rem',
      };
    } else {
      return {
        zIndex: 1000,
        position: 'absolute',
        bottom: '3rem',
        left: '1rem',
      };
    }
  };

  const renderPopupContent = (marker: MarkerType): JSX.Element => (
    <MapPopupContent
      marker={marker}
      isCombinedMap={isCombinedMap}
      decimalSeparator={decimalSeparator}
    />
  );

  // Get marker colors and icons based on map type
  const getMarkerProps = (
    dataSource: number,
    isSelected: boolean,
  ): {
    color: string;
    iconIndex: number;
    shapeType: string;
    displayMode: string;
  } => {
    if (isCombinedMap) {
      const combinedProps = props as CombinedMapProps;
      return {
        color: isSelected
          ? combinedProps.mapActiveMarkerColor[dataSource] ||
            combinedProps.mapActiveMarkerColor[0]
          : combinedProps.mapMarkerColor?.[dataSource] ||
            combinedProps.mapMarkerColor?.[0] ||
            '#257DC9',
        iconIndex: dataSource,
        shapeType:
          combinedProps.mapShapeOption?.[dataSource] ||
          combinedProps.mapShapeOption?.[0] ||
          'Rectangle',
        displayMode:
          combinedProps.mapDisplayMode?.[dataSource] ||
          combinedProps.mapDisplayMode?.[0] ||
          '',
      };
    } else {
      const singleProps = props as SingleMapProps;
      return {
        color: isSelected
          ? singleProps.mapActiveMarkerColor
          : singleProps.mapMarkerColor,
        iconIndex: 0,
        shapeType: singleProps.mapShapeOption || 'Rectangle',
        displayMode: singleProps.mapDisplayMode || '',
      };
    }
  };

  // Handle initial load state
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
    }
  }, [initialLoad]);

  // Handle window resize events and set mobile view state
  useEffect(() => {
    const handleResize = (): void => setIsMobileView(window.innerWidth <= 1024);

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Process SVG icons and set markup for map markers
  useEffect(() => {
    if (iconRef.current) {
      const svgElements = iconRef.current.querySelectorAll('svg');
      const mapMarkerIconColor: string = Array.isArray(props.mapMarkerIconColor)
        ? props.mapMarkerIconColor[0]
        : props.mapMarkerIconColor || '#FFF';
      const newIconSvgMarkup = Array.from(svgElements).map((svgElement) => {
        svgElement.setAttribute('fill', mapMarkerIconColor);
        svgElement
          .querySelectorAll('path, circle, rect, polygon, polyline')
          .forEach((el) => {
            el.setAttribute('fill', mapMarkerIconColor);
          });

        let scaledSvgMarkup = svgElement.outerHTML;
        if (!isCombinedMap) {
          scaledSvgMarkup = `
          <g transform="scale(0.8)">
            ${svgElement.outerHTML}
          </g>
          `;
        }
        return scaledSvgMarkup;
      });
      setIconSvgMarkup(newIconSvgMarkup);
      if (
        mapGeoJSONSelectedFeatures &&
        selectedMapFeatures.current.length != mapGeoJSONSelectedFeatures.length
      ) {
        selectedMapFeatures.current = mapGeoJSONSelectedFeatures;
      }

      if (
        mapGeoJSONHoveredFeature &&
        mapGeoJSONHoveredFeature != hoveredMapFeature.current
      ) {
        hoveredMapFeature.current = mapGeoJSONHoveredFeature;
      } else {
        hoveredMapFeature.current = '';
      }
    } else {
      setIconSvgMarkup(isCombinedMap ? [] : '');
    }
  }, [
    props,
    isCombinedMap,
    mapGeoJSONHoveredFeature,
    mapGeoJSONSelectedFeatures,
  ]);

  return (
    <div className="w-full h-full">
      <div className="w-full h-full relative">
        <MapContainer
          key={`map-container-${props.mapAllowZoom}-${props.mapAllowScroll}-${props.mapMaxZoom}-${props.mapMinZoom}-${props.mapStandardZoom}`}
          style={{ height: '100%', width: '100%' }}
          center={
            props.data && props.data.length > 0
              ? [
                  props.data[0]?.position.coordinates[0],
                  props.data[0]?.position.coordinates[1],
                ]
              : [
                  props.mapLatitude || 52.520008,
                  props.mapLongitude || 13.404954,
                ]
          }
          zoom={props.mapStandardZoom}
          zoomControl={props.mapAllowZoom}
          scrollWheelZoom={props.mapAllowZoom}
          touchZoom={props.mapAllowZoom}
          ref={mapRef}
          doubleClickZoom={props.mapAllowZoom}
          dragging={props.mapAllowScroll}
        >
          {((): JSX.Element => {
            const wmsConfig = findValidWmsConfig(
              isCombinedMap ? undefined : (props as SingleMapProps).mapWmsUrl,
              isCombinedMap ? undefined : (props as SingleMapProps).mapWmsLayer,
              isCombinedMap
                ? (props as CombinedMapProps).mapCombinedWmsUrl
                : undefined,
              isCombinedMap
                ? (props as CombinedMapProps).mapCombinedWmsLayer
                : undefined,
              isCombinedMap,
            );
            return wmsConfig ? (
              <WMSTileLayer
                url={wmsConfig.url}
                layers={wmsConfig.layer}
                transparent={true}
                version="1.3.0"
              />
            ) : (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
                url={mapboxUrl}
              />
            );
          })()}

          <ZoomHandler onZoomChange={setMapZoom} />

          {(props.mapType === tabComponentSubTypeEnum.geoJSON ||
            props.mapType === tabComponentSubTypeEnum.geoJSONDynamic) && (
            <>
              <GeoJSON
                onEachFeature={geoJSONOnEachFeature}
                data={geoJSONData ? geoJSONData : DUMMY_GEOJSON}
                style={geoJSONStyle}
              />
              {props.mapGeoJSONSensorBasedColors && <GeoJSONLegend />}
            </>
          )}

          {((!isCombinedMap &&
            props.mapType !== tabComponentSubTypeEnum.geoJSON &&
            props.mapType !== tabComponentSubTypeEnum.geoJSONDynamic) ||
            (isCombinedMap &&
              (props as CombinedMapProps).mapDisplayMode?.[0] !==
                tabComponentSubTypeEnum.onlyFormArea)) && (
            <MarkerClusterGroup
              iconCreateFunction={(cluster: L.MarkerCluster) =>
                createClusterCustomIcon(
                  cluster,
                  isCombinedMap
                    ? (props as CombinedMapProps).mapMarkerColor || []
                    : (props as SingleMapProps).mapMarkerColor || '',
                  isCombinedMap
                    ? (props as CombinedMapProps).mapMarkerIconColor || []
                    : (props as SingleMapProps).mapMarkerIconColor || '',
                  isCombinedMap,
                )
              }
              disableClusteringAtZoom={15}
            >
              {(markerPositions.length > 0
                ? getFilteredMarkers()
                : DEFAULT_MARKERS
              ).map((marker, index) => {
                const dataSource = marker.dataSource || 0;
                const markerProps = getMarkerProps(
                  dataSource,
                  selectedMarker.id === index,
                );

                // Determine the correct color to use
                // Priority: 1) Active color if selected, 2) Value-based color if enabled, 3) Default marker color
                const isSelected = selectedMarker.id === index;
                let finalColor = markerProps.color; // This already handles active vs default color

                // Only use value-based color if not selected and value-based coloring is enabled
                if (!isSelected) {
                  if (isCombinedMap) {
                    const combinedProps = props as CombinedMapProps;
                    if (
                      combinedProps.mapIsIconColorValueBased?.[dataSource] ||
                      combinedProps.mapIsFormColorValueBased?.[dataSource]
                    ) {
                      finalColor = marker.color || markerProps.color;
                    }
                  } else {
                    const singleProps = props as SingleMapProps;
                    if (
                      singleProps.mapIsIconColorValueBased ||
                      singleProps.mapIsFormColorValueBased
                    ) {
                      finalColor = marker.color || markerProps.color;
                    }
                  }
                }
                return (
                  markerProps.displayMode !==
                    tabComponentSubTypeEnum.onlyFormArea && (
                    <Marker
                      key={index}
                      position={marker.position as LatLngExpression}
                      icon={createCustomIcon(
                        finalColor,
                        iconSvgMarkup,
                        marker.iconIndex ?? 0,
                        isCombinedMap,
                        isCombinedMap
                          ? (props as CombinedMapProps).mapMarkerIcon?.[
                              markerProps.iconIndex
                            ]
                          : (props as SingleMapProps).mapMarkerIcon,
                      )}
                      eventHandlers={{
                        click: (e): void => {
                          e.originalEvent.stopPropagation();
                          if (selectedMarker.id === index) {
                            setSelectedMarker({
                              id: null,
                              data: null,
                              dataSource: null,
                            });
                          } else {
                            setSelectedMarker({
                              id: index,
                              data: marker,
                              dataSource: dataSource,
                            });
                          }
                        },
                        popupclose: handleOnCloseModal,
                      }}
                    >
                      {props.mapAllowPopups && !isFullscreenMap && (
                        <Popup
                          maxWidth={200}
                          // ref={(popup: L.Popup | null) => {
                          //   if (popup)
                          //     popupRefsMap.current.set(
                          //       `${marker.details.id}`,
                          //       popup,
                          //     );
                          // }}
                        >
                          <div
                            style={{
                              textAlign: 'center',
                              fontSize: '16px',
                              marginBottom: '10px',
                              color: '#000000',
                            }}
                          >
                            <strong>{marker.title}</strong>
                          </div>
                          {renderPopupContent(marker)}
                        </Popup>
                      )}

                      {markerProps.displayMode !==
                        tabComponentSubTypeEnum.onlyPin &&
                        mapZoom > 15 &&
                        (!Array.isArray(marker) || marker.length === 1) &&
                        renderShape(
                          marker.position,
                          markerProps.shapeType,
                          finalColor,
                          dataSource,
                        )}
                    </Marker>
                  )
                );
              })}
            </MarkerClusterGroup>
          )}

          <SetViewToBounds
            markerPositions={markerPositions}
            centerPosition={[
              isNaN(
                props.data?.[0]?.position.coordinates[0] ||
                  props.mapLatitude ||
                  52.520008,
              )
                ? 52.520008
                : props.data?.[0]?.position.coordinates[0] ||
                  props.mapLatitude ||
                  52.520008,
              isNaN(
                props.data?.[0]?.position.coordinates[1] ||
                  props.mapLongitude ||
                  13.404954,
              )
                ? 13.404954
                : props.data?.[0]?.position.coordinates[1] ||
                  props.mapLongitude ||
                  13.404954,
            ]}
          />

          {/* filter and legend button toggle */}
          <div className="flex flex-row gap-x-2 ml-3" style={getDivStyle()}>
            {props.mapAllowFilter && (
              <div
                className="flex flex-row items-center justify-between p-2 rounded-lg shadow-lg cursor-pointer"
                onClick={toggleFilterModal}
                style={menuStyle}
              >
                <h2 className="font-bold pr-1">Filter</h2>
                <FontAwesomeIcon
                  icon={faAnglesRight}
                  className={`transform ${
                    isFilterModalOpen ? 'rotate-180' : 'rotate-0'
                  } transition-transform ease-in-out duration-300`}
                />
              </div>
            )}
            {props.mapAllowLegend && (
              <div
                className="flex flex-row items-center justify-between p-2 rounded-lg shadow-lg cursor-pointer"
                onClick={toggleLegendModal}
                style={menuStyle}
              >
                <h2 className="font-bold pr-1">Legende</h2>
                <FontAwesomeIcon
                  icon={faAnglesRight}
                  className={`transform ${
                    isLegendModalOpen ? 'rotate-180' : 'rotate-0'
                  } transition-transform ease-in-out duration-300`}
                />
              </div>
            )}
            {allowShare && (
              <div
                className="flex flex-row items-center justify-between p-2 rounded-lg shadow-lg cursor-pointer"
                style={menuStyle}
              >
                <ShareLinkButton
                  type="dashboard"
                  id={dashboardId || ''}
                  widgetPrimaryColor={ciColors?.widgetPrimaryColor}
                  widgetFontColor={ciColors?.widgetFontColor}
                />
              </div>
            )}
            {allowDataExport && (
              <div className="shadow-lg">
                <DataExportButton
                  id={widgetDownloadId || ''}
                  type="widget"
                  menuStyle={{ ...menuStyle, fontWeight: 'bold' }}
                  headerPrimaryColor={ciColors?.headerPrimaryColor}
                  headerFontColor={ciColors?.headerFontColor}
                  panelFontColor={ciColors?.panelFontColor}
                  widgetFontColor={ciColors?.widgetFontColor}
                />
              </div>
            )}
          </div>

          {/* filter and legend modals */}
          {props.mapAllowFilter && isFilterModalOpen && (
            <MapFilterModal
              combinedQueryData={props.combinedQueryData || []}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              menuStyle={menuStyle}
              onCloseModal={closeFilterModal}
              isLegendModalOpen={isLegendModalOpen}
              isFullscreenMap={isFullscreenMap}
              mapNames={
                isCombinedMap ? (props as CombinedMapProps).mapNames || [] : []
              }
              handleMapNameFilterChange={handleDataSourceFilterChange}
              selectedDataSources={selectedDataSources}
              isCombinedMap={isCombinedMap}
            />
          )}
          {props.mapAllowLegend && isLegendModalOpen && (
            <MapLegendModal
              mapLegendValues={props.mapLegendValues}
              mapLegendDisclaimer={props.mapLegendDisclaimer}
              menuStyle={menuStyle}
              onCloseModal={closeLegendModal}
              isFilterModalOpen={isFilterModalOpen}
              isFullscreenMap={isFullscreenMap}
            />
          )}
        </MapContainer>
        <div ref={iconRef} style={{ display: 'none' }}>
          {isCombinedMap
            ? (props as CombinedMapProps).mapMarkerIcon?.map(
                (iconName, index) => (
                  <DashboardIcons
                    key={index}
                    iconName={iconName}
                    color="white"
                  />
                ),
              )
            : (props as SingleMapProps).mapMarkerIcon && (
                <DashboardIcons
                  iconName={(props as SingleMapProps).mapMarkerIcon}
                  color={(props as SingleMapProps).mapMarkerIconColor}
                />
              )}
          {(props as SingleMapProps).staticValuesLogos?.map((l, index) => {
            return (
              <DashboardIcons
                key={'DashboardIcons-' + index}
                iconName={l}
                color={(props as SingleMapProps).mapMarkerIconColor}
              />
            );
          })}
        </div>
      </div>

      {/* sidebar modal */}
      {props.mapAllowPopups && selectedMarker.data && isFullscreenMap && (
        <MapModal
          selectedMarker={selectedMarker.data}
          mapWidgetValues={
            props.mapWidgetValues && props.mapWidgetValues.length > 0
              ? isCombinedMap
                ? props.mapWidgetValues.filter(
                    (widget) => widget.dataSource === selectedMarker.dataSource,
                  )
                : props.mapWidgetValues
              : undefined
          }
          menuStyle={menuStyle}
          chartStyle={isCombinedMap ? props.chartStyle : undefined}
          ciColors={ciColors}
          onCloseModal={handleOnCloseModal}
        />
      )}
    </div>
  );
}
