/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState, useRef, CSSProperties, JSX } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Rectangle,
  Circle,
  Polygon,
  WMSTileLayer,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';
import { env } from 'next-runtime-env';

import '@/components/Map/map.css';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import SetViewToBounds from './SetViewToBounds';
import {
  MapModalChartStyle,
  MapModalWidget,
  MapModalLegend,
  tabComponentSubTypeEnum,
  QueryDataWithAttributes,
  CorporateInfo,
} from '@/types';
import MapModal from './MapModal';
import { DEFAULT_MARKERS } from '@/utils/objectHelper';
import MapFilterModal from './MapFilterModal';
import MapLegendModal from './MapLegendModal';
import {
  createHexagonAroundMarker,
  createRectangleAroundMarker,
  createSquareAroundMarker,
  getGermanLabelForSensorAttribute,
  getGermanVehicleType,
  ZoomHandler,
} from './MapUtils';
import { convertToLocaleNumber, roundToDecimal } from '@/utils/mathHelper';
import { localSvgIconsList } from '@/ui/Icons/LocalSvgIcons';
import DataExportButton from '@/ui/Buttons/DataExportButton';

type MapProps = {
  chartStyle?: MapModalChartStyle;
  data?: any[];
  combinedMapData?: Record<string, boolean | any[] | null>;
  isFullscreenMap?: boolean;
  mapActiveMarkerColor: string[];
  mapAllowFilter?: boolean;
  mapAllowLegend?: boolean;
  mapAllowPopups?: boolean;
  mapAllowScroll?: boolean;
  mapAllowZoom?: boolean;
  mapDisplayMode?: string[];
  mapFilterAttribute?: string;
  mapLatitude?: number;
  mapLegendDisclaimer?: string[];
  mapLegendValues?: MapModalLegend[];
  mapLongitude?: number;
  mapMarkerColor?: string[];
  mapMarkerIconColor?: string[];
  mapMarkerIcon: string[];
  mapMaxZoom?: number;
  mapMinZoom?: number;
  combinedQueryData?: QueryDataWithAttributes[];
  mapShapeColor?: string[];
  mapShapeOption?: string[];
  mapStandardZoom?: number;
  mapWidgetValues?: MapModalWidget[];
  mapCombinedWmsUrl?: string;
  mapCombinedWmsLayer?: string;
  mapNames?: string[];
  menuStyle?: CSSProperties;
  ciColors?: CorporateInfo;
  allowDataExport?: boolean;
  widgetDownloadId?: string;
};

export type Marker = {
  position: [number, number];
  title: string;
  details: any;
  dataSource?: number;
};

type SelectedMarker = {
  id: number | null;
  data: Marker | null;
  dataSource: number | null;
};

