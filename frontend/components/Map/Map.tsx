'use client';
import React, { useEffect, useState, useRef, CSSProperties } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Rectangle,
  Circle,
  Polygon,
  LayerGroup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import L, { LatLngExpression, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';

import '@/components/Map/map.css';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import SetViewToBounds from './SetViewToBounds';
import {
  MapModalChartStyle,
  MapModalWidget,
  MapModalLegend,
  QueryDataAttributes,
  QueryDataAttributeValues,
  QueryDataEntities,
  tabComponentSubTypeEnum,
} from '@/types';
import MapModal from './MapModal';
import { env } from 'next-runtime-env';
import { DEFAULT_MARKERS } from '@/utils/objectHelper';
import MapFilterModal from './MapFilterModal';
import MapLegendModal from './MapLegendModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';

type MapProps = {
  mapMaxZoom: number;
  mapMinZoom: number;
  mapAllowPopups: boolean;
  mapStandardZoom: number;
  mapAllowZoom: boolean;
  mapAllowScroll: boolean;
  mapAllowFilter?: boolean;
  mapFilterAttribute?: string;
  mapQueryDataAttributes?: QueryDataAttributes[];
  mapQueryDataAttributeValues?: QueryDataAttributeValues[];
  mapAllowLegend?: boolean;
  mapLegendValues?: MapModalLegend[];
  mapLegendDisclaimer?: string;
  mapMarkerColor: string;
  mapMarkerIcon: string;
  mapMarkerIconColor: string;
  mapLongitude: number;
  mapLatitude: number;
  mapActiveMarkerColor: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[];
  mapShapeOption?: string;
  mapDisplayMode?: string;
  mapShapeColor?: string;
  mapWidgetValues?: MapModalWidget[];
  isFullscreenMap?: boolean;
  chartStyle?: MapModalChartStyle;
  menuStyle?: CSSProperties;
};

export type Marker = {
  position: [number, number];
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any;
};

type SelectedMarker = {
  id: number | null;
  data: Marker | null;
};

export default function Map(props: MapProps): JSX.Element {
  const {
    mapMaxZoom,
    mapMinZoom,
    mapAllowPopups,
    mapStandardZoom,
    mapAllowZoom,
    mapAllowScroll,
    mapAllowFilter,
    mapFilterAttribute,
    mapQueryDataAttributes,
    mapQueryDataAttributeValues,
    mapAllowLegend,
    mapLegendValues,
    mapLegendDisclaimer,
    mapMarkerColor,
    mapMarkerIcon,
    mapMarkerIconColor,
    mapLongitude,
    mapLatitude,
    mapActiveMarkerColor,
    data,
    mapShapeOption,
    mapDisplayMode,
    mapShapeColor,
    mapWidgetValues,
    isFullscreenMap,
    chartStyle,
    menuStyle,
  } = props;

  const [mapZoom] = useState(6);
  const iconRef = useRef<HTMLDivElement>(null);
  const [iconSvgMarkup, setIconSvgMarkup] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker>({
    id: null,
    data: null,
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isLegendModalOpen, setIsLegendModalOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<(string | number)[]>(
    [],
  );

  const handleFilterChange = (
    newSelectedFilters: (string | number)[],
  ): void => {
    setSelectedFilters(newSelectedFilters);
  };

  const closeFilterModal = (): void => {
    setIsFilterModalOpen(false);
  };

  const closeLegendModal = (): void => {
    setIsLegendModalOpen(false);
  };

  // allow opening both modals only for desktop and fullscreen Map
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

  const getSelectedMapFilterAttributeEntitiesFromQueryData = ():
    | QueryDataEntities[]
    | undefined => {
    if (
      mapFilterAttribute &&
      mapQueryDataAttributes &&
      mapQueryDataAttributes.length > 0
    ) {
      const matchingAttribute = mapQueryDataAttributes.find(
        (attribute) => attribute.attrName === mapFilterAttribute,
      );

      return matchingAttribute?.types[0].entities;
    }

    return undefined;
  };

  useEffect(() => {
    const handleResize = (): void => setIsMobileView(window.innerWidth <= 768);

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const markerPositions: Marker[] = (data || []).map((mapObject, index) => ({
    position: mapObject.position.coordinates ?? [52.520008, 13.404954],
    title: `Marker ${index + 1}`,
    details: mapObject,
  }));

  const getFilteredMarkers = (): Marker[] => {
    return selectedFilters && selectedFilters.length > 0 && mapFilterAttribute
      ? markerPositions.filter((marker) => {
          const propertyValue = marker.details[mapFilterAttribute];
          return selectedFilters.includes(propertyValue);
        })
      : markerPositions;
  };

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false); // After the first load, set this to false to prevent refitting bounds on updates
    }
  }, [initialLoad]);

  const createCustomIcon = (color: string): L.Icon => {
    const iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="${color}">
      <path d="M15 2C10.58 2 7 5.58 7 10c0 6.627 8 16 8 16s8-9.373 8-16c0-4.42-3.58-8-8-8z"/> <!-- Modified path data for a pin without a hole -->
      <g transform="translate(9,5) scale(0.5)">
          ${iconSvgMarkup}
      </g>
      </svg>`;

    const urlEncodedSvg = encodeURIComponent(iconSvg);

    return L.icon({
      iconUrl: `data:image/svg+xml,${urlEncodedSvg}`,
      iconSize: [60, 60],
      iconAnchor: [30, 60],
      popupAnchor: [0, -60],
      shadowSize: [41, 41],
    });
  };

  const createClusterCustomIcon = (cluster: L.MarkerCluster): L.DivIcon => {
    const count = cluster.getChildCount();
    let displayCount = count.toString();
    let fontSize = '12px';
    if (count > 99) {
      fontSize = '8px';
    }
    if (count > 1000 && count <= 9999) {
      displayCount = (count / 1000).toFixed(0) + 'K';
    }

    const iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="${mapMarkerColor}">
        <path d="M15 2C10.58 2 7 5.58 7 10c0 6.627 8 16 8 16s8-9.373 8-16c0-4.42-3.58-8-8-8z"/>
        <text x="15" y="12" text-anchor="middle" fill="white" font-size="${fontSize}" font-family="Arial" dy=".3em">${displayCount}</text>
      </svg>`;

    const urlEncodedSvg = encodeURIComponent(iconSvg);

    return L.divIcon({
      html: `<div style="background-image: url(data:image/svg+xml,${urlEncodedSvg}); background-size: cover; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;"></div>`,
      className: 'custom-cluster-icon',
      iconSize: L.point(80, 80),
      iconAnchor: [20, 40],
    });
  };

  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}?access_token=${env(
    'NEXT_PUBLIC_MAPBOX_TOKEN',
  )}`;

  useEffect(() => {
    if (iconRef.current && mapMarkerIcon) {
      const svgElement = iconRef.current.querySelector('svg');
      if (svgElement instanceof SVGElement) {
        svgElement.setAttribute('fill', mapMarkerIconColor);

        svgElement
          .querySelectorAll('path, circle, rect, polygon, polyline')
          .forEach((el) => {
            el.setAttribute('fill', mapMarkerIconColor);
          });

        const scaledSvgMarkup = `
         <g transform="scale(0.8)">
           ${svgElement.outerHTML}
         </g>
       `;
        setIconSvgMarkup(scaledSvgMarkup);
      }
    } else {
      setIconSvgMarkup('');
    }
  }, [mapMarkerIcon, mapMarkerIconColor]);

  const createRectangleAroundMarker = (
    position: [number, number],
    width = 0.01,
    height = 0.02,
  ): [[number, number], [number, number]] => {
    const bounds: [[number, number], [number, number]] = [
      [position[0] - height / 2, position[1] - width / 2],
      [position[0] + height / 2, position[1] + width / 2],
    ];
    return bounds;
  };

  const createSquareAroundMarker = (
    position: [number, number],
    size = 0.01,
  ): [[number, number], [number, number]] => {
    const latDiff = size;
    const lngDiff = size / Math.cos((position[0] * Math.PI) / 180);
    const bounds: [[number, number], [number, number]] = [
      [position[0] - latDiff / 2, position[1] - lngDiff / 2],
      [position[0] + latDiff / 2, position[1] + lngDiff / 2],
    ];
    return bounds;
  };

  const createHexagonAroundMarker = (
    position: [number, number],
    size = 0.01,
  ): LatLngTuple[] => {
    const angle = Math.PI / 3;
    const hexagon: LatLngTuple[] = [];
    for (let i = 0; i < 6; i++) {
      const theta = i * angle;
      const lat = position[0] + size * Math.sin(theta);
      const lng = position[1] + size * Math.cos(theta);
      hexagon.push([lat, lng]);
    }
    return hexagon;
  };

  const renderShape = (position: [number, number]): JSX.Element => {
    switch (mapShapeOption) {
      case 'Circle':
        return (
          <Circle
            key={mapShapeColor}
            center={position}
            radius={1000} // Adjust radius as needed
            color={mapShapeColor}
            fillColor={mapShapeColor}
            fillOpacity={0.1}
          />
        );
      case 'Hexagon':
        return (
          <Polygon
            key={mapShapeColor}
            positions={createHexagonAroundMarker(position)}
            color={mapShapeColor}
            fillColor={mapShapeColor}
            fillOpacity={0.1}
          />
        );
      case 'Rectangle':
        return (
          <Rectangle
            key={mapShapeColor}
            bounds={createRectangleAroundMarker(position, 0.02, 0.01)} // Adjust width and height for rectangle
            color={mapShapeColor}
            weight={2}
            fillColor={mapShapeColor}
            fillOpacity={0.1}
          />
        );
      default:
        return (
          <Rectangle
            key={mapShapeColor}
            bounds={createSquareAroundMarker(position)}
            color={mapShapeColor}
            weight={2}
            fillColor={mapShapeColor}
            fillOpacity={0.1}
          />
        );
    }
  };

  function handleOnCloseModal(): void {
    setSelectedMarker({
      id: null,
      data: null,
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
      // Map panel widget and mobile view
      return {
        zIndex: 1000,
        position: 'absolute',
        bottom: '3rem',
        left: '1rem',
      };
    }
  };

  return (
    <>
      <div className="w-full h-full relative">
        <MapContainer
          key={`map-container-${mapAllowZoom}-${mapAllowScroll}-${mapMaxZoom}-${mapMinZoom}-${mapStandardZoom}`}
          center={
            data && data.length > 0
              ? [
                  data?.[0]?.position.coordinates[0],
                  data?.[0]?.position.coordinates[1],
                ]
              : [mapLatitude, mapLongitude]
          }
          zoom={2}
          zoomControl={mapAllowZoom}
          scrollWheelZoom={mapAllowZoom}
          touchZoom={mapAllowZoom}
          doubleClickZoom={mapAllowZoom}
          dragging={mapAllowScroll}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
            url={mapboxUrl}
          />
          {mapDisplayMode !== tabComponentSubTypeEnum.onlyFormArea && (
            <MarkerClusterGroup
              iconCreateFunction={createClusterCustomIcon}
              disableClusteringAtZoom={15}
            >
              {(markerPositions.length > 0
                ? getFilteredMarkers()
                : DEFAULT_MARKERS
              ).map((marker, index) => (
                <Marker
                  key={index}
                  position={marker.position as LatLngExpression}
                  icon={createCustomIcon(
                    selectedMarker.id === index
                      ? mapActiveMarkerColor
                      : mapMarkerColor,
                  )}
                  eventHandlers={{
                    click: (e): void => {
                      // Prevent the map from panning to the clicked marker
                      e.originalEvent.stopPropagation();
                      if (selectedMarker.id === index) {
                        setSelectedMarker({ id: null, data: null });
                      } else {
                        setSelectedMarker({ id: index, data: marker });
                      }
                    },
                    popupclose: handleOnCloseModal,
                  }}
                >
                  {mapAllowPopups && !isFullscreenMap ? (
                    <Popup>
                      <div
                        style={{
                          textAlign: 'center',
                          fontSize: '16px',
                          marginBottom: '10px',
                        }}
                      >
                        <strong>{marker.title}</strong>
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        {Object.entries(marker.details).map(([key, value]) =>
                          typeof value === 'string' ||
                          typeof value === 'number' ? (
                            <div key={key}>
                              {key.toUpperCase()}:{' '}
                              <strong>{value.toString()}</strong>
                            </div>
                          ) : null,
                        )}
                      </div>
                    </Popup>
                  ) : null}
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}
          {mapDisplayMode !== tabComponentSubTypeEnum.onlyPin && (
            <LayerGroup>
              {(markerPositions.length > 0
                ? getFilteredMarkers()
                : DEFAULT_MARKERS
              ).map((marker, index) => (
                <React.Fragment key={index}>
                  {mapZoom >= 10 && renderShape(marker.position)}
                </React.Fragment>
              ))}
            </LayerGroup>
          )}
          <SetViewToBounds
            markerPositions={markerPositions}
            centerPosition={[
              isNaN(data?.[0]?.position.coordinates[0] || mapLatitude)
                ? 52.520008
                : data?.[0]?.position.coordinates[0] || mapLatitude,
              isNaN(data?.[0]?.position.coordinates[1] || mapLongitude)
                ? 13.404954
                : data?.[0]?.position.coordinates[1] || mapLongitude,
            ]}
          />
          {/* filter and legend button toggle */}
          <div className="flex flex-row gap-x-2 ml-3" style={getDivStyle()}>
            {mapAllowFilter && (
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
            {mapAllowLegend && (
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
          </div>
          {/* filter and legend modals */}
          {mapAllowFilter && isFilterModalOpen && (
            <MapFilterModal
              mapFilterEntities={
                getSelectedMapFilterAttributeEntitiesFromQueryData() || []
              }
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              menuStyle={menuStyle}
              onCloseModal={closeFilterModal}
              isLegendModalOpen={isLegendModalOpen}
              isFullscreenMap={isFullscreenMap}
            />
          )}
          {mapAllowLegend && isLegendModalOpen && (
            <MapLegendModal
              mapLegendValues={mapLegendValues}
              mapLegendDisclaimer={mapLegendDisclaimer}
              menuStyle={menuStyle}
              onCloseModal={closeLegendModal}
              isFilterModalOpen={isFilterModalOpen}
              isFullscreenMap={isFullscreenMap}
            />
          )}
        </MapContainer>
        <div ref={iconRef} style={{ display: 'none' }}>
          <DashboardIcons iconName={mapMarkerIcon} color="white" />
        </div>
      </div>
      {/* sidebar modal */}
      {mapAllowPopups && selectedMarker.data && isFullscreenMap && (
        <MapModal
          selectedMarker={selectedMarker.data}
          mapWidgetValues={mapWidgetValues}
          mapQueryDataAttributeValues={mapQueryDataAttributeValues}
          menuStyle={menuStyle}
          chartStyle={chartStyle}
          onCloseModal={handleOnCloseModal}
        ></MapModal>
      )}
    </>
  );
}
