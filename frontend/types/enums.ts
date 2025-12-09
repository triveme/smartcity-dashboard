export enum aggregationEnum {
  average = 'avg',
  minimum = 'min',
  maximum = 'max',
  sum = 'sum',
  none = 'none',
}

export enum roundingModeEnum {
  math = 'math',
  floor = 'floor',
  ceil = 'ceil',
}

export enum timeframeEnum {
  live = 'live',
  day = 'day',
  week = 'week',
  month = 'month',
  quarter = 'quarter',
  year = 'year',
  year2 = 'year2',
  year3 = 'year3',
}

export enum visibilityEnum {
  public = 'public',
  protected = 'protected',
}

export enum dashboardTypeEnum {
  general = 'Allgemein',
  map = 'Karte',
  iframe = 'iFrame',
}

export enum tabComponentTypeEnum {
  default = '',
  information = 'Informationen',
  diagram = 'Diagramm',
  slider = 'Slider',
  map = 'Karte',
  listview = 'Listview',
  weatherWarning = 'Wetterwarnungen',
  combinedComponent = 'Kombinierte Komponente',
  value = 'Wert',
  iframe = 'iFrame',
  image = 'Bild',
  interactiveComponent = 'Interaktive Komponente',
  valueToImage = 'Werte zu Bildern',
  sensorStatus = 'Ampelstatus',
}

export enum tabComponentSubTypeEnum {
  default = '',
  text = 'Text',
  iconWithLink = 'Icon mit Link',
  degreeChart180 = '180° Chart',
  degreeChart360 = '360° Chart',
  stageableChart = 'Stageable Chart',
  pieChart = 'Pie Chart',
  pieChartDynamic = 'Pie Chart (dynamisch)',
  lineChart = 'Linien Chart',
  lineChartDynamic = 'Linien Chart (dynamisch)',
  barChart = 'Balken Chart',
  table = 'Table',
  tableDynamic = 'Table (dynamisch)',
  barChartDynamic = 'Balken Chart (dynamisch)',
  measurement = 'Measurement',
  pin = 'Pin',
  pinDynamic = 'Pin (dynamisch)',
  parking = 'Parking',
  combinedMap = 'Kombinierte Karte',
  custom_map = 'Eigene Karte',
  square = 'Square',
  rectangle = 'Rectangle',
  circle = 'Circle',
  hexagon = 'Hexagon',
  onlyPin = 'Only pin',
  onlyFormArea = 'Only form area',
  combinedPinAndForm = 'Combined form and pin',
  geoJSON = 'GeoJSON',
  geoJSONDynamic = 'GeoJSON (dynamisch)',
  coloredSlider = 'Farbiger Slider',
  overviewSlider = 'Slider Übersicht',
  barChartHorizontal = 'Bar Chart - Horizontal',
  chartDateSelector = 'Chart Datum Selektor',
}

export enum chartDateRepresentaionEnum {
  default = 'Default',
  onlyJear = 'Only Year',
  onlyMonth = 'Only Month',
  onlyLabels = 'Only Labels',
}

export enum widgetImageSourceEnum {
  default = '',
  url = 'URL',
  sensor = 'Sensor',
}

export enum authDataTypeEnum {
  ngsiv2 = 'ngsi-v2',
  ngsild = 'ngsi-ld',
  api = 'api',
  staticendpoint = 'static-endpoint',
  usi = 'usi',
  internal = 'internal',
}

export enum reportThresholdTriggerTypeEnum {
  exceeding = 'exceeding',
  falls_below = 'falls below',
  equals = 'equals',
}

export enum aggregationPeriodEnum {
  second = 'second',
  minute = 'minute',
  hour = 'hour',
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
}

export enum supportRequestTypeEnum {
  supportRequest = 'Supportanfrage',
  bugReport = 'Fehlerbericht',
  suggestion = 'Vorschläge',
}

export enum widthTypeEnum {
  small = 4,
  half = 6,
  middle = 8,
  large = 12,
}

export enum fontFamilyEnum {
  Helvetica = 'Helvetica',
  Arial = 'Arial',
  Verdana = 'Verdana',
  Tahoma = 'Tahoma',
  GillSans = 'Gill Sans',
  TimesNewRoman = 'Times New Roman',
  Georgia = 'Georgia',
  Palatino = 'Palatino',
  Courier = 'Courier',
  Lucida = 'Lucida',
  Monaco = 'Monaco',
}

export enum chartLegendAlignmentEnum {
  Top = 'Top',
  Left = 'Left',
  Right = 'Right',
}

export enum menuArrowDirectionEnum {
  TopTop = 'Oben | Oben',
  TopDown = 'Oben | Unten',
  LeftLeft = 'Links | Links',
  LeftRight = 'Links | Rechts',
  DownDown = 'Unten | Unten',
  DownTop = 'Unten | Oben',
  RightRight = 'Rechts | Rechts',
  RightLeft = 'Rechts | Links',
}

export enum combinedComponentLayoutEnum {
  Vertical = 'Nebeneinander',
  Horizontal = 'Untereinander',
}

export enum componentLayoutEnum {
  Vertical = 'Untereinander',
  Horizontal = 'Nebeneinander',
}

export enum themeEnum {
  Dark = 'Dark',
  Light = 'Light',
}
