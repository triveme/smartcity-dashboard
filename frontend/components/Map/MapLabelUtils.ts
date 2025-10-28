import { convertToLocaleNumber, roundToDecimal } from '@/utils/mathHelper';

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
export function getGermanLabelForSensorAttribute(
  sensorAttribute: string,
): string {
  switch (sensorAttribute) {
    case 'CONTACTPOINT':
      return 'Kontaktinformation';
    case 'CATEGORY':
      return 'Kategorie';
    case 'TITLE':
      return 'Title';
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
    case 'ARIQUALITYINDEX':
      return 'Luftqualitätsindex';

    default:
      return sensorAttribute;
  }
}

export function getValueString(
  tempValue: { value?: unknown; type?: string },
  decimalSeparator: string = '.',
): string {
  if (tempValue.value === null || tempValue.value === undefined) {
    return 'Keine Daten';
  }
  if (tempValue.type === 'Number') {
    return convertToLocaleNumber(
      roundToDecimal(Number(tempValue.value)).toString(),
      decimalSeparator,
    );
  }
  if (Array.isArray(tempValue.value)) {
    return tempValue.value.join(', ');
  }
  return String(tempValue.value);
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
