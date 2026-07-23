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

const WORKBOOK_SENSOR_ATTRIBUTE_LABELS: Record<string, string> = {
  ADDRESSREGION: 'Region',
  ADRESSLOCALITY: 'Ort',
  ALERTDESCRIPTION: 'Warntext',
  ALERTSOURCE: 'Warnquelle',
  ALL_GATEWAYS: 'Gateways',
  AVAILABLESPOTNUMBER: 'Freie Pl\u00e4tze',
  AVG_CO2_MONTHLY: 'CO2 Durchschnitt Monat',
  AVG_CO2_PREV_DAY: 'CO2 Durchschnitt Vortag',
  AVG_OCCUPIED_HOURS_30D: 'Parkdauer Durchschnitt',
  AVG_OCCUPIED_HOURS_ALL_30D: 'Parkdauer Durchschnitt in Stunden',
  AVG_OCCUPIED_MIN_DAILY: 'Parkdauer Durchschnitt t\u00e4glich',
  AVG_OCCUPIED_MIN_WEEKLY: 'Parkdauer Durchschnitt w\u00f6chentlich',
  AVG_OCCUPIED_PERCENT_ALL_30D: 'Parkdauer Durchschnitt in %',
  AVG_OCCUPIED_PERCENT_DAILY: 'Parkdauer Durchschnitt t\u00e4glich in Prozent',
  AVG_OCCUPIED_PERCENT_WEEKLY:
    'Parkdauer Durchschnitt w\u00f6chentlich in Prozent',
  AVG_TEMP_DEW_DIFF_MONTHLY: 'Taupunktdiff. Durchschnitt Monat',
  AVG_TEMP_DEW_DIFF_PREV_DAY: 'Taupunktdiff. Durchschnitt Vortag',
  AVG_TEMP_MONTHLY: 'Temperatur Durchschnitt Monat',
  AVG_TEMP_PREV_DAY: 'Temperatur Durchschnitt Vortag',
  BATTERY: 'Batterie',
  BATTERYSTATUS: 'Batteriestatus',
  CAREUNIT: 'Pflegestatus',
  CURRENTLEVELDELTA: 'Pegelstand',
  DATA: 'Daten',
  DATEFELLED: 'F\u00e4lldatum',
  DATEISSUED: 'Ausgabedatum',
  DAYS: 'Tage',
  DETAILURL: 'Details',
  DURATIONTEXT: 'Dauer Textformat',
  EAST_WINDSPEED: 'Windgeschwindigkeit Ost',
  END_DATE: 'Ende',
  FREE_SLOTS: 'Freie Pl\u00e4tze',
  GATEWAY_ID: 'Gateway ID',
  HOTTEST_DAY: 'Hei\u00dfster Tag',
  HOUR: 'Stunde',
  INCLINATION_DEGREE: 'Neigung',
  INSTRUCTION: 'Handlungsempfehlung',
  LIGHTNING_AVERAGE_DISTANCE: 'Blitzdistanz',
  LIGHTNING_STRIKE_COUNTER: 'Blitzanzahl',
  LIGHTNING_STRIKE_DATE: 'letzter Blitzeinschlag',
  LINPERCENTVALUE: 'F\u00fcllstand',
  LOCATION: 'Ort',
  MAX_CO2_MONTHLY: 'CO2 max. Monat',
  MAX_CO2_PREV_DAY: 'CO2 max. Vortag',
  MAX_PRECIPITATION: 'max. Niederschlag',
  MAX_TEMP_DEW_DIFF_MONTHLY: 'Taupunktdiff. max. Monat',
  MAX_TEMP_DEW_DIFF_PREV_DAY: 'Taupunktdiff. max. Vortag',
  MAX_TEMP_MONTHLY: 'Temperatur max. Monat',
  MAX_TEMP_PREV_DAY: 'Temperatur max. Vortag',
  MAXCURRENTLEVEL: 'max. Wasserstand',
  MAXDATEOBSERVED: 'max. Wasserstand Datum',
  MAXLVL_DATE: 'max. Pegelstand Datum',
  MEASUREDDISTANCE: 'Abstand gemessen',
  MIN_CO2_MONTHLY: 'CO2 min. Monat',
  MIN_CO2_PREV_DAY: 'CO2 min. Vortag',
  MIN_TEMP_DEW_DIFF_MONTHLY: 'Taupunktdiff. min. Monat',
  MIN_TEMP_DEW_DIFF_PREV_DAY: 'Taupunktdiff. min. Vortag',
  MIN_TEMP_MONTHLY: 'Temperatur min. Monat',
  MIN_TEMP_PREV_DAY: 'Temperatur min. Vortag',
  MINCURRENTLEVEL: 'min. Wasserstand',
  MINDATEOBSERVED: 'min. Wasserstand Datum',
  MINLVL_DATE: 'min. Pegelstand Datum',
  NORTH_WINDSPEED: 'Windgeschwindigkeit Nord',
  NUM_DAYS: 'Anzahl Tage',
  OCCUPIED_SECONDS: 'Parkdauer Sek.',
  OCCUPIED_SLOTS: 'Belegte Pl\u00e4tze',
  PERCENTVALUE: 'Messwert Prozent',
  PICTURE: 'Bild',
  RAIN_VALUE: 'Regenmenge',
  RAINDURATION_MIN: 'Regendauer',
  RAINRATE10MIN: 'Regenmenge (10 min)',
  REFPARKINGSITE: 'Parkplatz',
  RESULT: 'Ergebnis',
  RSSI: 'Signal RSSi',
  SCALEDVALUE: 'Messwert',
  SEVERITY: 'Stufe',
  SNR: 'Signal SNR',
  SOILMOISTUREVWC_10CM: 'Bodenfeuchte 10cm',
  SOILMOISTUREVWC_20CM: 'Bodenfeuchte 20cm',
  SOILMOISTUREVWC_30CM: 'Bodenfeuchte 30cm',
  SOILMOISTUREVWC_45CM: 'Bodenfeuchte 45cm',
  SOILMOISTUREVWC_60CM: 'Bodenfeuchte 60cm',
  SOILMOISTUREVWC_90CM: 'Bodenfeuchte 90cm',
  START_DATE: 'Start',
  STREETADDRESS: 'Stra\u00dfe',
  SUBCATEGORY: 'Unterkategorie',
  TEXT: 'Text',
  TEXT_COUNTER: 'Anzahl Textformat',
  TEXT_YEARLY_MAX: 'Text j\u00e4hrlich',
  TREEHEIGHT: 'H\u00f6he',
  TREETYPEBOTANICAL: 'Baumart botanisch',
  UNKNOWN_SLOTS: 'Unbekannte Pl\u00e4tze',
  VALIDFROM: 'g\u00fcltig ab',
  VALIDTO: 'g\u00fcltig bis',
  WATERLEAK1: 'Leckage Sensor 1',
  WATERLEAK2: 'Leckage Sensor 2',
  WATERLEAKOVERALL: 'Leckagestatus',
  WATERREQUIREMET: 'Wasserbedarf',
  WEEKDAY: 'Wochentag',
  YEARPLANTED: 'Pflanzjahr',
};

