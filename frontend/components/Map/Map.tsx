/* eslint-disable @typescript-eslint/no-explicit-any */
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
  // LayerGroup,
  WMSTileLayer,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';

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
import { env } from 'next-runtime-env';
import { DEFAULT_MARKERS } from '@/utils/objectHelper';
import MapFilterModal from './MapFilterModal';
import MapLegendModal from './MapLegendModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnglesRight } from '@fortawesome/free-solid-svg-icons';
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
  mapMaxZoom: number;
  mapMinZoom: number;
  mapAllowPopups: boolean;
  mapStandardZoom: number;
  mapAllowZoom: boolean;
  mapAllowScroll: boolean;
  mapAllowFilter?: boolean;
  mapFilterAttribute?: string;
  mapAllowLegend?: boolean;
  mapLegendValues?: MapModalLegend[];
  mapLegendDisclaimer?: string[];
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
  combinedQueryData?: QueryDataWithAttributes[];
  mapAttributeForValueBased: string;
  mapFormSizeFactor: number;
  mapIsFormColorValueBased: boolean;
  mapIsIconColorValueBased: boolean;
  staticValues: number[];
  staticValuesColors: string[];
  mapWmsUrl: string;
  mapWmsLayer: string;
  ciColors?: CorporateInfo;
  allowDataExport?: boolean;
  widgetDownloadId?: string;
};

