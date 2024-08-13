export enum aggregationEnum {
  average = 'avg',
  minimum = 'min',
  maximum = 'max',
  sum = 'sum',
  none = 'none',
}

export enum timeframeEnum {
  live = 'live',
  day = 'day',
  week = 'week',
  month = 'month',
}

export enum visibilityEnum {
  public = 'public',
  protected = 'protected',
  invisible = 'invisible',
}

export enum tabComponentTypeEnum {
  default = '',
  information = 'Informationen',
  diagram = 'Diagramm',
  slider = 'Slider',
  map = 'Karte',
  value = 'Wert',
  iframe = 'iFrame',
  image = 'Bild',
}

export enum tabComponentSubTypeEnum {
  default = '',
  text = 'Text',
  iconWithLink = 'Icon mit Link',
  degreeChart180 = '180° Chart',
  degreeChart360 = '360° Chart',
  stageableChart = 'Stageable Chart',
  pieChart = 'Pie Chart',
  lineChart = 'Linien Chart',
  barChart = 'Balken Chart',
  measurement = 'Measurement',
  pin = 'Pin',
  parking = 'Parking',
  square = 'Square',
  rectangle = 'Rectangle',
  circle = 'Circle',
  hexagon = 'Hexagon',
  onlyPin = 'Only pin',
  onlyFormArea = 'Only form area',
  combinedPinAndForm = 'Combined form and pin',
  coloredSlider = 'Farbiger Slider',
}

export enum authDataTypeEnum {
  ngsiv2 = 'ngsi-v2',
  ngsild = 'ngsi-ld',
  api = 'api',
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
