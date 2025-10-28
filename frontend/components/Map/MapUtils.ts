import { LatLngTuple } from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { localSvgIconsList } from '@/ui/Icons/LocalSvgIcons';

export function createRectangleAroundMarker(
  position: [number, number],
  sizeFactor: number = 1,
): [[number, number], [number, number]] {
  const height = 0.001 * sizeFactor;
  const width = 0.002 * sizeFactor;

  const bounds: [[number, number], [number, number]] = [
    [position[0] - height / 2, position[1] - width / 2],
    [position[0] + height / 2, position[1] + width / 2],
  ];
  return bounds;
}

export function createSquareAroundMarker(
  position: [number, number],
  sizeFactor: number = 1,
): [[number, number], [number, number]] {
  const latDiff = 0.001 * sizeFactor;
  const lngDiff =
    (0.001 * sizeFactor) / Math.cos((position[0] * Math.PI) / 180);
  const bounds: [[number, number], [number, number]] = [
    [position[0] - latDiff / 2, position[1] - lngDiff / 2],
    [position[0] + latDiff / 2, position[1] + lngDiff / 2],
  ];
  return bounds;
}

export function createHexagonAroundMarker(
  position: [number, number],
  sizeFactor: number = 1,
): LatLngTuple[] {
  const angle = Math.PI / 3;
  const size = 0.001 * sizeFactor;

  const latCorrectionFactor = 1 / Math.cos((position[0] * Math.PI) / 180);

  const hexagon: LatLngTuple[] = [];
  for (let i = 0; i < 6; i++) {
    const theta = i * angle;
    const lat = position[0] + size * Math.sin(theta);
    const lng = position[1] + size * Math.cos(theta) * latCorrectionFactor;
    hexagon.push([lat, lng]);
  }

  return hexagon;
}

export const ZoomHandler = ({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}): null => {
  const map = useMap();

  useEffect(() => {
    const handleZoomEnd = (): void => {
      onZoomChange(map.getZoom());
    };

    map.on('zoomend', handleZoomEnd);

    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onZoomChange]);

  return null;
};

export function getIconForValue(
  value: number | string,
  staticValues: (string | number)[],
  staticValuesLogos: string[],
  fallback: string,
): string {
  for (let i = 0; i < staticValues.length; i++) {
    if (typeof staticValues[i] === 'number' && typeof value === 'number') {
      if ((value as number) <= (staticValues[i] as number)) {
        return staticValuesLogos[i];
      }
    } else {
      let valueToCheck = value;
      if (Array.isArray(value)) {
        valueToCheck = value[0];
      }
      if (staticValues[i] === valueToCheck) {
        return staticValuesLogos[i];
      }
    }
  }
  return fallback;
}
export function getColorForValue(
  value: number | string | string[],
  staticValues: (string | number)[],
  staticValuesColors: string[],
): string {
  for (let i = 0; i < staticValues.length; i++) {
    if (typeof staticValues[i] === 'number' && typeof value === 'number') {
      if ((value as number) <= (staticValues[i] as number)) {
        return staticValuesColors[i];
      }
    } else {
      let valueToCheck = value;
      if (Array.isArray(value)) {
        valueToCheck = value[0];
        // if (value.includes(staticValues[i])) {
        //   return staticValuesColors[i];
        // }
      }
      if (staticValues[i] === valueToCheck) {
        return staticValuesColors[i];
      }
    }
  }
  return staticValuesColors[staticValuesColors.length - 1];
}

export function getCustomTranslateForSvg(
  iconName: string,
  isCombinedMap: boolean,
): number {
  if (!iconName) return isCombinedMap ? 10.5 : 10.2;

  const isFontAwesomeIcon = !localSvgIconsList.some(
    (icon) => icon.name === iconName,
  );

  if (isFontAwesomeIcon) return isCombinedMap ? 9.5 : 10.2;

  const nameOfIconsToCustom = [
    { name: 'SoilMoisture', value: isCombinedMap ? 10 : 10.5 },
    { name: 'Mobility', value: 11 },
    { name: 'Info', value: 11.5 },
    { name: 'Dry', value: isCombinedMap ? 11.5 : 12 },
    { name: 'Trees', value: 11.5 },
    { name: 'Pollen', value: isCombinedMap ? 11.5 : 12 },
    { name: 'RemoteSoil', value: 11.5 },
    { name: 'WaterLevelHigh', value: 11.2 },
    { name: 'HumidityNormal', value: 11.5 },
    { name: 'HumidityMedium', value: 11.5 },
    { name: 'HumidityPercentage', value: 11.5 },
  ];

  const customIcon = nameOfIconsToCustom.find((icon) => icon.name === iconName);

  return customIcon ? customIcon.value : 11;
}