const LEGACY_SENSOR_ATTRIBUTE_LABELS: Record<string, string> = {
  CONTACTPOINT: 'Kontaktinformation',
  CATEGORY: 'Kategorie',
  TITLE: 'Title',
  TOTALCONSUMPTION: 'Gesamtverbrauch',
  METERTYPE: 'Messtyp',
  OBSERVATIONDATETIME: 'Messdatum',
  DATEOBSERVED: 'Messdatum',
  ADDRESS: 'Adresse',
  TEMPERATURE: 'Temperatur (°C)',
  STATUS: 'Status',
  STATUS_DE: 'Status',
  NAME: 'Name',
  ALTERNATENAME: 'Alternativer Name',
  DESCRIPTION: 'Beschreibung',
  TREETYPE: 'Baumart',
  WATERLEVEL: 'Pegelstand',
  NOMINALCAPACITY: 'Nennkapazität',
  OPERATOR: 'Betreiber',
  SOCKETTYPE: 'Steckanschlüsse',
  CAPACITY: 'Ladeplätze',
  CURRENTLEVEL: 'Aktueller Pegel',
  REFERENCELEVEL: 'Referenz Pegel',
  MONTHLYCONSUMPTIONSUMGAS: 'Monatlicher Gasverbrauch',
  MONTHLYCONSUMPTIONSUMWATER: 'Monatlicher Wasserverbrauch',
  CO2: 'Kohlenstoffdioxid (ppm)',
  SOILMOISTUREEC: 'Bodenfeuchtigkeit',
  SOILMOISTUREVWC: 'Bodenfeuchtigkeit',
  SOILMOISTUREVWC_TIEFE_1: 'Bodenfeuchtigkeit 10cm',
  SOILMOISTUREVWC_TIEFE_2: 'Bodenfeuchtigkeit 25cm',
  SOILMOISTUREVWC_TIEFE_3: 'Bodenfeuchtigkeit 50cm',
  SOILMOISTUREVWC_TIEFE_4: 'Bodenfeuchtigkeit 75cm',
  SOILMOISTUREVWC_TIEFE_5: 'Bodenfeuchtigkeit 90cm',
  SOILMOISTUREVWC_TIEFE_6: 'Bodenfeuchtigkeit 1m',
  SOILMOISTUREVWC_TIEFE_10CM: 'Bodenfeuchtigkeit 10cm',
  SOILMOISTUREVWC_TIEFE_20CM: 'Bodenfeuchtigkeit 20cm',
  SOILMOISTUREVWC_TIEFE_30CM: 'Bodenfeuchtigkeit 30cm',
  SOILMOISTUREVWC_TIEFE_45CM: 'Bodenfeuchtigkeit 45cm',
  SOILMOISTUREVWC_TIEFE_60CM: 'Bodenfeuchtigkeit 60cm',
  SOILMOISTUREVWC_TIEFE_90CM: 'Bodenfeuchtigkeit 90cm',
  SOILTEMPERATURE: 'Bodentemperatur (°C)',
  TOTALCONSUMPTIONSUM_GAS: 'Gesamtverbrauch Gas',
  TOTALCONSUMPTIONSUM_WATER: 'Gesamtverbrauch Wasser',
  CO2AVG: 'CO2 Durchschnitt',
  CURRENT_LEVEL: 'Pegelstand',
  DEWPOINT: 'Taupunkt',
  RELATIVEHUMIDITY: 'Relative Luftfeuchte (%)',
  SOILTEMPERATUR: 'Bodentemperatur (°C)',
  PRECIPITATION: 'Niederschlag',
  RAINRATEINTERVAL: 'Niederschlag',
  IRRADIATION: 'Sonneneinstrahlung',
  PRESSURE: 'Luftdruck (hPa)',
  SOLARRADIATION: 'Solareinstrahlung',
  LIGHTNING_STRIKE_COUNT: 'Blitzeinschläge',
  LIGHTNING_STRIKE_DISTANCE: 'Blitzentfernung',
  WINDDIRECTION: 'Windrichtung',
  MAXIMUM_WINDSPEED: 'Windböe',
  WINDSPEED: 'Windgeschwindigkeit',
  TOTAL_COVERAGE: 'Bewölkung',
  MAXLVL: 'Höchster Pegelstand',
  MINLVL: 'Niedrigster Pegelstand',
  ATMOSPHERICPRESSURE: 'Luftdruck (hPa)',
  VEHICLETYPE: 'Fahrzeugtyp',
  STREETNAME: 'Straßenname',
  INTENSITY: 'Auslastung',
  STATUS_ISOCCUPIEDSUM: 'Belegung',
  DATUM: 'Letzte Aktualisierung',
  PEGELSTAND: 'Pegelstand (cm)',
  ANZAHL_GESAMT: 'Gesamte Anzahl',
  ANZAHL_FREI: 'Anzahl frei',
  GESAMT_24H: 'Gesamt (letzte 24 Stunden)',
  GESAMT_1H: 'Gesamt (letzte Stunde)',
  ARIQUALITYINDEX: 'Luftqualitätsindex',
  TOTALACTIVEPOWER: 'Gesamte Wirkleistung',
  TOTALACTIVEENERGYIMPORT: 'Gesamter Energie-Import',
};

const SENSOR_ATTRIBUTE_LABELS: Record<string, string> = {
  ...WORKBOOK_SENSOR_ATTRIBUTE_LABELS,
  ...LEGACY_SENSOR_ATTRIBUTE_LABELS,
};

function normalizeSensorAttributeLabelKey(sensorAttribute: string): string {
  return sensorAttribute.trim().toUpperCase();
}

export function getGermanLabelForSensorAttribute(
  sensorAttribute: string,
): string {
  return (
    SENSOR_ATTRIBUTE_LABELS[
      normalizeSensorAttributeLabelKey(sensorAttribute)
    ] ?? sensorAttribute
  );
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
