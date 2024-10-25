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
  'hour',
  'day',
  'week',
  'month',
  'quarter',
  'year',
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
  'Wert',
  'iFrame',
  'Bild',
]);

export const tabComponentSubTypeEnum = pgEnum('tab_component_sub_type', [
  'Text',
  'Icon mit Link',
  '180° Chart',
  '360° Chart',
  'Stageable Chart',
  'Pie Chart',
  'Linien Chart',
  'Balken Chart',
  'Measurement',
  'Pin',
  'Parking',
  'Kombinierte Karte',
  'Farbiger Slider',
  'Slider Übersicht',
]);

export const authDataTypeEnum = pgEnum('auth_data_type', [
  'ngsi',
  'ngsi-v2',
  'ngsi-ld',
  'api',
  'static-endpoint',
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