export function createCustomIcon(
  color: string,
  iconSvgMarkup: string | string[],
  iconIndex: number,
  isCombinedMap: boolean,
  iconName?: string,
): L.Icon | L.DivIcon {
  const translateValue = getCustomTranslateForSvg(
    iconName || '',
    isCombinedMap,
  );

  if (isCombinedMap) {
    const iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="${color}">
        <path d="M15 2C10.58 2 7 5.58 7 10c0 6.627 8 16 8 16s8-9.373 8-16c0-4.42-3.58-8-8-8z" />
        <g transform="translate(${translateValue},5) scale(0.35)">
          ${Array.isArray(iconSvgMarkup) ? iconSvgMarkup[iconIndex] : ''}
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
  } else {
    const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="${color}">
    <path d="M15 2C10.58 2 7 5.58 7 10c0 6.627 8 16 8 16s8-9.373 8-16c0-4.42-3.58-8-8-8z"/>
    <g transform="translate(${translateValue},6) scale(0.4)">
    ${Array.isArray(iconSvgMarkup) ? iconSvgMarkup[iconIndex] : iconSvgMarkup}
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
  }
}

export function createClusterCustomIcon(
  cluster: L.MarkerCluster,
  mapMarkerColor: string | string[],
  mapMarkerIconColor: string | string[],
  isCombinedMap: boolean,
): L.DivIcon {
  const count = cluster.getChildCount();
  let displayCount = count.toString();
  let fontSize = '12px';
  if (count > 99) {
    fontSize = '8px';
  }
  if (count > 1000 && count <= 9999) {
    displayCount = (count / 1000).toFixed(0) + 'K';
  }

  let markerColor = '#257DC9';
  let markerIconColor = '#FFF';

  if (isCombinedMap) {
    markerColor = Array.isArray(mapMarkerColor)
      ? mapMarkerColor[0] || '#257DC9'
      : '#257DC9';
    markerIconColor = Array.isArray(mapMarkerIconColor)
      ? mapMarkerIconColor[0] || '#FFF'
      : '#FFF';
  } else {
    markerColor =
      typeof mapMarkerColor === 'string' ? mapMarkerColor : '#257DC9';
    markerIconColor =
      typeof mapMarkerIconColor === 'string' ? mapMarkerIconColor : '#FFF';
  }

  const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="${markerColor}">
      <path d="M15 2C10.58 2 7 5.58 7 10c0 6.627 8 16 8 16s8-9.373 8-16c0-4.42-3.58-8-8-8z"/>
      <text x="15" y="12" text-anchor="middle" fill="${markerIconColor}" font-size="${fontSize}" font-family="Arial" dy=".3em">${displayCount}</text>
    </svg>`;

  if (isCombinedMap) {
    const urlEncodedSvg = encodeURIComponent(iconSvg);

    return L.divIcon({
      html: `<div style="background-image: url(data:image/svg+xml,${urlEncodedSvg}); background-size: cover; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;"></div>`,
      className: 'custom-cluster-icon',
      iconSize: L.point(80, 80),
      iconAnchor: [20, 40],
    });
  } else {
    return L.divIcon({
      html: `<div class="custom-icon-wrapper">${iconSvg}</div>`,
      className: 'custom-marker-icon',
      iconSize: L.point(60, 60),
      iconAnchor: [30, 60],
      popupAnchor: [0, -60],
    });
  }
}

export function findValidWmsConfig(
  mapWmsUrl?: string,
  mapWmsLayer?: string,
  mapCombinedWmsUrl?: string,
  mapCombinedWmsLayer?: string,
  isCombinedMap: boolean = false,
): { url: string; layer: string } | null {
  if (isCombinedMap) {
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
  } else {
    if (!mapWmsUrl || mapWmsUrl === '') {
      return null;
    }
    return {
      url: mapWmsUrl,
      layer: mapWmsLayer || '',
    };
  }
}
