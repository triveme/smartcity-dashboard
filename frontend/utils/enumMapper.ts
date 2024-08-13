import {
  aggregationEnum,
  aggregationPeriodEnum,
  tabComponentSubTypeEnum,
  timeframeEnum,
  visibilityEnum,
} from '@/types';

export const aggregationOptions = [
  { label: '', value: '' },
  { label: 'Summe', value: aggregationEnum.sum },
  { label: 'Minimum', value: aggregationEnum.minimum },
  { label: 'Maximum', value: aggregationEnum.maximum },
  { label: 'Durchschnitt', value: aggregationEnum.average },
  { label: 'Keine', value: aggregationEnum.none },
];

export const timeFrameWithLive = [
  { label: '', value: '' },
  { label: 'Live', value: timeframeEnum.live },
  { label: 'Tag', value: timeframeEnum.day },
  { label: 'Woche', value: timeframeEnum.week },
  { label: 'Monat', value: timeframeEnum.month },
];

export const timeFrameWithoutLive = [
  { label: '', value: '' },
  { label: 'Tag', value: timeframeEnum.day },
  { label: 'Woche', value: timeframeEnum.week },
  { label: 'Monat', value: timeframeEnum.month },
];

export const mapComponentSubTypes = [
  { label: '', value: '' },
  { label: 'Pin', value: tabComponentSubTypeEnum.pin },
  // { label: 'Parken', value: tabComponentSubTypeEnum.parking }, Temporarely disabled
];

export const mapComponentShapeOptions = [
  { label: '', value: '' },
  { label: 'Quadrat', value: tabComponentSubTypeEnum.square },
  { label: 'Rechteck', value: tabComponentSubTypeEnum.rectangle },
  { label: 'Kreis', value: tabComponentSubTypeEnum.circle },
  { label: 'Hexagon', value: tabComponentSubTypeEnum.hexagon },
];

export const mapDisplayModes = [
  { label: '', value: '' },
  { label: 'Nur Pin', value: tabComponentSubTypeEnum.onlyPin },
  {
    label: 'Nur Geometrische Form',
    value: tabComponentSubTypeEnum.onlyFormArea,
  },
  {
    label: 'Kombinierter Pin und geometrische Form',
    value: tabComponentSubTypeEnum.combinedPinAndForm,
  },
];

export const chartComponentSubTypes = [
  { label: '', value: '' },
  { label: '180° Diagramm', value: tabComponentSubTypeEnum.degreeChart180 },
  { label: '360° Diagramm', value: tabComponentSubTypeEnum.degreeChart360 },
  { label: 'Stageable Chart', value: tabComponentSubTypeEnum.stageableChart },
  { label: 'Kuchendiagramm', value: tabComponentSubTypeEnum.pieChart },
  { label: 'Liniendiagramm', value: tabComponentSubTypeEnum.lineChart },
  { label: 'Balkendiagramm', value: tabComponentSubTypeEnum.barChart },
  { label: 'Messung', value: tabComponentSubTypeEnum.measurement },
];

export const sliderComponentSubTypes = [
  { label: '', value: '' },
  { label: 'Farbiger Slider', value: tabComponentSubTypeEnum.coloredSlider },
];

export const informationComponentSubTypes = [
  { label: '', value: '' },
  { label: 'Text', value: tabComponentSubTypeEnum.text },
  { label: 'Icon mit Link', value: tabComponentSubTypeEnum.iconWithLink },
];

export const visibilityOptions = [
  { label: 'sichtbar', value: visibilityEnum.public },
  { label: 'versteckt', value: visibilityEnum.invisible },
  { label: 'geschützt', value: visibilityEnum.protected },
];

export const aggregationPeriods = [
  { label: '', value: '' },
  { label: 'Sekunde', value: aggregationPeriodEnum.second },
  { label: 'Minute', value: aggregationPeriodEnum.minute },
  { label: 'Stunde', value: aggregationPeriodEnum.hour },
  { label: 'Tag', value: aggregationPeriodEnum.day },
  { label: 'Woche', value: aggregationPeriodEnum.week },
  { label: 'Monat', value: aggregationPeriodEnum.month },
  { label: 'Jahr', value: aggregationPeriodEnum.year },
];
