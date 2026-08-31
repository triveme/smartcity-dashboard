import { LatLngTuple } from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { localSvgIconsList } from '@/ui/Icons/LocalSvgIcons';
import { MapDateColorRule } from '@/types';
import { getMapDateThreshold } from '@/utils/mapDateColorRules';

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

function unwrapComparableValue(input: unknown): unknown {
  if (Array.isArray(input)) {
    const firstDefined = input.find((item) => item != null);
    return unwrapComparableValue(firstDefined);
  }

  if (input && typeof input === 'object') {
    const candidate = input as Record<string, unknown>;
    if ('value' in candidate) {
      return unwrapComparableValue(candidate.value);
    }
    if ('@value' in candidate) {
      return unwrapComparableValue(candidate['@value']);
    }
  }

  return input;
}

function toComparableNumber(input: unknown): number | null {
  const unwrapped = unwrapComparableValue(input);
  if (typeof unwrapped === 'number') {
    return Number.isFinite(unwrapped) ? unwrapped : null;
  }

  if (typeof unwrapped !== 'string') {
    return null;
  }

  const normalized = unwrapped.replace(',', '.').trim();
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toComparableText(input: unknown): string {
  const unwrapped = unwrapComparableValue(input);
  if (unwrapped == null) {
    return '';
  }

  return String(unwrapped)
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .toLowerCase();
}

export function getIconForValue(
  value: number | string,
  staticValues: (string | number)[],
  staticValuesLogos: string[],
  fallback: string,
): string {
  for (let i = 0; i < staticValues.length; i++) {
    const comparableStaticNumber = toComparableNumber(staticValues[i]);
    const comparableValueNumber = toComparableNumber(value);

    if (
      comparableStaticNumber !== null &&
      comparableValueNumber !== null &&
      comparableValueNumber <= comparableStaticNumber
    ) {
      return staticValuesLogos[i];
    }

    const comparableStaticText = toComparableText(staticValues[i]);
    const comparableValueText = toComparableText(value);

    if (
      comparableStaticText.length > 0 &&
      comparableStaticText === comparableValueText
    ) {
      return staticValuesLogos[i];
    }
  }
  return fallback;
}

export function getColorForValue(
  value: number | string | string[],
  staticValues: (string | number)[],
  staticValuesColors: string[],
  fallback?: string,
): string {
  for (let i = 0; i < staticValues.length; i++) {
    const comparableStaticNumber = toComparableNumber(staticValues[i]);
    const comparableValueNumber = toComparableNumber(value);

    if (
      comparableStaticNumber !== null &&
      comparableValueNumber !== null &&
      comparableValueNumber <= comparableStaticNumber
    ) {
      return staticValuesColors[i];
    }

    const comparableStaticText = toComparableText(staticValues[i]);
    const comparableValueText = toComparableText(value);

    if (
      comparableStaticText.length > 0 &&
      comparableStaticText === comparableValueText
    ) {
      return staticValuesColors[i];
    }
  }
  return fallback || staticValuesColors[staticValuesColors.length - 1];
}

function toComparableDate(input: unknown): Date | null {
  const unwrapped = unwrapComparableValue(input);
  if (unwrapped instanceof Date && !Number.isNaN(unwrapped.getTime())) {
    return unwrapped;
  }

  if (typeof unwrapped !== 'string' && typeof unwrapped !== 'number') {
    return null;
  }

  const date = new Date(unwrapped);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getColorForDateValue(
  value: unknown,
  rules: MapDateColorRule[],
  fallback: string,
  now: Date = new Date(),
): string {
  const sensorDate = toComparableDate(value);
  if (!sensorDate) {
    return fallback;
  }

  for (const rule of rules) {
    const threshold = getMapDateThreshold(rule, now);
    if (sensorDate < threshold) {
      return rule.color;
    }
  }

  return fallback;
}

export function getIconForDateValue(
  value: unknown,
  rules: MapDateColorRule[],
  fallback: string,
  now: Date = new Date(),
): string {
  const sensorDate = toComparableDate(value);
  if (!sensorDate) {
    return fallback;
  }

  for (const rule of rules) {
    const threshold = getMapDateThreshold(rule, now);
    if (sensorDate < threshold) {
      return rule.icon || fallback;
    }
  }

  return fallback;
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
  dataSourceIndex?: number,
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
    const className =
      typeof dataSourceIndex === 'number'
        ? `combined-marker-icon ds-${dataSourceIndex}`
        : 'combined-marker-icon';

    const options: L.IconOptions & { renderedMarkerColor: string } = {
      iconUrl: `data:image/svg+xml,${urlEncodedSvg}`,
      iconSize: [50, 50],
      iconAnchor: [30, 60],
      popupAnchor: [0, -60],
      shadowSize: [41, 41],
      className,
      renderedMarkerColor: color,
    };

    return L.icon(options);
  } else {
    const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="${color}">
    <path d="M15 2C10.58 2 7 5.58 7 10c0 6.627 8 16 8 16s8-9.373 8-16c0-4.42-3.58-8-8-8z"/>
    <g transform="translate(${translateValue},6) scale(0.4)">
    ${Array.isArray(iconSvgMarkup) ? iconSvgMarkup[iconIndex] : iconSvgMarkup}
    </g>
    </svg>
    `;
    const options: L.DivIconOptions & { renderedMarkerColor: string } = {
      html: `<div class="custom-icon-wrapper">${iconSvg}</div>`,
      className: 'custom-marker-icon',
      iconSize: L.point(60, 60),
      iconAnchor: [30, 60],
      popupAnchor: [0, -60],
      renderedMarkerColor: color,
    };

    return L.divIcon(options);
  }
}

export function createSearchResultIcon(): L.DivIcon {
  const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="#EA4335">
      <path d="M15 2C10.58 2 7 5.58 7 10c0 6.627 8 16 8 16s8-9.373 8-16c0-4.42-3.58-8-8-8z"/>
    </svg>
  `;

  return L.divIcon({
    html: `<div class="custom-icon-wrapper">${iconSvg}</div>`,
    className: 'custom-marker-icon search-result-marker-icon',
    iconSize: L.point(42, 42),
    iconAnchor: [21, 42],
    popupAnchor: [0, -38],
  });
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
  let dominantRenderedMarkerColor: string | null = null;

  const childMarkers = cluster.getAllChildMarkers() as L.Marker[];
  const renderedColorCounts: Record<string, number> = {};

  childMarkers.forEach((m: L.Marker) => {
    const icon = m?.options?.icon;
    const renderedMarkerColor = (
      icon?.options as { renderedMarkerColor?: string } | undefined
    )?.renderedMarkerColor;

    if (renderedMarkerColor) {
      renderedColorCounts[renderedMarkerColor] =
        (renderedColorCounts[renderedMarkerColor] || 0) + 1;
    }
  });

  let maxRenderedColorCount = -1;
  for (const [color, count] of Object.entries(renderedColorCounts)) {
    if (count > maxRenderedColorCount) {
      maxRenderedColorCount = count;
      dominantRenderedMarkerColor = color;
    }
  }

  if (isCombinedMap) {
    // For combined maps, derive the cluster color from the dominant
    // data source among all child markers (the one with most markers).
    const counts: Record<number, number> = {};

    childMarkers.forEach((m: L.Marker) => {
      const icon = m?.options?.icon;
      const className: string = icon?.options?.className ?? '';
      const match = className.match(/ds-(\d+)/);
      if (match) {
        const idx = parseInt(match[1], 10);
        if (!Number.isNaN(idx)) {
          counts[idx] = (counts[idx] || 0) + 1;
        }
      }
    });

    let dominantIndex = 0;
    let maxCount = -1;
    for (const [idxStr, count] of Object.entries(counts)) {
      const idx = parseInt(idxStr, 10);
      if (!Number.isNaN(idx) && count > maxCount) {
        maxCount = count;
        dominantIndex = idx;
      }
    }

    if (dominantRenderedMarkerColor) {
      markerColor = dominantRenderedMarkerColor;
    } else if (Array.isArray(mapMarkerColor) && mapMarkerColor.length > 0) {
      markerColor =
        mapMarkerColor[dominantIndex] ?? mapMarkerColor[0] ?? markerColor;
    }

    if (Array.isArray(mapMarkerIconColor) && mapMarkerIconColor.length > 0) {
      markerIconColor =
        mapMarkerIconColor[dominantIndex] ??
        mapMarkerIconColor[0] ??
        markerIconColor;
    }
  } else {
    markerColor = dominantRenderedMarkerColor
      ? dominantRenderedMarkerColor
      : typeof mapMarkerColor === 'string'
        ? mapMarkerColor
        : '#257DC9';
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
      html: `<div 
        role="button" 
        aria-label="Cluster with ${count} markers" 
        title="Cluster with ${count} markers"
        style="background-image: url(data:image/svg+xml,${urlEncodedSvg}); background-size: cover; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;"
      ></div>`,
      className: 'custom-cluster-icon',
      iconSize: L.point(80, 80),
      iconAnchor: [20, 40],
    });
  } else {
    return L.divIcon({
      html: `<div 
        role="button" 
        aria-label="Cluster with ${count} markers" 
        title="Cluster with ${count} markers"
        class="custom-icon-wrapper"
      >${iconSvg}</div>`,
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