export default function CombinedMap(props: MapProps): JSX.Element {
  const {
    mapMaxZoom,
    mapMinZoom,
    mapStandardZoom,
    mapAllowPopups,
    mapAllowZoom,
    mapAllowScroll,
    mapAllowFilter,
    combinedQueryData,
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
    mapCombinedWmsUrl,
    mapCombinedWmsLayer,
    mapNames,
    isFullscreenMap,
    chartStyle,
    menuStyle,
    ciColors,
    allowDataExport,
    widgetDownloadId,
  } = props;

  const userLocale =
    typeof window !== 'undefined' ? navigator.language || 'en-US' : 'en-US';
  const numberFormat = new Intl.NumberFormat(userLocale);
  const decimalSeparator = numberFormat.format(1.1).charAt(1);

  const [mapZoom, setMapZoom] = useState(6);
  const iconRef = useRef<HTMLDivElement>(null);
  const [iconSvgMarkup, setIconSvgMarkup] = useState<string[]>([]);
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

  const handleFilterChange = (
    newSelectedFilters: (string | number)[],
    filterAttribute: string,
  ): void => {
    setSelectedFilters(newSelectedFilters);
    setSelectedMapFilterAttribute(filterAttribute);
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

  useEffect(() => {
    const handleResize = (): void => setIsMobileView(window.innerWidth <= 1024);

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const markerPositions: Marker[] = (data || []).map((mapObject, index) => {
    return {
      position: mapObject.position.coordinates ?? [52.520008, 13.404954], // Coordinates
      title: mapObject.name ? mapObject.name.value : `Sensor ${index + 1}`, // Sensor name
      details: mapObject, // Full sensor details object
      dataSource: mapObject.dataSource, // Optional dataSource attribute
    };
  });

  const getFilteredMarkers = (): Marker[] => {
    return markerPositions.filter((marker) => {
      // Filter by attribute and value
      if (selectedFilters.length > 0) {
        const attributeDetails = marker.details[selectedMapFilterAttribute];
        if (!attributeDetails) return false;

        const propertyValueRaw = attributeDetails.value;
        const propertyValue =
          parseFloat(propertyValueRaw) === 0 ? 0 : propertyValueRaw;
        if (!selectedFilters.includes(propertyValue)) return false;
      }

      // Filter by dataSource (map selection)
      if (
        selectedDataSources.length > 0 &&
        !selectedDataSources.includes(marker.dataSource ?? -1)
      ) {
        return false;
      }

      return true;
    });
  };

  const findValidWmsConfig = (): { url: string; layer: string } | null => {
    if (
      !mapCombinedWmsUrl ||
      !mapCombinedWmsLayer ||
      mapCombinedWmsUrl === '' ||
      mapCombinedWmsLayer === ''
    ) {
      return null;
    }
    return {
      url: mapCombinedWmsUrl,
      layer: mapCombinedWmsLayer,
    };
  };

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false); // After the first load, set this to false to prevent refitting bounds on updates
    }
  }, [initialLoad]);

  const getCustomTranslateForSvg = (iconIndex: number): number => {
    if (iconIndex < 0 || !mapMarkerIcon || iconIndex >= mapMarkerIcon.length) {
      return 10.5;
    }

    // Get the name of the current icon
    const currentIconName = mapMarkerIcon[iconIndex];

    // Check if the icon is a Font Awesome icon
    const isFontAwesomeIcon = !localSvgIconsList.some(
      (icon) => icon.name === currentIconName,
    );

    if (isFontAwesomeIcon) return 9.5;

    // Custom translate values for specific svg icons
    const nameOfIconsToCustom = [
      { name: 'SoilMoisture', value: 10 },
      { name: 'Mobility', value: 11 },
      { name: 'Info', value: 11.5 },
      { name: 'Dry', value: 11.5 },
      { name: 'Trees', value: 11.5 },
      { name: 'Pollen', value: 11.5 },
      { name: 'RemoteSoil', value: 11.5 },
    ];

    // Check icons need custom translate values
    const customIcon = nameOfIconsToCustom.find(
      (icon) => icon.name === currentIconName,
    );

    // Return custom value if found, otherwise default to 10.5
    return customIcon ? customIcon.value : 11;
  };

  const createCustomIcon = (color: string, iconIndex: number): L.Icon => {
    const iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="${color}">
        <path d="M15 2C10.58 2 7 5.58 7 10c0 6.627 8 16 8 16s8-9.373 8-16c0-4.42-3.58-8-8-8z" /> <!-- Modified path data for a pin without a hole -->
        <g transform="translate(${getCustomTranslateForSvg(iconIndex)},5) scale(0.35)">
          ${iconSvgMarkup[iconIndex] || ''}
        </g>
      </svg>`;

    const urlEncodedSvg = encodeURIComponent(iconSvg);

    return L.icon({
      iconUrl: `data:image/svg+xml,${urlEncodedSvg}`,
      iconSize: [50, 50],
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

    const combinedMapMarkerColor = mapMarkerColor?.[0] || '#257DC9';

    const iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="${combinedMapMarkerColor}">
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

  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}?access_token=${env(
    'NEXT_PUBLIC_MAPBOX_TOKEN',
  )}`;

  useEffect(() => {
    if (iconRef.current && mapMarkerIcon && mapMarkerIcon.length > 0) {
      const svgElements = iconRef.current.querySelectorAll('svg');
      const newIconSvgMarkup = Array.from(svgElements).map((svgElement) => {
        svgElement.setAttribute('fill', mapMarkerIconColor?.[0] || '#FFF');

        svgElement
          .querySelectorAll('path, circle, rect, polygon, polyline')
          .forEach((el) => {
            el.setAttribute('fill', mapMarkerIconColor?.[0] || '#FFF');
          });
        return svgElement.outerHTML;
      });
      setIconSvgMarkup(newIconSvgMarkup);
    }
  }, [mapMarkerIcon, mapMarkerIconColor]);

  const renderShape = (
    position: [number, number],
    shapeType: string,
    color: string,
  ): JSX.Element => {
    switch (shapeType) {
      case 'Circle':
        return (
          <Circle
            key={color}
            center={position}
            radius={1000} // Adjust radius as needed
            color={color}
            fillColor={color}
            fillOpacity={0.1}
          />
        );
      case 'Hexagon':
        return (
          <Polygon
            key={color}
            positions={createHexagonAroundMarker(position)}
            color={color}
            fillColor={color}
            fillOpacity={0.1}
          />
        );
      case 'Rectangle':
        return (
          <Rectangle
            key={color}
            bounds={createRectangleAroundMarker(position)}
            color={color}
            weight={2}
            fillColor={color}
            fillOpacity={0.1}
          />
        );
      default: // 'Square'
        return (
          <Rectangle
            key={color}
            bounds={createSquareAroundMarker(position)}
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

  const getFormattedDate = (value: string): string => {
    const date = new Date(value);
    return date.getMonth() === 0 &&
      date.getDate() === 1 &&
      date.getHours() === 1 &&
      date.getMinutes() === 0
      ? date.getFullYear().toString()
      : date.toLocaleString(navigator.language || 'de-DE', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        });
  };

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
    <div className="w-full h-full">
      <div className="w-full h-full relative">
        <MapContainer
          key={`map-container-${mapAllowZoom}-${mapAllowScroll}-${mapMaxZoom}-${mapMinZoom}-${mapStandardZoom}`}
          style={{ height: '100%', width: '100%' }}
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
          {((): JSX.Element => {
            const wmsConfig = findValidWmsConfig();
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
          <MarkerClusterGroup
            iconCreateFunction={createClusterCustomIcon}
            disableClusteringAtZoom={15}
          >
            {(markerPositions.length > 0
              ? getFilteredMarkers()
              : DEFAULT_MARKERS
            ).map((marker, index) => {
              const dataSource = marker.dataSource as number;
              const displayMode = mapDisplayMode?.[dataSource];

              return (
                displayMode !== tabComponentSubTypeEnum.onlyFormArea && (
                  <Marker
                    key={index}
                    position={marker.position as LatLngExpression}
                    icon={createCustomIcon(
                      selectedMarker.id === index
                        ? mapActiveMarkerColor?.[dataSource] || '#FF0000'
                        : mapMarkerColor?.[dataSource] || '#257DC9',
                      dataSource,
                    )}
                    eventHandlers={{
                      click: (e): void => {
                        // Prevent the map from panning to the clicked marker
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
                            dataSource: (marker.dataSource as number) || 0,
                          });
                        }
                      },
                      popupclose: handleOnCloseModal,
                    }}
                  >
                    {mapAllowPopups && !isFullscreenMap && (
                      <Popup maxWidth={200}>
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
                        <div style={{ fontSize: '14px', color: '#000000' }}>
                          {Object.entries(marker.details).map(
                            ([key, value]) => {
                              const tempValue: any = value;
                              if (
                                key === 'id' ||
                                key === 'location' ||
                                key === 'position' ||
                                key === 'name'
                              )
                                return;

                              if (value && tempValue.value) {
                                //Quick and dirty solution...bad stuff
                                if (key.toUpperCase() === 'TOTALCONSUMPTION') {
                                  return (
                                    <div key={key}>
                                      Gesamtverbrauch:
                                      <strong>
                                        {' '}
                                        {convertToLocaleNumber(
                                          tempValue.value.toString(),
                                          decimalSeparator,
                                        )}{' '}
                                        {'m³'}
                                      </strong>
                                    </div>
                                  );
                                }
                                if (key.toUpperCase() === 'METERTYPE') {
                                  return (
                                    <div key={key}>
                                      Zählertyp:
                                      <strong>
                                        {' '}
                                        {tempValue.value.toString() === 'water'
                                          ? 'Wasser'
                                          : 'Gas'}
                                      </strong>
                                    </div>
                                  );
                                }
                                if (key.toUpperCase() === 'VEHICLETYPE') {
                                  return (
                                    <div key={key}>
                                      Fahrzeugart:
                                      <strong>
                                        {' '}
                                        {getGermanVehicleType(
                                          tempValue.value
                                            .toString()
                                            .toUpperCase(),
                                        )}
                                      </strong>
                                    </div>
                                  );
                                }
                                if (
                                  key.toUpperCase() === 'DATE' ||
                                  key.toUpperCase() === 'DATEOBSERVED'
                                ) {
                                  return (
                                    <div key={key}>
                                      DATUM:
                                      <strong>
                                        {getFormattedDate(tempValue.value)}
                                      </strong>
                                    </div>
                                  );
                                }
                                return (
                                  <div key={key}>
                                    {getGermanLabelForSensorAttribute(
                                      key.toUpperCase(),
                                    )}
                                    :{' '}
                                    <strong>
                                      {' '}
                                      {tempValue.value
                                        ? convertToLocaleNumber(
                                            roundToDecimal(
                                              tempValue.value,
                                            ).toString(),
                                            decimalSeparator,
                                          )
                                        : convertToLocaleNumber(
                                            roundToDecimal(
                                              tempValue,
                                            ).toString(),
                                            decimalSeparator,
                                          )}
                                    </strong>
                                  </div>
                                );
                              }

                              return null; // Ignore undefined or other non-relevant fields
                            },
                          )}
                        </div>
                      </Popup>
                    )}

                    {displayMode !== tabComponentSubTypeEnum.onlyPin &&
                      mapZoom > 15 &&
                      (!Array.isArray(marker) || marker.length === 1) &&
                      renderShape(
                        marker.position,
                        mapShapeOption?.[dataSource] || 'Rectangle',
                        mapShapeColor?.[dataSource] || '#FF0000',
                      )}
                  </Marker>
                )
              );
            })}
          </MarkerClusterGroup>
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
            {allowDataExport && (
              <div className="shadow-lg">
                <DataExportButton
                  id={widgetDownloadId || ''}
                  type="widget"
                  menuStyle={{ ...menuStyle, fontWeight: 'bold' }}
                />
              </div>
            )}
          </div>
          {/* filter and legend modals */}
          {mapAllowFilter && isFilterModalOpen && (
            <MapFilterModal
              combinedQueryData={combinedQueryData as QueryDataWithAttributes[]}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              menuStyle={menuStyle}
              onCloseModal={closeFilterModal}
              isLegendModalOpen={isLegendModalOpen}
              isFullscreenMap={isFullscreenMap}
              mapNames={mapNames || []}
              handleMapNameFilterChange={handleDataSourceFilterChange}
              selectedDataSources={selectedDataSources}
              isCombinedMap={true}
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
          {mapMarkerIcon.map((iconName, index) => (
            <DashboardIcons key={index} iconName={iconName} color="white" />
          ))}
        </div>
      </div>
      {/* sidebar modal */}
      {mapAllowPopups && selectedMarker.data && isFullscreenMap && (
        <MapModal
          selectedMarker={selectedMarker.data}
          mapWidgetValues={
            mapWidgetValues && mapWidgetValues.length > 0
              ? mapWidgetValues.filter(
                  (widget) => widget.dataSource === selectedMarker.dataSource,
                )
              : undefined
          }
          menuStyle={menuStyle}
          chartStyle={chartStyle}
          ciColors={ciColors}
          onCloseModal={handleOnCloseModal}
        ></MapModal>
      )}
    </div>
  );
}
