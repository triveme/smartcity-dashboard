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
  'Farbiger Slider',
]);

export const authDataTypeEnum = pgEnum('auth_data_type', [
  'ngsi',
  'ngsi-v2',
  'ngsi-ld',
  'api',
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