export type Marker = {
  position: [number, number];
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any;
  dataSource?: number;
  color: string;
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
    combinedQueryData,
    mapAttributeForValueBased,
    mapFormSizeFactor,
    mapIsFormColorValueBased,
    mapIsIconColorValueBased,
    staticValues,
    staticValuesColors,
    mapWmsUrl,
    mapWmsLayer,
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

  useEffect(() => {
    const handleResize = (): void => setIsMobileView(window.innerWidth <= 1024);

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getColorForMarker = (marker: Marker, markerValue: any): string => {
    // Use form-based value coloring if the flag is set
    if (mapIsFormColorValueBased) {
      return getColorForValue(markerValue);
    }

    // Use icon-based value coloring if the flag is set
    if (mapIsIconColorValueBased) {
      return getColorForValue(markerValue);
    }

    // Default to static color if value-based coloring isn't enabled
    return mapShapeColor || '#000000';
  };

  const markerPositions: Marker[] = (data || []).map((mapObject, index) => {
    // Extract the dynamic value for the marker
    const markerValue = mapObject[mapAttributeForValueBased]?.value;

    return {
      position: mapObject.position.coordinates ?? [52.520008, 13.404954], // Coordinates
      title: mapObject.name ? mapObject.name.value : `Sensor ${index + 1}`, // Sensor name
      details: mapObject, // Full sensor details object
      dataSource: mapObject.dataSource, // Optional dataSource attribute
      color: getColorForMarker(mapObject, markerValue), // Determine the color based on the value
    };
  });

  const getFilteredMarkers = (): Marker[] => {
    return selectedFilters && selectedFilters.length > 0 && mapFilterAttribute
      ? markerPositions.filter((marker) => {
          const attributeDetails = marker.details[mapFilterAttribute];
          if (!attributeDetails) return false;

          const propertyValueRaw = attributeDetails.value;
          // convert value "0.00" to 0 of type number
          const propertyValue =
            parseFloat(propertyValueRaw) === 0 ? 0 : propertyValueRaw;
          return selectedFilters.includes(propertyValue);
        })
      : markerPositions;
  };

  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false); // After the first load, set this to false to prevent refitting bounds on updates
    }
  }, [initialLoad]);

  function getColorForValue(value: number): string {
    for (let i = 0; i < staticValues.length; i++) {
      if (value <= staticValues[i]) {
        return staticValuesColors[i];
      }
    }
    return staticValuesColors[staticValuesColors.length - 1];
  }

  const getCustomTranslateForSvg = (): number => {
    if (!mapMarkerIcon) return 10.2;

    // Check if the icon is a Font Awesome icon
    const isFontAwesomeIcon = !localSvgIconsList.some(
      (icon) => icon.name === mapMarkerIcon,
    );

    if (isFontAwesomeIcon) return 10.2;

    // Custom translate values for specific svg icons
    const nameOfIconsToCustom = [
      { name: 'SoilMoisture', value: 10.5 },
      { name: 'WaterLevelHigh', value: 11.2 },
      { name: 'HumidityNormal', value: 11.5 },
      { name: 'HumidityMedium', value: 11.5 },
      { name: 'RemoteSoil', value: 11.5 },
      { name: 'HumidityPercentage', value: 11.5 },
      { name: 'Trees', value: 11.5 },
      { name: 'Info', value: 11.5 },
      { name: 'Dry', value: 12 },
      { name: 'Pollen', value: 12 },
    ];

    // Check icons need custom translate values
    const customIcon = nameOfIconsToCustom.find(
      (icon) => icon.name === mapMarkerIcon,
    );

    // Return custom value if found, otherwise default to 11
    return customIcon ? customIcon.value : 11;
  };

  // Modify the createCustomIcon function to use the color based on sensor values
  const createCustomIcon = (color: string): L.DivIcon => {
    const iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="${color}">
        <path d="M15 2C10.58 2 7 5.58 7 10c0 6.627 8 16 8 16s8-9.373 8-16c0-4.42-3.58-8-8-8z"/>
        <g transform="translate(${getCustomTranslateForSvg()},6) scale(0.4)">
          ${iconSvgMarkup}
        </g>
      </svg>
    `;

    return L.divIcon({
      html: `<div class="custom-icon-wrapper">${iconSvg}</div>`,
      className: 'custom-marker-icon',
      iconSize: L.point(60, 60),
      iconAnchor: [30, 60],
      popupAnchor: [0, -60],
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
        <text x="15" y="12" text-anchor="middle" fill="${mapMarkerIconColor}" font-size="${fontSize}" font-family="Arial" dy=".3em">${displayCount}</text>
      </svg>`;

    // const urlEncodedSvg = encodeURIComponent(iconSvg);

    return L.divIcon({
      html: `<div class="custom-icon-wrapper">${iconSvg}</div>`,
      className: 'custom-marker-icon',
      iconSize: L.point(60, 60),
      iconAnchor: [30, 60],
      popupAnchor: [0, -60],
    });
  };

  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/256/{z}/{x}/{y}?access_token=${env(
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

  const renderShape = (
    position: [number, number],
    color: string,
  ): JSX.Element => {
    switch (mapShapeOption) {
      case 'Circle':
        return (
          <Circle
            key={color}
            center={position}
            radius={100 * mapFormSizeFactor}
            color={color}
            fillColor={color}
            fillOpacity={0.1}
          />
        );
      case 'Hexagon':
        return (
          <Polygon
            key={color}
            positions={createHexagonAroundMarker(position, mapFormSizeFactor)}
            color={color}
            fillColor={color}
            fillOpacity={0.1}
          />
        );
      case 'Rectangle':
        return (
          <Rectangle
            key={color}
            bounds={createRectangleAroundMarker(position, mapFormSizeFactor)}
            color={color}
            weight={2}
            fillColor={color}
            fillOpacity={0.1}
          />
        );
      default:
        return (
          <Rectangle
            key={color}
            bounds={createSquareAroundMarker(position, mapFormSizeFactor)}
            color={color}
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
          {mapWmsUrl && mapWmsUrl !== '' ? (
            <WMSTileLayer
              url={mapWmsUrl}
              layers={mapWmsLayer} // Define the specific layer name
              // format="image/png" // You can use other formats like 'image/jpeg'
              transparent={true} // If you need transparency
              version="1.3.0" // Ensure WMS version is set
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
              url={mapboxUrl}
            />
          )}

          <ZoomHandler onZoomChange={setMapZoom} />
          {mapDisplayMode !== tabComponentSubTypeEnum.onlyFormArea && (
            <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon}>
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
                        {Object.entries(marker.details).map(([key, value]) => {
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
                                      tempValue.value.toString().toUpperCase(),
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
                                  Datum:
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
                                  {tempValue.type === 'Number' &&
                                  tempValue.value
                                    ? convertToLocaleNumber(
                                        roundToDecimal(
                                          tempValue.value,
                                        ).toString(),
                                        decimalSeparator,
                                      )
                                    : tempValue.value}
                                </strong>
                              </div>
                            );
                          }

                          return null; // Ignore undefined or other non-relevant fields
                        })}
                      </div>
                    </Popup>
                  ) : null}

                  {mapDisplayMode !== tabComponentSubTypeEnum.onlyPin &&
                    mapZoom > 15 &&
                    (!Array.isArray(marker) || marker.length === 1) &&
                    renderShape(marker.position, marker.color)}
                </Marker>
              ))}
            </MarkerClusterGroup>
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
              isCombinedMap={false}
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
          <DashboardIcons iconName={mapMarkerIcon} color={mapMarkerIconColor} />
        </div>
      </div>
      {/* sidebar modal */}
      {mapAllowPopups && selectedMarker.data && isFullscreenMap && (
        <MapModal
          selectedMarker={selectedMarker.data}
          mapWidgetValues={mapWidgetValues}
          menuStyle={menuStyle}
          chartStyle={chartStyle}
          ciColors={ciColors}
          onCloseModal={handleOnCloseModal}
        ></MapModal>
      )}
    </div>
  );
}
