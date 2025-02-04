import { LatLngTuple } from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

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
      return 'Temperatur';
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
      return 'Kohlenstoffdioxid';
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
      return 'Bodentemperatur';
    case 'TOTALCONSUMPTIONSUM_GAS':
      return 'Gesamtverbrauch Gas';
    case 'TOTALCONSUMPTIONSUM_WATER':
      return 'Gesamtverbrauch Wasser';
    case 'CO2AVG':
      return 'CO2 Durchschnitt';
    case 'TEMPERATURE':
      return 'Temperatur';
    case 'CURRENTLEVEL':
      return 'Pegelstand';
    case 'CURRENT_LEVEL':
      return 'Pegelstand';
    case 'DEWPOINT':
      return 'Taupunkt';
    case 'RELATIVEHUMIDITY':
      return 'Relative Luftfeuchte';
    case 'SOILTEMPERATUR':
      return 'Boden Temperatur';
    case 'PRECIPITATION':
      return 'Niederschlag';
    case 'RAINRATEINTERVAL':
      return 'Niederschlag';
    case 'IRRADIATION':
      return 'Sonneneinstrahlung';
    case 'PRESSURE':
      return 'Luftdruck';
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
      return 'Luftdruck';
    case 'VEHICLETYPE':
      return 'Fahrzeugtyp';
    case 'STREETNAME':
      return 'Straßenname';
    case 'INTENSITY':
      return 'Auslastung';
    case 'STATUS_ISOCCUPIEDSUM':
      return 'Belegung';

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
