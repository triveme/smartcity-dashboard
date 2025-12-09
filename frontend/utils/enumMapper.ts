import {
  aggregationEnum,
  aggregationPeriodEnum,
  authDataTypeEnum,
  chartDateRepresentaionEnum,
  chartLegendAlignmentEnum,
  menuArrowDirectionEnum,
  roundingModeEnum,
  tabComponentSubTypeEnum,
  themeEnum,
  timeframeEnum,
  visibilityEnum,
  widgetImageSourceEnum,
  widthTypeEnum,
} from '@/types';

export const aggregationOptions = [
  { label: '', value: '' },
  { label: 'Summe', value: aggregationEnum.sum },
  { label: 'Minimum', value: aggregationEnum.minimum },
  { label: 'Maximum', value: aggregationEnum.maximum },
  { label: 'Durchschnitt', value: aggregationEnum.average },
  { label: 'Keine', value: aggregationEnum.none },
];

export const roundingModes = [
  { label: '', value: '' },
  { label: 'Mathematisch', value: roundingModeEnum.math },
  { label: 'Abrunden', value: roundingModeEnum.floor },
  { label: 'Aufrunden', value: roundingModeEnum.ceil },
];

export const timeFrameWithLive = [
  { label: '', value: '' },
  { label: 'Live', value: timeframeEnum.live },
  { label: 'Tag', value: timeframeEnum.day },
  { label: 'Woche', value: timeframeEnum.week },
  { label: 'Monat', value: timeframeEnum.month },
  { label: 'Quartal', value: timeframeEnum.quarter },
  { label: 'Jahr', value: timeframeEnum.year },
  // { label: '2 Jahre', value: timeframeEnum.year2 },
  // { label: '3 Jahre', value: timeframeEnum.year3 },
];

export const timeFrameWithoutLive = [
  { label: '', value: '' },
  { label: 'Tag', value: timeframeEnum.day },
  { label: 'Woche', value: timeframeEnum.week },
  { label: 'Monat', value: timeframeEnum.month },
  { label: 'Quartal', value: timeframeEnum.quarter },
  { label: 'Jahr', value: timeframeEnum.year },
  { label: '2 Jahre', value: timeframeEnum.year2 },
  { label: '3 Jahre', value: timeframeEnum.year3 },
];

export const mapComponentSubTypes = [
  { label: '', value: '' },
  { label: 'Pin', value: tabComponentSubTypeEnum.pin },
  { label: 'Pin (dynamisch)', value: tabComponentSubTypeEnum.pinDynamic },
  { label: 'Kombinierte Karte', value: tabComponentSubTypeEnum.combinedMap },
  { label: 'GeoJSON', value: tabComponentSubTypeEnum.geoJSON },
  {
    label: 'GeoJSON (dynamisch)',
    value: tabComponentSubTypeEnum.geoJSONDynamic,
  },
  { label: 'Eigene Karte', value: tabComponentSubTypeEnum.custom_map },
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
  {
    label: 'Kuchendiagramm (dynamisch)',
    value: tabComponentSubTypeEnum.pieChartDynamic,
  },
  { label: 'Liniendiagramm', value: tabComponentSubTypeEnum.lineChart },
  {
    label: 'Liniendiagramm (dynamisch)',
    value: tabComponentSubTypeEnum.lineChartDynamic,
  },
  { label: 'Balkendiagramm', value: tabComponentSubTypeEnum.barChart },
  {
    label: 'Balkendiagramm (dynamisch)',
    value: tabComponentSubTypeEnum.barChartDynamic,
  },
  { label: 'Messung', value: tabComponentSubTypeEnum.measurement },
  { label: 'Table', value: tabComponentSubTypeEnum.table }, //hk
  {
    label: 'Bar Chart - Horizontal',
    value: tabComponentSubTypeEnum.barChartHorizontal,
  }, //hk
  { label: 'Table (dynamisch)', value: tabComponentSubTypeEnum.tableDynamic },
];

export const chartDateRepresentation = [
  { label: 'Standard', value: chartDateRepresentaionEnum.default },
  { label: 'nur Jahr', value: chartDateRepresentaionEnum.onlyJear },
  {
    label: 'nur Monat (Jahr beim Jahreswechsel)',
    value: chartDateRepresentaionEnum.onlyMonth,
  },
  {
    label: 'nur Zeit-Labels (müssen im Datensatz vorhanden sein)',
    value: chartDateRepresentaionEnum.onlyLabels,
  },
];

export const sliderComponentSubTypes = [
  { label: '', value: '' },
  { label: 'Farbiger Slider', value: tabComponentSubTypeEnum.coloredSlider },
  { label: 'Slider Übersicht', value: tabComponentSubTypeEnum.overviewSlider },
];

export const informationComponentSubTypes = [
  { label: '', value: '' },
  { label: 'Text', value: tabComponentSubTypeEnum.text },
  { label: 'Icon mit Link', value: tabComponentSubTypeEnum.iconWithLink },
];

export const interactiveComponentSubTypes = [
  { label: '', value: '' },
  {
    label: 'Chart Datum Selektor',
    value: tabComponentSubTypeEnum.chartDateSelector,
  },
];

export const widgetImageSources = [
  { label: '', value: '' },
  { label: 'URL', value: widgetImageSourceEnum.url },
  { label: 'Sensor', value: widgetImageSourceEnum.sensor },
];

export const visibilityOptions = [
  { label: 'sichtbar', value: visibilityEnum.public },
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

export const widthTypes = [
  { label: 'Klein 1/3', value: widthTypeEnum.small },
  { label: 'Hälfte 1/2', value: widthTypeEnum.half },
  { label: 'Mittel 2/3', value: widthTypeEnum.middle },
  { label: 'Groß 3/3', value: widthTypeEnum.large },
];

export const chartLegendAlignments = [
  { label: 'Top', value: chartLegendAlignmentEnum.Top },
  // { label: 'Left', value: chartLegendAlignmentEnum.Left },
];

export const menuArrowDirections = [
  { label: 'Oben | Unten', value: menuArrowDirectionEnum.TopDown },
  { label: 'Oben | Oben', value: menuArrowDirectionEnum.TopTop },
  { label: 'Unten | Oben', value: menuArrowDirectionEnum.DownTop },
  { label: 'Unten | Unten', value: menuArrowDirectionEnum.DownDown },
  { label: 'Links | Rechts', value: menuArrowDirectionEnum.LeftRight },
  { label: 'Links | Links', value: menuArrowDirectionEnum.LeftLeft },
  { label: 'Rechts | Links', value: menuArrowDirectionEnum.RightLeft },
  { label: 'Rechts | Rechts', value: menuArrowDirectionEnum.RightRight },
];

export const themes = [
  { label: 'Dark', value: themeEnum.Dark },
  { label: 'Light', value: themeEnum.Light },
];

export const dataPlatformTypes = [
  { label: 'NGSIv2', value: authDataTypeEnum.ngsiv2 },
  { label: 'NGSIld', value: authDataTypeEnum.ngsild },
  { label: 'Orchideo Connect', value: authDataTypeEnum.api },
  { label: 'Statischer Endpunkt', value: authDataTypeEnum.staticendpoint },
  { label: 'Urban Institute', value: authDataTypeEnum.usi },
  { label: 'Intern', value: authDataTypeEnum.internal },
];
