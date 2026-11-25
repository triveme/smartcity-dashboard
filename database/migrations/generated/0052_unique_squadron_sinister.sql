CREATE TABLE IF NOT EXISTS "value-translation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text,
	"raw_value" text,
	"text" text,
	"tenant_id" text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "value_translation_raw_value_tenant_unique" ON "value-translation" ("raw_value","tenant_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "value-translation" ADD CONSTRAINT "value-translation_tenant_id_tenant_abbreviation_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
INSERT INTO "value-translation"
    ("category", "raw_value", "text", "tenant_id")
  SELECT
    source.category,
    source.raw_value,
    source.label,
    NULL
  FROM (
    VALUES
      ('sensor_attribute', 'ADDRESS', 'Adresse'),
      ('sensor_attribute', 'ADDRESSREGION', 'Region'),
      ('sensor_attribute', 'ADRESSLOCALITY', 'Ort'),
      ('sensor_attribute', 'ALERTDESCRIPTION', 'Warntext'),
      ('sensor_attribute', 'ALERTSOURCE', 'Warnquelle'),
      ('sensor_attribute', 'ALL_GATEWAYS', 'Gateways'),
      ('sensor_attribute', 'ALTERNATENAME', 'Alternativer Name'),
      ('sensor_attribute', 'ANZAHL_FREI', 'Anzahl frei'),
      ('sensor_attribute', 'ANZAHL_GESAMT', 'Gesamte Anzahl'),
      ('sensor_attribute', 'ANZAHL_LKW', 'LKW'),
      ('sensor_attribute', 'ANZAHL_MOTORRAD', 'Motorrad'),
      ('sensor_attribute', 'ANZAHL_PERSON', 'Person'),
      ('sensor_attribute', 'ANZAHL_PKW', 'PKW'),
      ('sensor_attribute', 'ANZAHL_SONSTIGE', 'Sonstige'),
      ('sensor_attribute', 'ARIQUALITYINDEX', 'Luftqualitätsindex'),
      ('sensor_attribute', 'ATMOSPHERICPRESSURE', 'Luftdruck'),
      ('sensor_attribute', 'ATMOSPHERICPRESSUREAVG', 'Luftdruck'),
      ('vehicle_type', 'AUTO', 'PKW'),
      ('sensor_attribute', 'AVAILABLESPOTNUMBER', 'Freie Plätze'),

      ('sensor_attribute', 'AVG_CO2_MONTHLY', 'CO2 Durchschnitt Monat'),
      ('sensor_attribute', 'AVG_CO2_PREV_DAY', 'CO2 Durchschnitt Vortag'),
      ('sensor_attribute', 'AVG_OCCUPIED_HOURS_30D', 'Parkdauer Durchschnitt'),
      ('sensor_attribute', 'AVG_OCCUPIED_HOURS_ALL_30D', 'Parkdauer Durchschnitt in Stunden'),
      ('sensor_attribute', 'AVG_OCCUPIED_MIN_DAILY', 'Parkdauer Durchschnitt täglich'),
      ('sensor_attribute', 'AVG_OCCUPIED_MIN_WEEKLY', 'Parkdauer Durchschnitt wöchentlich'),
      ('sensor_attribute', 'AVG_OCCUPIED_PERCENT_ALL_30D', 'Parkdauer Durchschnitt in %'),
      ('sensor_attribute', 'AVG_OCCUPIED_PERCENT_DAILY', 'Parkdauer Durchschnitt täglich in Prozent'),
      ('sensor_attribute', 'AVG_OCCUPIED_PERCENT_WEEKLY', 'Parkdauer Durchschnitt wöchentlich in Prozent'),
      ('sensor_attribute', 'AVG_TEMP_DEW_DIFF_MONTHLY', 'Taupunktdiff. Durchschnitt Monat'),
      ('sensor_attribute', 'AVG_TEMP_DEW_DIFF_PREV_DAY', 'Taupunktdiff. Durchschnitt Vortag'),
      ('sensor_attribute', 'AVG_TEMP_MONTHLY', 'Temperatur Durchschnitt Monat'),
      ('sensor_attribute', 'AVG_TEMP_PREV_DAY', 'Temperatur Durchschnitt Vortag'),

      ('sensor_attribute', 'BATTERY', 'Batterie'),
      ('sensor_attribute', 'BATTERYSTATUS', 'Batteriestatus'),

      ('vehicle_type', 'BICYCLE', 'Fahrrad'),
      ('vehicle_type', 'BICYCLES', 'Fahrrad'),
      ('vehicle_type', 'BIKE', 'Fahrrad'),
      ('vehicle_type', 'BIKECYCLE', 'Fahrrad'),
      ('vehicle_type', 'BUS', 'Bus'),
      ('vehicle_type', 'BUSES', 'Bus'),

      ('sensor_attribute', 'CAPACITY', 'Ladeplätze'),
      ('vehicle_type', 'CAR', 'PKW'),
      ('sensor_attribute', 'CAREUNIT', 'Pflegestatus'),
      ('sensor_attribute', 'CATEGORY', 'Kategorie'),
      ('sensor_attribute', 'CO', 'Kohlenstoffmonoxid'),
      ('sensor_attribute', 'CO2', 'CO2'),
      ('sensor_attribute', 'CO2AVG', 'CO2 Durchschnitt'),
      ('sensor_attribute', 'CONTACTPOINT', 'Kontaktinformation'),

      ('sensor_attribute', 'CURRENT_LEVEL', 'Pegelstand'),
      ('sensor_attribute', 'CURRENTLEVEL', 'Aktueller Pegel'),
      ('sensor_attribute', 'CURRENTLEVELDELTA', 'Pegelstand'),

      ('sensor_attribute', 'DATA', 'Daten'),
      ('sensor_attribute', 'DATEFELLED', 'Fälldatum'),
      ('sensor_attribute', 'DATEISSUED', 'Ausgabedatum'),
      ('sensor_attribute', 'DATEOBSERVED', 'Messdatum'),
      ('sensor_attribute', 'DATUM', 'Letzte Aktualisierung'),
      ('sensor_attribute', 'DAYS', 'Tage'),
      ('sensor_attribute', 'DESCRIPTION', 'Beschreibung'),
      ('sensor_attribute', 'DETAILURL', 'Details'),
      ('sensor_attribute', 'DEWPOINT', 'Taupunkt'),
      ('sensor_attribute', 'DURATIONTEXT', 'Dauer Textformat'),

      ('sensor_attribute', 'EAST_WINDSPEED', 'Windgeschwindigkeit Ost'),
      ('vehicle_type', 'ELECTRIC_BIKE', 'Elektrofahrrad'),
      ('vehicle_type', 'ELECTRIC_CAR', 'Elektroauto'),
      ('vehicle_type', 'ELECTRIC_MOTORBIKE', 'Elektromotorrad'),
      ('vehicle_type', 'ELECTRIC_SCOOTER', 'Elektroroller'),
      ('sensor_attribute', 'END_DATE', 'Ende'),

      ('vehicle_type', 'FAHRRAD', 'Fahrrad'),
      ('sensor_attribute', 'FREE_SLOTS', 'Freie Plätze'),

      ('sensor_attribute', 'GATEWAY_ID', 'Gateway ID'),
      ('sensor_attribute', 'GESAMT_1H', 'Gesamt (letzte Stunde)'),
      ('sensor_attribute', 'GESAMT_24H', 'Gesamt (letzte 24 Stunden)'),

      ('sensor_attribute', 'HOTTEST_DAY', 'Heißester Tag'),
      ('sensor_attribute', 'HOUR', 'Stunde'),
      ('sensor_attribute', 'INCLINATION_DEGREE', 'Neigung'),
      ('sensor_attribute', 'INSTRUCTION', 'Handlungsempfehlung'),
      ('sensor_attribute', 'INTENSITY', 'Auslastung'),
      ('sensor_attribute', 'IRRADIATION', 'Sonneneinstrahlung'),

      ('sensor_attribute', 'LIGHTNING_AVERAGE_DISTANCE', 'Blitzdistanz'),
      ('sensor_attribute', 'LIGHTNING_STRIKE_COUNT', 'Blitzeinschläge'),
      ('sensor_attribute', 'LIGHTNING_STRIKE_COUNTER', 'Blitzanzahl'),
      ('sensor_attribute', 'LIGHTNING_STRIKE_DATE', 'letzter Blitzeinschlag'),
      ('sensor_attribute', 'LIGHTNING_STRIKE_DISTANCE', 'Blitzentfernung'),

      ('sensor_attribute', 'LINPERCENTVALUE', 'Füllstand'),
      ('vehicle_type', 'LKW', 'LKW'),
      ('sensor_attribute', 'LOCATION', 'Ort'),

      ('sensor_attribute', 'MAX_CO2_MONTHLY', 'CO2 max. Monat'),
      ('sensor_attribute', 'MAX_CO2_PREV_DAY', 'CO2 max. Vortag'),
      ('sensor_attribute', 'MAX_PRECIPITATION', 'max. Niederschlag'),
      ('sensor_attribute', 'MAX_TEMP_DEW_DIFF_MONTHLY', 'Taupunktdiff. max. Monat'),
      ('sensor_attribute', 'MAX_TEMP_DEW_DIFF_PREV_DAY', 'Taupunktdiff. max. Vortag'),
      ('sensor_attribute', 'MAX_TEMP_MONTHLY', 'Temperatur max. Monat'),
      ('sensor_attribute', 'MAX_TEMP_PREV_DAY', 'Temperatur max. Vortag'),
      ('sensor_attribute', 'MAXCURRENTLEVEL', 'max. Wasserstand'),
      ('sensor_attribute', 'MAXDATEOBSERVED', 'max. Wasserstand Datum'),
      ('sensor_attribute', 'MAXIMUM_WINDSPEED', 'Windböe'),
      ('sensor_attribute', 'MAXLVL', 'Höchster Pegelstand'),
      ('sensor_attribute', 'MAXLVL_DATE', 'max. Pegelstand Datum'),
      ('sensor_attribute', 'MEASUREDDISTANCE', 'Abstand gemessen'),
      ('sensor_attribute', 'METERTYPE', 'Messtyp'),

      ('sensor_attribute', 'MIN_CO2_MONTHLY', 'CO2 min. Monat'),
      ('sensor_attribute', 'MIN_CO2_PREV_DAY', 'CO2 min. Vortag'),
      ('sensor_attribute', 'MIN_TEMP_DEW_DIFF_MONTHLY', 'Taupunktdiff. min. Monat'),
      ('sensor_attribute', 'MIN_TEMP_DEW_DIFF_PREV_DAY', 'Taupunktdiff. min. Vortag'),
      ('sensor_attribute', 'MIN_TEMP_MONTHLY', 'Temperatur min. Monat'),
      ('sensor_attribute', 'MIN_TEMP_PREV_DAY', 'Temperatur min. Vortag'),
      ('sensor_attribute', 'MINCURRENTLEVEL', 'min. Wasserstand'),
      ('sensor_attribute', 'MINDATEOBSERVED', 'min. Wasserstand Datum'),
      ('sensor_attribute', 'MINLVL', 'Niedrigster Pegelstand'),
      ('sensor_attribute', 'MINLVL_DATE', 'min. Pegelstand Datum'),

      ('sensor_attribute', 'MONTHLYCONSUMPTIONSUMGAS', 'Monatlicher Gasverbrauch'),
      ('sensor_attribute', 'MONTHLYCONSUMPTIONSUMWATER', 'Monatlicher Wasserverbrauch'),

      ('vehicle_type', 'MOTORBIKE', 'Motorrad'),
      ('vehicle_type', 'MOTORCYCLE', 'Motorrad'),
      ('vehicle_type', 'MOTORCYCLES', 'Motorrad'),
      ('vehicle_type', 'MOTORRAD', 'Motorrad'),

      ('sensor_attribute', 'NAME', 'Name'),
      ('sensor_attribute', 'NO', 'Stickstoffmonoxid'),
      ('sensor_attribute', 'NO2', 'Stickstoffdioxid'),
      ('sensor_attribute', 'NOMINALCAPACITY', 'Nennkapazität'),
      ('sensor_attribute', 'NORTH_WINDSPEED', 'Windgeschwindigkeit Nord'),
      ('sensor_attribute', 'NUM_DAYS', 'Anzahl Tage'),

      ('sensor_attribute', 'O3', 'Ozon'),
      ('sensor_attribute', 'OBSERVATIONDATETIME', 'Messdatum'),
      ('sensor_attribute', 'OCCUPIED_SECONDS', 'Parkdauer Sek.'),
      ('sensor_attribute', 'OCCUPIED_SLOTS', 'Belegte Plätze'),
      ('sensor_attribute', 'OPERATOR', 'Betreiber'),

      ('vehicle_type', 'PASSANT', 'Person'),
      ('sensor_attribute', 'PEGELSTAND', 'Pegelstand (cm)'),
      ('sensor_attribute', 'PERCENTVALUE', 'Messwert Prozent'),
      ('vehicle_type', 'PERSON', 'Person'),
      ('sensor_attribute', 'PICTURE', 'Bild'),
      ('vehicle_type', 'PKW', 'PKW'),
      ('sensor_attribute', 'PM1', 'Feinstaub PM1'),
      ('sensor_attribute', 'PM10', 'Feinstaub PM10'),
      ('sensor_attribute', 'PM25', 'Feinstaub PM2,5'),

      ('sensor_attribute', 'PRECIPITATION', 'Niederschlag'),
      ('sensor_attribute', 'PRECIPITATIONAVG', 'Niederschlag'),
      ('sensor_attribute', 'PRESSURE', 'Luftdruck'),

      ('sensor_attribute', 'RAIN_VALUE', 'Regenmenge'),
      ('sensor_attribute', 'RAINDURATION_MIN', 'Regendauer'),
      ('sensor_attribute', 'RAINRATE10MIN', 'Regenmenge (10 min)'),
      ('sensor_attribute', 'RAINRATEINTERVAL', 'Niederschlag'),
      ('sensor_attribute', 'REFERENCELEVEL', 'Referenz Pegel'),
      ('sensor_attribute', 'REFPARKINGSITE', 'Parkplatz'),

      ('sensor_attribute', 'RELATIV_FREI', 'Frei (%)'),
      ('sensor_attribute', 'RELATIVEHUMIDITY', 'Relative Luftfeuchte'),
      ('sensor_attribute', 'RELATIVEHUMIDITYAVG', 'Luftfeuchte'),

      ('sensor_attribute', 'RESULT', 'Ergebnis'),
      ('sensor_attribute', 'RSSI', 'Signal RSSi'),
      ('sensor_attribute', 'SCALEDVALUE', 'Messwert'),

      ('vehicle_type', 'SCOOTER', 'Roller'),
      ('sensor_attribute', 'SEVERITY', 'Stufe'),
      ('sensor_attribute', 'SNR', 'Signal SNR'),
      ('sensor_attribute', 'SOCKETTYPE', 'Steckanschlüsse'),

      ('sensor_attribute', 'SOILMOISTURE', 'Bodenfeuchtigkeit'),
      ('sensor_attribute', 'SOILMOISTUREEC', 'Bodenfeuchtigkeit'),
      ('sensor_attribute', 'SOILMOISTUREVWC', 'Bodenfeuchtigkeit'),
      ('sensor_attribute', 'SOILMOISTUREVWC_10CM', 'Bodenfeuchte 10cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_20CM', 'Bodenfeuchte 20cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_30CM', 'Bodenfeuchte 30cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_45CM', 'Bodenfeuchte 45cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_60CM', 'Bodenfeuchte 60cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_90CM', 'Bodenfeuchte 90cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_TIEFE_1', 'Bodenfeuchtigkeit 10cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_TIEFE_10CM', 'Bodenfeuchtigkeit 10cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_TIEFE_2', 'Bodenfeuchtigkeit 25cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_TIEFE_20CM', 'Bodenfeuchtigkeit 20cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_TIEFE_3', 'Bodenfeuchtigkeit 50cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_TIEFE_30CM', 'Bodenfeuchtigkeit 50cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_TIEFE_4', 'Bodenfeuchtigkeit 75cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_TIEFE_45CM', 'Bodenfeuchtigkeit 75cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_TIEFE_5', 'Bodenfeuchtigkeit 90cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_TIEFE_6', 'Bodenfeuchtigkeit 1m'),
      ('sensor_attribute', 'SOILMOISTUREVWC_TIEFE_60CM', 'Bodenfeuchtigkeit 60cm'),
      ('sensor_attribute', 'SOILMOISTUREVWC_TIEFE_90CM', 'Bodenfeuchtigkeit 90cm'),

      ('sensor_attribute', 'SOILTEMPERATUR', 'Bodentemperatur (°C)'),
      ('sensor_attribute', 'SOILTEMPERATURE', 'Bodentemperatur (°C)'),
      ('sensor_attribute', 'SOLARRADIATION', 'Solareinstrahlung'),
      ('vehicle_type', 'SONSTIGE', 'Sonstige'),
      ('sensor_attribute', 'START_DATE', 'Start'),

      ('sensor_attribute', 'STATUS', 'Status'),
      ('sensor_attribute', 'STATUS_DE', 'Status'),
      ('sensor_attribute', 'STATUS_ISOCCUPIEDSUM', 'Belegung'),
      ('sensor_attribute', 'STREETADDRESS', 'Straße'),
      ('sensor_attribute', 'STREETNAME', 'Straßenname'),
      ('sensor_attribute', 'SUBCATEGORY', 'Unterkategorie'),

      ('sensor_attribute', 'TARGETTEMPERATURE', 'Zieltemperatur'),
      ('sensor_attribute', 'TEMPERATURE', 'Temperatur (°C)'),
      ('sensor_attribute', 'TEMPERATUREAVG', 'Temperatur'),
      ('sensor_attribute', 'TEXT', 'Text'),
      ('sensor_attribute', 'TEXT_COUNTER', 'Anzahl Textformat'),
      ('sensor_attribute', 'TEXT_YEARLY_MAX', 'Text jährlich'),
      ('sensor_attribute', 'TITLE', 'Title'),

      ('sensor_attribute', 'TOTAL_COVERAGE', 'Bewölkung'),
      ('sensor_attribute', 'TOTALACTIVEENERGYIMPORT', 'Gesamter Energie-Import'),
      ('sensor_attribute', 'TOTALACTIVEPOWER', 'Gesamte Wirkleistung'),
      ('sensor_attribute', 'TOTALCONSUMPTION', 'Gesamtverbrauch'),
      ('sensor_attribute', 'TOTALCONSUMPTIONSUM_GAS', 'Gesamtverbrauch Gas'),
      ('sensor_attribute', 'TOTALCONSUMPTIONSUM_WATER', 'Gesamtverbrauch Wasser'),

      ('sensor_attribute', 'TREEHEIGHT', 'Höhe'),
      ('sensor_attribute', 'TREETYPE', 'Baumart'),
      ('sensor_attribute', 'TREETYPEBOTANICAL', 'Baumart botanisch'),

      ('vehicle_type', 'TRUCK', 'LKW'),
      ('vehicle_type', 'TRUCKS', 'LKW'),
      ('sensor_attribute', 'UNKNOWN_SLOTS', 'Unbekannte Plätze'),
      ('sensor_attribute', 'UTCI', 'Gefühlte Temperatur'),

      ('sensor_attribute', 'VALIDFROM', 'gültig ab'),
      ('sensor_attribute', 'VALIDTO', 'gültig bis'),
      ('sensor_attribute', 'VEHICLETYPE', 'Fahrzeugtyp'),

      ('sensor_attribute', 'WATERLEAK1', 'Leckage Sensor 1'),
      ('sensor_attribute', 'WATERLEAK2', 'Leckage Sensor 2'),
      ('sensor_attribute', 'WATERLEAKOVERALL', 'Leckagestatus'),
      ('sensor_attribute', 'WATERLEVEL', 'Pegelstand'),
      ('sensor_attribute', 'WATERREQUIREMET', 'Wasserbedarf'),

      ('sensor_attribute', 'WEEKDAY', 'Wochentag'),
      ('sensor_attribute', 'WINDDIRECTION', 'Windrichtung'),
      ('sensor_attribute', 'WINDSPEED', 'Windgeschwindigkeit'),
      ('sensor_attribute', 'YEARPLANTED', 'Pflanzjahr')
  ) AS source(category, raw_value, label)
  WHERE NOT EXISTS (
    SELECT 1
    FROM "value-translation" existing
    WHERE existing.category = source.category
      AND existing.raw_value = source.raw_value
      AND existing.tenant_id IS NULL
  );