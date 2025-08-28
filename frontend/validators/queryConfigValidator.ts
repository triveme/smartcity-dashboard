import {
  QueryConfig,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
} from '@/types';
import { WizardErrors } from '@/types/errors';

export function validateQueryConfig(
  queryConfig: QueryConfig,
  componentType: string,
  isQueryConfig: boolean,
  origin: string,
  componentSubType?: string,
): WizardErrors {
  const errorsOccured: WizardErrors = {};

  if (
    queryConfig?.interval === undefined ||
    queryConfig?.interval === null ||
    queryConfig?.interval === 0
  ) {
    errorsOccured.updateIntervalError =
      'Aktualisierungsintervall ist erforderlich';
  }

  if (origin !== 'ngsi-ld' && !queryConfig?.fiwareService) {
    errorsOccured.fiwareServiceError =
      'Fiware-Dienst-/Sammlungsfeld ist erforderlich';
  }
  if (origin !== 'usi' && !queryConfig?.fiwareType) {
    errorsOccured.fiwareTypeError = 'Fiware-Typ ist erforderlich';
  }
  if (!queryConfig?.aggrMode) {
    errorsOccured.aggregationsError = 'Aggregationsmodus ist erforderlich';
  }
  if (
    componentType !== tabComponentTypeEnum.map &&
    componentSubType !== tabComponentSubTypeEnum.degreeChart180 &&
    componentSubType !== tabComponentSubTypeEnum.degreeChart360 &&
    componentSubType !== tabComponentSubTypeEnum.measurement &&
    componentSubType !== tabComponentSubTypeEnum.stageableChart &&
    componentType !== tabComponentTypeEnum.value &&
    componentType !== tabComponentTypeEnum.image &&
    componentType !== tabComponentTypeEnum.iframe &&
    !queryConfig.timeframe
  ) {
    errorsOccured.timeValueError = 'Zeitwert ist erforderlich';
  }
  if (!queryConfig?.entityIds || queryConfig?.entityIds.length === 0) {
    errorsOccured.sensorError = 'Sensoren sind erforderlich';
  }

  if (componentType === tabComponentTypeEnum.diagram) {
    if (queryConfig?.attributes && queryConfig?.attributes.length === 0) {
      errorsOccured.attributeError =
        'Diagramm Widgets müssen mindestens ein Attribut haben';
    }
    if (
      componentSubType === tabComponentSubTypeEnum.pieChart ||
      componentSubType === tabComponentSubTypeEnum.pieChartDynamic
    ) {
      if (queryConfig.attributes && !(queryConfig?.attributes.length > 0)) {
        errorsOccured.attributeError =
          'Pie Charts benötigen mindestens 1 Attribut';
      }
    }
  }
  if (componentType === tabComponentTypeEnum.value) {
    if (queryConfig?.attributes && queryConfig?.attributes.length != 1) {
      errorsOccured.attributeError =
        'Wert Widgets müssen ein einzelnes Attribut haben';
    }
    if (queryConfig?.entityIds && queryConfig?.entityIds.length != 1) {
      errorsOccured.sensorError =
        'Wert Widgets müssen einen einzelnen Sensor oder Source haben';
    }
  }
  if (
    componentType === tabComponentTypeEnum.slider &&
    componentSubType === tabComponentSubTypeEnum.coloredSlider
  ) {
    if (queryConfig?.attributes && queryConfig?.attributes.length !== 1) {
      errorsOccured.attributeError =
        'Slider Widgets müssen ein einzelnes Attribut haben';
    }
  }
  if (
    componentType === tabComponentTypeEnum.slider &&
    componentSubType === tabComponentSubTypeEnum.overviewSlider
  ) {
    if (queryConfig?.attributes && queryConfig?.attributes.length <= 1) {
      errorsOccured.attributeError =
        'Slider Übersicht muss jeweils ein Attribut für die Aktuelle und Maximale Auslastung haben';
    }
  }
  return errorsOccured;
}
