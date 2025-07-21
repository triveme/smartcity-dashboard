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

export function getGermanLabelForSensorAttribute(
  sensorAttribute: string,
): string {
  switch (sensorAttribute) {
    case 'TOTALCONSUMPTION':
      return 'Gesamtverbrauch';
    case 'METERTYPE':
      return 'Messtyp';
    case 'OBSERVATIONDATETIME':
      return 'Messdatum';
    case 'DATEOBSERVED':
      return 'Messdatum';
    case 'ADDRESS':
      return 'Adresse';
    case 'TEMPERATURE':
      return 'Temperatur (°C)';
    case 'STATUS':
      return 'Status';
    case 'STATUS_DE':
      return 'Status';
    case 'NAME':
      return 'Name';
    case 'ALTERNATENAME':
      return 'Alternativer Name';
    case 'DESCRIPTION':
      return 'Beschreibung';
    case 'TREETYPE':
      return 'Baumart';
    case 'WATERLEVEL':
      return 'Pegelstand';
    case 'NOMINALCAPACITY':
      return 'Nennkapazität';
    case 'OPERATOR':
      return 'Betreiber';
    case 'SOCKETTYPE':
      return 'Steckanschlüsse';
    case 'CAPACITY':
      return 'Ladeplätze';
    case 'CURRENTLEVEL':
      return 'Aktueller Pegel';
    case 'REFERENCELEVEL':
      return 'Referenz Pegel';
    case 'MONTHLYCONSUMPTIONSUMGAS':
      return 'Monatlicher Gasverbrauch';
    case 'MONTHLYCONSUMPTIONSUMWATER':
      return 'Monatlicher Wasserverbrauch';
    case 'CO2':
      return 'Kohlenstoffdioxid (ppm)';
    case 'SOILMOISTUREEC':
      return 'Bodenfeuchtigkeit';
    case 'SOILMOISTUREVWC':
      return 'Bodenfeuchtigkeit';
    case 'SOILMOISTUREVWC_TIEFE_1':
      return 'Bodenfeuchtigkeit 10cm';
    case 'SOILMOISTUREVWC_TIEFE_2':
      return 'Bodenfeuchtigkeit 25cm';
    case 'SOILMOISTUREVWC_TIEFE_3':
      return 'Bodenfeuchtigkeit 50cm';
    case 'SOILMOISTUREVWC_TIEFE_4':
      return 'Bodenfeuchtigkeit 75cm';
    case 'SOILMOISTUREVWC_TIEFE_5':
      return 'Bodenfeuchtigkeit 90cm';
    case 'SOILMOISTUREVWC_TIEFE_6':
      return 'Bodenfeuchtigkeit 1m';

    case 'SOILMOISTUREVWC_TIEFE_10CM':
      return 'Bodenfeuchtigkeit 10cm';
    case 'SOILMOISTUREVWC_TIEFE_20CM':
      return 'Bodenfeuchtigkeit 20cm';
    case 'SOILMOISTUREVWC_TIEFE_30CM':
      return 'Bodenfeuchtigkeit 30cm';
    case 'SOILMOISTUREVWC_TIEFE_45CM':
      return 'Bodenfeuchtigkeit 45cm';
    case 'SOILMOISTUREVWC_TIEFE_60CM':
      return 'Bodenfeuchtigkeit 60cm';
    case 'SOILMOISTUREVWC_TIEFE_90CM':
      return 'Bodenfeuchtigkeit 90cm';

    case 'SOILTEMPERATURE':
      return 'Bodentemperatur (°C)';
    case 'TOTALCONSUMPTIONSUM_GAS':
      return 'Gesamtverbrauch Gas';
    case 'TOTALCONSUMPTIONSUM_WATER':
      return 'Gesamtverbrauch Wasser';
    case 'CO2AVG':
      return 'CO2 Durchschnitt';
    case 'TEMPERATURE':
      return 'Temperatur (°C)';
    case 'CURRENTLEVEL':
      return 'Pegelstand';
    case 'CURRENT_LEVEL':
      return 'Pegelstand';
    case 'DEWPOINT':
      return 'Taupunkt';
    case 'RELATIVEHUMIDITY':
      return 'Relative Luftfeuchte (%)';
    case 'SOILTEMPERATUR':
      return 'Bodentemperatur (°C)';
    case 'PRECIPITATION':
      return 'Niederschlag';
    case 'RAINRATEINTERVAL':
      return 'Niederschlag';
    case 'IRRADIATION':
      return 'Sonneneinstrahlung';
    case 'PRESSURE':
      return 'Luftdruck (hPa)';
    case 'SOLARRADIATION':
      return 'Solareinstrahlung';
    case 'LIGHTNING_STRIKE_COUNT':
      return 'Blitzeinschläge';
    case 'LIGHTNING_STRIKE_DISTANCE':
      return 'Blitzentfernung';
    case 'WINDDIRECTION':
      return 'Windrichtung';
    case 'MAXIMUM_WINDSPEED':
      return 'Windböe';
    case 'WINDSPEED':
      return 'Windgeschwindigkeit';
    case 'TOTAL_COVERAGE':
      return 'Bewölkung';
    case 'MAXLVL':
      return 'Höchster Pegelstand';
    case 'MINLVL':
      return 'Niedrigster Pegelstand';
    case 'ATMOSPHERICPRESSURE':
      return 'Luftdruck (hPa)';
    case 'VEHICLETYPE':
      return 'Fahrzeugtyp';
    case 'STREETNAME':
      return 'Straßenname';
    case 'INTENSITY':
      return 'Auslastung';
    case 'STATUS_ISOCCUPIEDSUM':
      return 'Belegung';
    case 'DATUM':
      return 'Letzte Aktualisierung';
    case 'PEGELSTAND':
      return 'Pegelstand (cm)';
    case 'ANZAHL_GESAMT':
      return 'Gesamte Anzahl';
    case 'ANZAHL_FREI':
      return 'Anzahl frei';
    case 'GESAMT_24H':
      return 'Gesamt (letzte 24 Stunden)';
    case 'GESAMT_1H':
      return 'Gesamt (letzte Stunde)';

    default:
      return sensorAttribute;
  }
}

export function getGermanVehicleType(vehicleType: string): string {
  switch (vehicleType) {
    case 'CAR':
      return 'PKW';
    case 'BIKE':
      return 'Fahrrad';
    case 'BIKECYCLE':
      return 'Fahrrad';
    case 'BICYCLE':
      return 'Fahrrad';
    case 'SCOOTER':
      return 'Roller';
    case 'MOTORBIKE':
      return 'Motorrad';
    case 'MOTORCYCLE':
      return 'Motorrad';
    case 'ELECTRIC_CAR':
      return 'Elektroauto';
    case 'ELECTRIC_BIKE':
      return 'Elektrofahrrad';
    case 'ELECTRIC_SCOOTER':
      return 'Elektroroller';
    case 'ELECTRIC_MOTORBIKE':
      return 'Elektromotorrad';
    case 'BUS':
      return 'Bus';
    case 'TRUCK':
      return 'LKW';
    case 'PASSANT':
      return 'Person';
    default:
      return 'Sonstige';
  }
}

export function getColorForValue(
  value: number,
  staticValues: number[],
  staticValuesColors: string[],
): string {
  for (let i = 0; i < staticValues.length; i++) {
    if (value <= staticValues[i]) {
      return staticValuesColors[i];
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
          ${Array.isArray(iconSvgMarkup) ? iconSvgMarkup[iconIndex] || '' : ''}
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

export function getFormattedDate(value: string): string {
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
}
