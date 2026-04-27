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
  Polyline,
  ImageOverlay,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import L, { LatLngExpression, LeafletEvent, PathOptions } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import { env } from 'next-dynenv';

import '@/components/Map/map.css';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import SetViewToBounds from './SetViewToBounds';
import { CustomMapImage, tabComponentSubTypeEnum } from '@/types';
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
import { getCustomMapImageById } from '@/api/tab.custom-map-image.service';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import SearchControl from './SearchControl/SearchControl';
import MapCreatePinModal from './MapCreatePinModal';
import { useAuth } from 'react-oidc-context';
import { getProjects } from '@/api/project-service';
import { getTenantOfPage } from '@/utils/tenantHelper';
import {
  getProjectId,
  isProjectType,
  isProjectOrStreetType,
  getStatusColor,
  createProjectCategoryIcon,
  hasProjectVisibilityFlag,
  isProjectPublic,
  filterProjectVisibility,
  normalizeIncomingMapData,
  fetchAndCacheProjectCategories,
} from './MapProjectUtils';
import { getLineCoords, getStreetLineCoords } from './MapLineUtils';
import { extractRolesFromToken } from './MapAuthUtils';
import {
  fetchProjectForEdit,
  deleteProjectMarker,
  createProjectAddedUpdater,
  type ProjectInput,
} from './MapProjectUtils';
import {
  createSelectCoordinatesHandler,
  createSelectRouteHandler,
} from './MapProjectUtils';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultSearchIcon = L.icon({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Union type for the component props
type MapNewProps = SingleMapProps | CombinedMapProps;

// Type guard to check if props are for a combined map
function isCombinedMapProps(props: MapNewProps): props is CombinedMapProps {
  return (
    (props.mapActiveMarkerColor != null &&
      Array.isArray((props as CombinedMapProps).mapActiveMarkerColor)) ||
    props.mapType === tabComponentSubTypeEnum.combinedMap
  );
}

const FitBounds = ({ bounds }: { bounds: L.LatLngBoundsExpression }): null => {
  const map = useMap();
  React.useEffect(() => {
    map.fitBounds(bounds);
  }, [bounds]);
  return null;
};

export default function MapNew(props: MapNewProps): JSX.Element {
  const auth = useAuth();
  const { openSnackbar } = useSnackbar();

  const {
    uiFilterData,
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
    isCustomMap,
    customMapImageId,
    customMapSensorValues,
    handleOnMarkerClick,
  } = props;

  const tempMarkerColor = ciColors?.fontColor || '#FFF';

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
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, (string | number)[]>
  >({});
  const [selectedDataSources, setSelectedDataSources] = useState<number[]>([]);
  const [searchMarker, setSearchMarker] = useState<{
    position: LatLngExpression;
    label: string;
    routePoints?: LatLngExpression[];
  } | null>(null);
  const [localData, setLocalData] = useState<any[]>(props.data || []);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [centerPinVisible, setCenterPinVisible] = useState(false);
  const [editingMarker, setEditingMarker] = useState<any>(null);
  const [projectCategoryCache, setProjectCategoryCache] = useState<
    Record<string, string>
  >({});
  const tenant = getTenantOfPage();
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const requiredRole = 'scs-project-admin';
  const isProjectAdmin = roleOptions.includes(requiredRole);

  // Extract roles from JWT token when auth changes
  useEffect(
    function extractUserRolesFromAuth(): void {
      if (auth?.user?.access_token) {
        const roles = extractRolesFromToken(auth.user.access_token);
        setRoleOptions(roles);
      }
    },
    [auth],
  );

  // Handle locate on map events
  useEffect(
    function handleLocateOnMapEffect(): void {
      if (locateOnMap) {
        handleLocateOnMap({
          data: {
            lat: locateOnMap.pos[0],
            lng: locateOnMap.pos[1],
            id: locateOnMap.id,
          },
        });
      }
    },
    [locateOnMap],
  );

  const [customMapImage, setCustomMapImage] = useState<
    CustomMapImage | undefined
  >();
  const [customMapImageWidth, setCustomMapImageWidth] = useState(0);
  const [customMapImageHeight, setCustomMapImageHeight] = useState(0);
  const [customMapBounds, setCustomMapBounds] = useState<
    L.LatLngBoundsExpression | undefined
  >(undefined);

  useEffect(() => {
    if (
      isCustomMap &&
      customMapImageId &&
      customMapImageId.length > 0 &&
      (customMapImage === undefined ||
        (customMapImage !== undefined &&
          customMapImageId !== customMapImage.id))
    ) {
      getCustomMapImage(customMapImageId)
        .then((image: CustomMapImage | undefined) => {
          if (image) {
            setCustomMapBounds(undefined);
            setCustomMapImage(image);
          } else {
            openSnackbar('Karten Bild nicht in Datenbank gefunden', 'error');
          }
        })
        .catch((err) => {
          console.error(err);
          openSnackbar('Karten Bild nicht in Datenbank gefunden', 'error');
        });
    }
  }, [isCustomMap, customMapImageId, customMapImage, setCustomMapImage]);

  useEffect(() => {
    if (
      isCustomMap &&
      customMapImage !== undefined &&
      customMapBounds === undefined
    ) {
      setCustomMapImageWidth(customMapImage.width);
      setCustomMapImageHeight(customMapImage.height);
      const bounds: L.LatLngBoundsExpression = [
        [0, 0],
        [customMapImage.height, customMapImage.width],
      ];
      setCustomMapBounds(bounds);
    }
  }, [
    isCustomMap,
    customMapImage,
    customMapImageWidth,
    customMapImageHeight,
    customMapBounds,
    setCustomMapImageWidth,
    setCustomMapImageHeight,
    setCustomMapBounds,
  ]);

  const selectedMapFeatures = useRef<string[]>([]);
  const localHoveredFeature = useRef<string>('');
  const syncedHoveredFeature = useRef<string>('');
  const hoverTimeoutRef = useRef<number | null>(null);
  const pendingHoverId = useRef<string>('');

  const geoJSonLayers = useRef<{ [id: string]: L.GeoJSON }>({});
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/${
    props.mapType === tabComponentSubTypeEnum.geoJSON ||
    props.mapType === tabComponentSubTypeEnum.geoJSONDynamic
      ? 'light-v11'
      : 'streets-v12'
  }/tiles/256/{z}/{x}/{y}?access_token=${env('NEXT_PUBLIC_MAPBOX_TOKEN')}`;

  const handleFilterChange = (
    newValuesForThisAttribute: (string | number)[],
    filterAttribute?: string,
  ): void => {
    if (!filterAttribute) return;

    const updatedFilters = {
      ...selectedFilters,
      [filterAttribute]: newValuesForThisAttribute,
    };

    setSelectedFilters(updatedFilters);
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

  const closePinModal = (): void => {
    setIsPinModalOpen(false);
    setEditingMarker(null);
  };

  const toggleFilterModal = (): void => {
    if (
      ((isFullscreenMap && isMobileView) || !isFullscreenMap) &&
      (isLegendModalOpen || isPinModalOpen)
    ) {
      closeLegendModal();
      closePinModal();
    }
    setIsFilterModalOpen(!isFilterModalOpen);
  };

  const toggleLegendModal = (): void => {
    if (
      (((isFullscreenMap && isMobileView) || !isFullscreenMap) &&
        isFilterModalOpen) ||
      isPinModalOpen
    ) {
      closeFilterModal();
      closePinModal();
    }
    setIsLegendModalOpen(!isLegendModalOpen);
  };

  const togglePinModal = (): void => {
    if (
      (((isFullscreenMap && isMobileView) || !isFullscreenMap) &&
        isFilterModalOpen) ||
      isLegendModalOpen
    ) {
      closeFilterModal();
      closeLegendModal();
    }
    setEditingMarker(null);
    setIsPinModalOpen(!isPinModalOpen);
  };

  function is2DArray(value: unknown): value is unknown[][] {
    return (
      Array.isArray(value) &&
      value.every((row) => Array.isArray(row) || row == undefined)
    );
  }

  function getIconIndex(dataSource: number, icon: string): number {
    let iconIndex = 0;
    if (props.staticValuesLogos) {
      if (is2DArray(props.staticValuesLogos)) {
        const icons = props.staticValuesLogos[dataSource];
        if (icons) {
          iconIndex = icons.indexOf(icon);
        }
      } else {
        iconIndex = props.staticValuesLogos.indexOf(icon);
      }
    }
    return iconIndex >= 0 ? iconIndex : 0;
  }

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
      const dataSource = marker ? (marker.dataSource ?? 0) : 0; // Default to 0 if undefined

      // Use form-based value coloring if the flag is set for this data source
      const fallback = combinedProps.mapMarkerIcon?.[dataSource];
      if (
        (combinedProps.mapIsFormColorValueBased?.[dataSource] ||
          combinedProps.mapIsIconColorValueBased?.[dataSource]) &&
        markerValue !== undefined
      ) {
        const staticValues = combinedProps.staticValues?.[dataSource];
        const staticLogos = combinedProps.staticValuesLogos?.[dataSource];
        if (staticValues && staticLogos) {
          const icon = getIconForValue(
            markerValue,
            staticValues,
            staticLogos,
            fallback,
          );
          return icon;
        }
      }
      return fallback;
    }
  };

  const getCombinedMapIconList = (dataSource: number): string[] => {
    const combinedProps = props as CombinedMapProps;
    const fallback = combinedProps.mapMarkerIcon;
    if (
      combinedProps.mapIsFormColorValueBased?.[dataSource] ||
      combinedProps.mapIsIconColorValueBased?.[dataSource]
    ) {
      return combinedProps.staticValuesLogos?.[dataSource] ?? fallback;
    }
    return fallback;
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

  // Apply project visibility filtering based on admin status and is_public flag
  useEffect(
    function applyProjectVisibilityFilter(): () => void {
      let cancelled = false;

      const applyVisibility = async (): Promise<void> => {
        // Admins can see all project pins regardless of is_public
        if (isProjectAdmin) {
          setLocalData(normalizeIncomingMapData(props.data || []));
          return;
        }

        const incoming = props.data || [];
        const projectIds = Array.from(
          new Set(
            incoming
              .filter((item) => isProjectType(item))
              .map((item) => getProjectId(item))
              .filter((id): id is string => Boolean(id)),
          ),
        );

        const visibilityMap: Record<string, boolean> = {};

        try {
          const projects = await getProjects(auth?.user?.access_token, tenant);
          (projects || []).forEach((proj: any) => {
            const id = proj?.id?.value ?? proj?.id;
            if (!id) return;
            visibilityMap[String(id)] = Boolean(proj?.is_public ?? false);
          });
        } catch (err) {
          console.error('[Map] Failed to fetch project visibility list', {
            error: err,
          });
        }

        projectIds.forEach((projectId) => {
          if (visibilityMap[projectId] === undefined) {
            visibilityMap[projectId] = false;
          }
        });

        const filtered = filterProjectVisibility(
          incoming,
          visibilityMap,
          isProjectAdmin,
        );

        if (!cancelled) {
          setLocalData(normalizeIncomingMapData(filtered));
        }
      };

      applyVisibility();

      return function cleanupVisibilityEffect(): void {
        cancelled = true;
      };
    },
    [props.data, auth?.user?.access_token, isProjectAdmin, tenant],
  );

  const markerPositions: MarkerType[] = (localData || []).map(
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
      const iconIndex = getIconIndex(
        mapObject ? (mapObject.dataSource ?? 0) : 0,
        icon,
      );
      return {
        position: mapObject.position.coordinates ?? [52.520008, 13.404954],
        title: title,
        details: mapObject,
        dataSource: mapObject ? (mapObject.dataSource ?? 0) : 0,
        color: color,
        iconIndex: iconIndex,
        unitsTexts: props.mapUnitsTexts,
      };
    },
  );

  // Fetch categories for project/street markers
  useEffect(
    function fetchProjectCategoriesEffect(): void {
      fetchAndCacheProjectCategories({
        markerPositions,
        authToken: auth.user?.access_token,
        projectCategoryCache,
        setProjectCategoryCache,
      });
    },
    [markerPositions, auth.user?.access_token],
  );

  const getFilteredMarkers = (): MarkerType[] => {
    const source = isCustomMap ? customMarkerPositions : markerPositions;
    const base = source.filter(function filterMarkerByFilters(marker) {
      const activeFilterKeys = Object.keys(selectedFilters).filter(
        (key) => selectedFilters[key].length > 0,
      );

      if (activeFilterKeys.length > 0) {
        const passesAllFilters = activeFilterKeys.every((key) => {
          const selectedValues = selectedFilters[key];
          const attributeDetails = marker.details[key];

          if (attributeDetails === undefined) return true;

          const propertyValue =
            attributeDetails.value !== undefined
              ? attributeDetails.value
              : attributeDetails;

          const normalizedValue =
            parseFloat(propertyValue) === 0 ? 0 : propertyValue;
          return selectedValues.includes(normalizedValue);
        });

        if (!passesAllFilters) return false;
      }

      if (
        isCombinedMap &&
        selectedDataSources.length > 0 &&
        !selectedDataSources.includes(marker.dataSource ?? -1)
      ) {
        return false;
      }

      if (
        !isProjectAdmin &&
        (isProjectType(marker.details) ||
          hasProjectVisibilityFlag(marker.details)) &&
        !isProjectPublic(marker.details)
      ) {
        return false;
      }

      return true;
    });

    // If the user selected an address in the modal, append it to the marker list
    // so it is rendered using the same icon generation logic as other markers.
    // Only show the pin if it is NOT a route (route shows dashed line only).
    if (searchMarker && !searchMarker.routePoints) {
      try {
        const pos = Array.isArray(searchMarker.position)
          ? (searchMarker.position as [number, number])
          : // if it's an object like {lat, lng}
            [
              (searchMarker.position as any).lat,
              (searchMarker.position as any).lng,
            ];

        const hasMatch = base.some((marker) => {
          const [lat, lng] = marker.position;
          return Math.abs(lat - pos[0]) < 1e-6 && Math.abs(lng - pos[1]) < 1e-6;
        });

        if (hasMatch) {
          return base;
        }

        const searchMarkerEntry: MarkerType = {
          position: pos as [number, number],
          title: searchMarker.label || 'Ausgewählt',
          details: {
            id: 'search-marker',
            routePoints: (searchMarker as any).routePoints,
          },
          dataSource: 0,
          iconIndex: 0,
        };

        return [...base, searchMarkerEntry];
      } catch (err) {
        // Fall back to base if anything unexpected happens
        console.error('Error adding searchMarker to filtered markers', err);
        return base;
      }
    }

    return base;
  };

  const customMarkerPositions: MarkerType[] = (customMapSensorValues || []).map(
    (markerObject, index) => {
      const mapObject = props.data?.find((x) => x.id === markerObject.entityId);
      const title =
        mapObject?.name?.value || mapObject?.name || `Sensor ${index + 1}`;

      // Determine color for custom map pins with multi-attribute logic when enabled
      const singleProps = props as SingleMapProps;
      const pinMode = (props as any).pinMode as 'single' | 'multi' | undefined;
      const cfgs = (props as any).multiAttributeConfigs as
        | {
            attribute: string;
            errorColor: string;
            defaultRange: string;
            defaultColor: string;
            warnRange?: string;
            warnColor?: string;
          }[]
        | undefined;

      const parseRange = (
        range?: string,
      ): { min: number; max: number } | null => {
        const s = (range || '').trim();
        if (!s) return null;
        const m = s.match(/^(\d+)\s*-\s*(\d+)$/);
        if (!m) return null;
        const a = parseInt(m[1], 10);
        const b = parseInt(m[2], 10);
        if (Number.isNaN(a) || Number.isNaN(b) || a >= b) return null;
        return { min: a, max: b };
      };

      const getAttrValue = (attr: string): number | undefined => {
        if (!mapObject) return undefined;
        const raw = (mapObject as any)[attr];
        const v = raw?.value !== undefined ? raw.value : raw;
        const num = typeof v === 'number' ? v : parseFloat(v);
        return Number.isNaN(num) ? undefined : num;
      };

      let color = singleProps.mapMarkerColor || '#000000';

      if (pinMode === 'multi' && Array.isArray(cfgs) && cfgs.length > 0) {
        // Priority: error (outside both ranges) -> warn -> default. First match wins.
        let chosenColor: string | undefined;
        // Error
        for (const cfg of cfgs) {
          const val = getAttrValue(cfg.attribute);
          const def = parseRange(cfg.defaultRange);
          const warn = parseRange(cfg.warnRange);
          const inDef =
            def && val !== undefined && val >= def.min && val <= def.max;
          const inWarn =
            warn && val !== undefined && val >= warn.min && val <= warn.max;
          if (!inDef && !inWarn) {
            chosenColor = cfg.errorColor;
            break;
          }
        }
        // Warn
        if (!chosenColor) {
          for (const cfg of cfgs) {
            const val = getAttrValue(cfg.attribute);
            const warn = parseRange(cfg.warnRange);
            if (
              warn &&
              val !== undefined &&
              val >= warn.min &&
              val <= warn.max &&
              cfg.warnColor
            ) {
              chosenColor = cfg.warnColor;
              break;
            }
          }
        }
        // Default
        if (!chosenColor) {
          for (const cfg of cfgs) {
            const val = getAttrValue(cfg.attribute);
            const def = parseRange(cfg.defaultRange);
            if (def && val !== undefined && val >= def.min && val <= def.max) {
              chosenColor = cfg.defaultColor;
              break;
            }
          }
        }
        color = chosenColor || color;
      } else {
        // Fallback to existing single-attribute value-based logic
        let markerValue: any;
        if (mapObject) {
          if (
            singleProps.mapIsIconColorValueBased ||
            singleProps.mapIsFormColorValueBased
          ) {
            if (
              (mapObject as any)[markerObject.attribute]?.value !== undefined
            ) {
              markerValue = (mapObject as any)[markerObject.attribute].value;
            } else {
              markerValue = (mapObject as any)[markerObject.attribute];
            }
          }
        }
        color = getColorForMarker(mapObject as any, markerValue);
      }

      // Icon selection consistent with existing logic
      let markerValueForIcon: any;
      if (mapObject) {
        if (
          singleProps.mapIsIconColorValueBased ||
          singleProps.mapIsFormColorValueBased
        ) {
          if ((mapObject as any)[markerObject.attribute]?.value !== undefined) {
            markerValueForIcon = (mapObject as any)[markerObject.attribute]
              .value;
          } else {
            markerValueForIcon = (mapObject as any)[markerObject.attribute];
          }
        }
      }
      const icon = getIconForMarker(mapObject as any, markerValueForIcon);
      let iconIndex = 0;
      if (isCombinedMap) {
        const dataSource = (mapObject as any)?.dataSource ?? 0;
        const staticValuesLogos =
          (props as CombinedMapProps).staticValuesLogos?.[dataSource] ?? [];
        iconIndex = staticValuesLogos.indexOf(icon);
      } else {
        iconIndex =
          (props as SingleMapProps).staticValuesLogos?.indexOf(icon) ?? 0;
      }

      return {
        position: [markerObject.positionY, markerObject.positionX],
        title,
        details: mapObject,
        dataSource: (mapObject as any)?.dataSource || 0,
        color,
        iconIndex: iconIndex + 1,
      };
    },
  );

  const getColorForGeoJSONFeature = (
    featureId: string,
    defaultColor: string,
  ): string => {
    const combinedProps = isCombinedMap
      ? (props as CombinedMapProps)
      : undefined;

    // Find sensor entries matching this feature id
    const raw =
      props.mapGeoJSONSensorData?.filter((item) => item.id == featureId) ?? [];

    // Parse numbers robustly (handle numeric strings and comma decimals) and drop non-numeric
    const numericValues = raw
      .map((v) => {
        if (typeof v.value === 'number') return v.value;
        const s = String(v.value).trim().replace(',', '.');
        const n = parseFloat(s);
        return Number.isFinite(n) ? n : null;
      })
      .filter((n): n is number => n !== null);

    const avg =
      numericValues.length > 0
        ? numericValues.reduce((sum, n) => sum + n, 0) / numericValues.length
        : undefined;

    if (
      props.mapGeoJSONSensorBasedColors &&
      avg !== undefined &&
      !Number.isNaN(avg)
    ) {
      if (
        Array.isArray(props.staticValues?.[0]) &&
        Array.isArray(props.staticValuesColors?.[0])
      ) {
        const staticValues = props.staticValues?.[0];
        const staticColors = props.staticValuesColors?.[0];
        if (staticValues && staticColors) {
          return getColorForValue(avg, staticValues, staticColors);
        }
      } else {
        return getColorForValue(
          avg,
          (props.staticValues as (string | number)[]) || [],
          (props.staticValuesColors as string[]) || [],
        );
      }
    } else if (props.mapGeoJSONSensorBasedNoDataColor) {
      // Explicit no-data color when enabled but no numeric value present
      return props.mapGeoJSONSensorBasedNoDataColor;
    }

    // Default/fallback color
    const fallbackColor =
      defaultColor ||
      (isCombinedMap
        ? combinedProps?.mapGeoJSONFillColor
        : (props as SingleMapProps).mapGeoJSONFillColor) ||
      '#000000';
    return fallbackColor;
  };

  function geoJSONStyle(
    feature?: GeoJSON.Feature<GeoJSON.Geometry, GeoJSON.GeoJsonProperties>,
    hovered: boolean = false,
  ): PathOptions {
    const geoJSONId = geoJSONGetIDProperty(feature?.properties);
    if (selectedMapFeatures.current.includes(geoJSONId)) {
      return {
        color: props.mapGeoJSONSelectionBorderColor,
        fillColor: getColorForGeoJSONFeature(
          geoJSONId,
          props.mapGeoJSONSelectionFillColor!,
        ),
        fillOpacity: 0.4,
        weight: 2.5,
      };
    }
    if (syncedHoveredFeature.current === geoJSONId || hovered) {
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

    if (props.mapAllowPopups) {
      layer.bindTooltip(tooltip);
    }

    geoJSonLayers.current[geoJSONId] = layer;
  }

  function geoJSONOnMouseOver(event: LeafletEvent): void {
    const geoJSONId = geoJSONGetIDProperty(event.target.feature.properties);

    // Avoid spamming hover events when staying on the same feature
    if (pendingHoverId.current === geoJSONId) {
      return;
    }

    // Cancel any pending hover commit for a previous feature
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    pendingHoverId.current = geoJSONId;

    // Small debounce so rapid border crossing doesn't cause stale hovers
    hoverTimeoutRef.current = window.setTimeout(() => {
      // Only commit if this is still the pending feature
      if (pendingHoverId.current !== geoJSONId) {
        return;
      }

      if (props.sendHoverFeatureToDynamicMap) {
        localHoveredFeature.current = geoJSONId;
        props.sendHoverFeatureToDynamicMap(geoJSONId);
      }

      syncedHoveredFeature.current = geoJSONId;
      if (geoJsonRef.current) {
        geoJsonRef.current.setStyle(geoJSONStyle);
      }
    }, 200);
  }

  function geoJSONOnMouseOut(event: LeafletEvent): void {
    const geoJSONId = geoJSONGetIDProperty(event.target.feature.properties);

    // If we leave the feature that is pending hover, cancel the debounce
    if (
      pendingHoverId.current === geoJSONId &&
      hoverTimeoutRef.current !== null
    ) {
      window.clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
      pendingHoverId.current = '';
    }

    if (
      localHoveredFeature.current === geoJSONId &&
      props.sendHoverFeatureToDynamicMap
    ) {
      props.sendHoverFeatureToDynamicMap('');
    }
    if (localHoveredFeature.current === geoJSONId) {
      localHoveredFeature.current = '';
      syncedHoveredFeature.current = '';
      if (geoJsonRef.current) {
        geoJsonRef.current.setStyle(geoJSONStyle);
      }
    }
  }

  function geoJSONOnMouseClick(event: LeafletEvent): void {
    const geoJSONId = geoJSONGetIDProperty(event.target.feature.properties);
    const layer = geoJSonLayers.current[geoJSONId] ?? (event.target as any);
    const id = selectedMapFeatures.current.findIndex((x) => x == geoJSONId);
    if (id != -1) {
      (layer as any).bringToBack();
      selectedMapFeatures.current.splice(id, 1);
    } else {
      (layer as any).bringToFront();
      selectedMapFeatures.current.push(geoJSONId);
    }
    if (props.sendFeaturesToDynamicMap) {
      props.sendFeaturesToDynamicMap(selectedMapFeatures.current);
    }
    if (geoJsonRef.current) {
      geoJsonRef.current.setStyle(geoJSONStyle);
    }
  }

  function geoJSONGetIDProperty(properties: any): string {
    let id: string | number | undefined;
    if (
      props.mapGeoJSONFeatureIdentifier &&
      props.mapGeoJSONFeatureIdentifier != ''
    ) {
      id = properties?.[props.mapGeoJSONFeatureIdentifier];
    } else {
      id = properties?.['AGS'];
    }

    if (id == null) {
      return '';
    }

    const idStr = String(id);
    if (idStr.substring(0, 1) === '0') {
      return idStr.substring(1);
    }
    return idStr;
  }

  const POSITION_CLASSES = {
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
  };

  function GeoJSONLegend(): JSX.Element {
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

    if (props.mapGeoJSONSensorBasedNoDataColor) {
      labels.push(
        '<i style="background:' +
          props.mapGeoJSONSensorBasedNoDataColor +
          '"></i> Keine Daten',
      );
    }

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

  async function handleEditMarker(markerData: any): Promise<void> {
    const project = await fetchProjectForEdit(
      auth.user?.access_token,
      markerData,
    );
    if (project) {
      setEditingMarker(project);
      setIsPinModalOpen(true);
      handleOnCloseModal();
    }
  }

  async function handleDeleteMarker(markerData: any): Promise<void> {
    const filterFn = await deleteProjectMarker(
      auth.user?.access_token,
      markerData,
    );
    if (filterFn) {
      setLocalData(filterFn);
      handleOnCloseModal();
    }
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

  const handleProjectCreated = async (project: any): Promise<void> => {
    try {
      const updater = await createProjectAddedUpdater(
        project as ProjectInput,
        isProjectAdmin,
      );
      setLocalData(updater);
      setSearchMarker(null); // remove grey pin
    } catch (err) {
      console.error('handleProjectCreated failed to append project', err);
    }
  };

  // Get marker colors and icons based on map type
  const getMarkerProps = (
    dataSource: number,
    isSelected: boolean,
  ): {
    color: string;
    shapeType: string;
    displayMode: string;
  } => {
    if (isCombinedMap) {
      const combinedProps = props as CombinedMapProps;
      return {
        color: isSelected
          ? combinedProps.mapActiveMarkerColor
            ? combinedProps.mapActiveMarkerColor[dataSource] ||
              combinedProps.mapActiveMarkerColor[0]
            : '#FF0000'
          : combinedProps.mapMarkerColor?.[dataSource] ||
            combinedProps.mapMarkerColor?.[0] ||
            '#257DC9',
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
        shapeType: singleProps.mapShapeOption || 'Rectangle',
        displayMode: singleProps.mapDisplayMode || '',
      };
    }
  };

  const combinedMapMarkerStaticIconOffset = (datasource: number): number => {
    if (!isCombinedMap) return 0;

    const combinedProps = props as CombinedMapProps;
    const markerIconLength = props.mapMarkerIcon.length;
    if (datasource == 0) return markerIconLength;

    let offset = 0;
    if (combinedProps.staticValuesLogos) {
      const icons = combinedProps.staticValuesLogos;
      if (icons.length > datasource) {
        for (let i = 0; i < datasource; i++) {
          offset += icons[i].length;
        }
      }
    }
    return markerIconLength + offset;
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
        mapGeoJSONHoveredFeature != undefined &&
        mapGeoJSONHoveredFeature != syncedHoveredFeature.current
      ) {
        syncedHoveredFeature.current = mapGeoJSONHoveredFeature;
        if (geoJsonRef.current) {
          geoJsonRef.current.setStyle(geoJSONStyle);
        }
      }
    } else {
      setIconSvgMarkup(isCombinedMap ? [] : '');
    }
  }, [
    isCombinedMap,
    props.mapMarkerIconColor,
    mapGeoJSONHoveredFeature,
    mapGeoJSONSelectedFeatures,
  ]);

  const getCustomMapImage = async (
    id: string,
  ): Promise<CustomMapImage | undefined> => {
    const found = await getCustomMapImageById(auth?.user?.access_token, id);
    if (found) {
      return found;
    }
    return undefined;
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-full relative">
        {!isCustomMap && (
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
                isCombinedMap
                  ? undefined
                  : (props as SingleMapProps).mapWmsLayer,
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

            {props.mapSearch && (
              <SearchControl
                position="topright"
                onResultSelect={(result) => {
                  setSearchMarker(result);
                  if (result)
                    mapRef.current?.panTo(result.position, { duration: 1.2 });
                }}
              />
            )}

            <ZoomHandler onZoomChange={setMapZoom} />

            {(props.mapType === tabComponentSubTypeEnum.geoJSON ||
              props.mapType === tabComponentSubTypeEnum.geoJSONDynamic) && (
              <>
                <GeoJSON
                  ref={geoJsonRef as any}
                  onEachFeature={geoJSONOnEachFeature}
                  data={geoJSONData ? geoJSONData : DUMMY_GEOJSON}
                  style={geoJSONStyle}
                />
                {props.mapGeoJSONSensorBasedColors && props.mapAllowLegend && (
                  <GeoJSONLegend />
                )}
              </>
            )}

            {((!isCombinedMap &&
              props.mapType !== tabComponentSubTypeEnum.geoJSON &&
              props.mapType !== tabComponentSubTypeEnum.geoJSONDynamic) ||
              (isCombinedMap &&
                (props as CombinedMapProps).mapDisplayMode?.[0] !==
                  tabComponentSubTypeEnum.onlyFormArea)) && (
              <MarkerClusterGroup
                iconCreateFunction={(cluster: L.MarkerCluster) => {
                  const baseIcon = createClusterCustomIcon(
                    cluster,
                    isCombinedMap
                      ? (props as CombinedMapProps).mapMarkerColor || []
                      : (props as SingleMapProps).mapMarkerColor || '',
                    isCombinedMap
                      ? (props as CombinedMapProps).mapMarkerIconColor || []
                      : (props as SingleMapProps).mapMarkerIconColor || '',
                    isCombinedMap,
                  );

                  // Adds an accessible name for cluster icons to prevent warnings.
                  const count = cluster.getChildCount();
                  const baseOptions = baseIcon.options as L.DivIconOptions;

                  return L.divIcon({
                    ...baseOptions,
                    html: `
                            <div 
                              role="button" 
                              aria-label="Cluster with ${count} markers" 
                              title="Cluster with ${count} markers"
                            >
                              ${baseOptions.html ?? ''}
                            </div>
                          `,
                  });
                  //
                }}
                disableClusteringAtZoom={
                  props.mapMaxZoom ? props.mapMaxZoom : 16
                }
              >
                {((): Array<JSX.Element | null> => {
                  const filteredMarkers =
                    markerPositions.length > 0
                      ? getFilteredMarkers()
                      : DEFAULT_MARKERS;
                  const renderedStreetIds = new Set<string>();
                  const renderedLineIds = new Set<string>();

                  return filteredMarkers.map(
                    (marker, index): JSX.Element | null => {
                      const dataSource = marker.dataSource || 0;
                      const markerProps = getMarkerProps(
                        dataSource,
                        selectedMarker.id === index,
                      );

                      // Determine the correct color to use
                      // Priority: 1) Active color if selected, 2) Value-based color if enabled, 3) Default marker color
                      const isSelected = selectedMarker.id === index;
                      let finalColor = markerProps.color; // This already handles active vs default color

                      // If this is the transient search marker inserted by the modal,
                      // force a grey color so it visually differs from existing markers.
                      if (marker?.details?.id === 'search-marker') {
                        finalColor = tempMarkerColor;
                      }

                      // Only use value-based color if not selected and value-based coloring is enabled
                      if (!isSelected) {
                        const statusColor = getStatusColor(marker);
                        if (statusColor) {
                          finalColor = statusColor;
                        }

                        if (isCombinedMap) {
                          const combinedProps = props as CombinedMapProps;
                          if (
                            combinedProps.mapIsIconColorValueBased?.[
                              dataSource
                            ] ||
                            combinedProps.mapIsFormColorValueBased?.[dataSource]
                          ) {
                            finalColor =
                              statusColor || marker.color || markerProps.color;
                          }
                        } else {
                          const singleProps = props as SingleMapProps;
                          if (
                            singleProps.mapIsIconColorValueBased ||
                            singleProps.mapIsFormColorValueBased
                          ) {
                            finalColor =
                              statusColor || marker.color || markerProps.color;
                          }
                        }
                      }

                      const streetLineCoords = getStreetLineCoords(marker);
                      if (streetLineCoords) {
                        const streetId = marker?.details?.id
                          ? String(marker.details.id)
                          : null;
                        if (!streetId || renderedStreetIds.has(streetId)) {
                          return null;
                        }
                        renderedStreetIds.add(streetId);
                        return (
                          <Polyline
                            key={`street-${streetId}`}
                            positions={streetLineCoords}
                            pathOptions={{
                              color: finalColor,
                              weight: 5,
                              opacity: 0.95,
                              dashArray: '14 8',
                            }}
                          />
                        );
                      }
                      // Streets render as polylines only to avoid duplicate pins
                      if (marker?.details?.type === 'Street') {
                        return null;
                      }
                      // Use project category icon for project/street types
                      const markerIcon = isProjectOrStreetType(marker)
                        ? createProjectCategoryIcon(
                            finalColor,
                            marker,
                            projectCategoryCache,
                          )
                        : createCustomIcon(
                            finalColor,
                            iconSvgMarkup,
                            combinedMapMarkerStaticIconOffset(dataSource) +
                              (marker.iconIndex ?? 0),
                            isCombinedMap,
                            isCombinedMap
                              ? getCombinedMapIconList(dataSource)[
                                  marker.iconIndex ?? 0
                                ]
                              : (props as SingleMapProps).mapMarkerIcon,
                          );

                      const markerElement =
                        markerProps.displayMode !==
                        tabComponentSubTypeEnum.onlyFormArea ? (
                          <Marker
                            key={
                              marker.details?.id
                                ? String(marker.details.id)
                                : `marker-${index}`
                            }
                            position={marker.position as LatLngExpression}
                            icon={markerIcon}
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
                                if (handleOnMarkerClick) {
                                  handleOnMarkerClick(marker.details.id);
                                }
                              },
                              popupclose: handleOnCloseModal,
                            }}
                          >
                            {props.mapAllowPopups && !isFullscreenMap && (
                              <Popup maxWidth={200}>
                                <div
                                  style={{
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    marginBottom: '10px',
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
                        ) : null;

                      const lineCoords = getLineCoords(marker);
                      if (lineCoords) {
                        const lineId = marker?.details?.id
                          ? String(marker.details.id)
                          : String(index);
                        if (renderedLineIds.has(lineId)) {
                          return null;
                        }
                        renderedLineIds.add(lineId);
                        return (
                          <React.Fragment key={`route-${lineId}`}>
                            <Polyline
                              positions={lineCoords}
                              pathOptions={{
                                color: finalColor,
                                weight: 5,
                                opacity: 0.95,
                                dashArray: '14 8',
                              }}
                            />
                            {markerElement}
                          </React.Fragment>
                        );
                      }

                      return markerElement;
                    },
                  );
                })()}

                {/* If a route was created in the modal, render it as a polyline (single visual line) */}
                {searchMarker?.routePoints && (
                  <Polyline
                    positions={searchMarker.routePoints as LatLngExpression[]}
                    pathOptions={{
                      color: tempMarkerColor,
                      weight: 5,
                      opacity: 0.95,
                      dashArray: '14 8',
                    }}
                  />
                )}
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
              {props.mapAllowLegend &&
                props.mapType !== tabComponentSubTypeEnum.geoJSON &&
                props.mapType !== tabComponentSubTypeEnum.geoJSONDynamic && (
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
              {isProjectAdmin && (
                <div
                  className="flex flex-row items-center justify-between p-2 rounded-lg shadow-lg cursor-pointer"
                  onClick={togglePinModal}
                  style={menuStyle}
                >
                  <h2 className="font-bold pr-1">Pin hinzufügen</h2>
                  <FontAwesomeIcon
                    icon={faAnglesRight}
                    className={`transform ${
                      isPinModalOpen ? 'rotate-180' : 'rotate-0'
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
                    ciColors={ciColors!}
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
                uiFilterData={uiFilterData}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                menuStyle={menuStyle}
                onCloseModal={closeFilterModal}
                isLegendModalOpen={isLegendModalOpen}
                isFullscreenMap={isFullscreenMap}
                mapNames={
                  isCombinedMap
                    ? (props as CombinedMapProps).mapNames || []
                    : []
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
            {isProjectAdmin && isPinModalOpen && (
              <MapCreatePinModal
                menuStyle={{ ...menuStyle, width: '25rem' }}
                ciColors={ciColors}
                onCloseModal={closePinModal}
                initialData={editingMarker}
                onProjectCreated={handleProjectCreated}
                onSelectCoordinates={createSelectCoordinatesHandler(
                  setSearchMarker,
                  mapRef,
                )}
                onRequestCenterPinVisibility={setCenterPinVisible}
                onSelectRoute={createSelectRouteHandler(
                  setSearchMarker,
                  mapRef,
                )}
              />
            )}
          </MapContainer>
        )}
        {centerPinVisible && (
          <div
            className="absolute top-1/2 left-1/2 z-[1000] pointer-events-none"
            style={{ transform: 'translate(-50%, -60px)' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 30 30"
              fill={tempMarkerColor}
              width="60px"
              height="60px"
              style={{
                filter:
                  'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))',
              }}
            >
              <path d="M15 2C10.58 2 7 5.58 7 10c0 6.627 8 16 8 16s8-9.373 8-16c0-4.42-3.58-8-8-8z" />
              <g
                transform="translate(10.5, 6) scale(0.4)"
                dangerouslySetInnerHTML={{
                  __html: Array.isArray(iconSvgMarkup)
                    ? iconSvgMarkup[0]
                    : iconSvgMarkup,
                }}
              />
            </svg>
          </div>
        )}

        {isCustomMap &&
          customMapImage &&
          customMapBounds &&
          customMapImageWidth &&
          customMapImageHeight && (
            <MapContainer
              className="transparent-bg"
              crs={L.CRS.Simple}
              center={[customMapImageHeight / 2, customMapImageWidth / 2]}
              style={{ height: '100%', width: '100%' }}
              zoom={props.mapStandardZoom}
              zoomControl={props.mapAllowZoom}
              minZoom={props.mapMinZoom}
              scrollWheelZoom={props.mapAllowZoom}
              touchZoom={props.mapAllowZoom}
              ref={mapRef}
              doubleClickZoom={props.mapAllowZoom}
              dragging={props.mapAllowScroll}
            >
              <ImageOverlay
                url={customMapImage.imageBase64}
                bounds={customMapBounds}
              />

              <FitBounds bounds={customMapBounds} />

              {/* <ZoomHandler onZoomChange={setMapZoom} /> */}

              {((): MarkerType[] => {
                const list =
                  customMarkerPositions.length > 0 ? customMarkerPositions : [];
                const filtered = list.filter((m) => {
                  // Reuse the same filter logic as standard markers
                  return getFilteredMarkers().includes(m);
                });
                return filtered;
              })().map((marker, index) => {
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
                // Additionally: in custom map multi-pin mode, always use the computed marker.color
                if (!isSelected) {
                  const pinMode = (props as any).pinMode as
                    | 'single'
                    | 'multi'
                    | undefined;
                  if (!isCombinedMap) {
                    const singleProps = props as SingleMapProps;
                    const isCustomMulti = pinMode === 'multi';
                    if (isCustomMulti) {
                      // Use multi-attribute computed color
                      finalColor = marker.color || markerProps.color;
                    } else if (
                      singleProps.mapIsIconColorValueBased ||
                      singleProps.mapIsFormColorValueBased
                    ) {
                      finalColor = marker.color || markerProps.color;
                    }
                  } else {
                    const combinedProps = props as CombinedMapProps;
                    if (
                      combinedProps.mapIsIconColorValueBased?.[dataSource] ||
                      combinedProps.mapIsFormColorValueBased?.[dataSource]
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
                        combinedMapMarkerStaticIconOffset(dataSource) +
                          (marker.iconIndex ?? 0),
                        isCombinedMap,
                        isCombinedMap
                          ? getCombinedMapIconList(dataSource)[
                              marker.iconIndex ?? 0
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
                        mapZoom > 16 &&
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

              {props.mapSearch && searchMarker && (
                <Marker
                  position={searchMarker.position}
                  icon={defaultSearchIcon}
                >
                  <Popup>{searchMarker.label}</Popup>
                </Marker>
              )}
            </MapContainer>
          )}

        <div ref={iconRef} style={{ display: 'none' }}>
          {isCombinedMap && (props as CombinedMapProps).mapMarkerIcon
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
          {isCombinedMap
            ? (props as CombinedMapProps).staticValuesLogos?.map(
                (staticValuesLogos, datasource) => {
                  return staticValuesLogos.map((l, index) => {
                    return (
                      <DashboardIcons
                        key={datasource + '-DashboardIcons-' + index}
                        iconName={l}
                        color={
                          (props as CombinedMapProps).staticValuesColors![
                            datasource
                          ][index] ?? 'white'
                        }
                      />
                    );
                  });
                },
              )
            : (props as SingleMapProps).staticValuesLogos?.map((l, index) => {
                return (
                  <DashboardIcons
                    key={'DashboardIcons-' + index}
                    iconName={l}
                    color={(props as SingleMapProps).staticValuesColors[index]}
                  />
                );
              })}
        </div>
      </div>

      {/* sidebar modal */}
      {props.mapAllowPopups && isFullscreenMap && selectedMarker.data && (
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
          onEditMarker={isProjectAdmin ? handleEditMarker : undefined}
          onDeleteMarker={isProjectAdmin ? handleDeleteMarker : undefined}
          isAdmin={isProjectAdmin}
          values={props.values || 65}
        />
      )}
    </div>
  );
}
