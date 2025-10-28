import { pgEnum } from 'drizzle-orm/pg-core';

export const aggregationEnum = pgEnum('aggregation', [
  'avg',
  'min',
  'max',
  'sum',
  'none',
]);

export const timeframeEnum = pgEnum('timeframe', [
  'live',
  'day',
  'week',
  'month',
  'quarter',
  'year',
  'year2',
  'year3',
]);

export const aggregationPeriodEnum = pgEnum('aggregation_period', [
  'second',
  'minute',
  'hour',
  'day',
  'week',
  'month',
  'year',
]);

export const tabComponentTypeEnum = pgEnum('tab_component_type', [
  'Informationen',
  'Diagramm',
  'Slider',
  'Karte',
  'Kombinierte Komponente',
  'Wetterwarnungen',
  'Wert',
  'iFrame',
  'Bild',
  'Listview',
  'Interaktive Komponente',
  'Werte zu Bildern',
]);

export const tabComponentSubTypeEnum = pgEnum('tab_component_sub_type', [
  'Text',
  'Icon mit Link',
  '180° Chart',
  '360° Chart',
  'Stageable Chart',
  'Pie Chart',
  'Pie Chart (dynamisch)',
  'Linien Chart',
  'Linien Chart (dynamisch)',
  'Balken Chart',
  'Balken Chart (dynamisch)',
  'Measurement',
  'Pin',
  'Pin (dynamisch)',
  'Parking',
  'Kombinierte Karte',
  'GeoJSON',
  'GeoJSON (dynamisch)',
  'Farbiger Slider',
  'Slider Übersicht',
  'Table',
  'Table (dynamisch)',
  'Chart Datum Selektor',
]);

export const chartDateRepresentationEnum = pgEnum('chart_date_representation', [
  'Default',
  'Only Year',
  'Only Month',
  'Only Labels',
]);

export const authDataTypeEnum = pgEnum('auth_data_type', [
  'ngsi',
  'ngsi-v2',
  'ngsi-ld',
  'api',
  'static-endpoint',
  'usi',
  'internal',
]);

export const timeHorizonTypeEnum = pgEnum('time_horizon_type', [
  'shortterm',
  'midterm',
  'longterm',
  'archive',
]);

export const reportThresholdTriggerTypeEnum = pgEnum('threshold_trigger_type', [
  'exceeding',
  'falls below',
  'equals',
]);

export const corporateInfoFontFamiliesTypeEnum = pgEnum(
  'corporate_info_font_families_type',
  [
    'Helvetica',
    'Arial',
    'Verdana',
    'Tahoma',
    'Gill Sans',
    'Times New Roman',
    'Georgia',
    'Palatino',
    'Courier',
    'Lucida',
    'Monaco',
  ],
);

export const titleBarThemeTypeEnum = pgEnum('title_bar_theme', [
  'Dark',
  'Light',
]);

export const chartLegendPlacement = pgEnum('chart_legend_placement', [
  'Left',
  'Right',
  'Top',
]);

export const menuArrowDirectionEnum = pgEnum('menu_arrow_direction_enum', [
  'Oben | Oben',
  'Oben | Unten',
  'Links | Links',
  'Links | Rechts',
  'Unten | Unten',
  'Unten | Oben',
  'Rechts | Rechts',
  'Rechts | Links',
]);
