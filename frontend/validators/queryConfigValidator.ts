import {
  QueryConfig,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
  timeframeEnum,
} from '@/types';
import { WizardErrors } from '@/types/errors';

export function validateQueryConfig(
  queryConfig: QueryConfig,
  componentType: string,
  isQueryConfig: boolean,
  origin: string,
  componentSubType?: string,
  usesQueryParameter?: boolean,
): WizardErrors {
  const errorsOccured: WizardErrors = {};
  const isNgsiDatasource = origin === 'ngsi-v2' || origin === 'ngsi-ld';

  if (
    queryConfig?.interval === undefined ||
    queryConfig?.interval === null ||
    queryConfig?.interval === 0 ||
    queryConfig?.interval < 60
  ) {
    errorsOccured.updateIntervalError =
      'Aktualisierungsintervall von mindestens 60 Sekunden ist erforderlich';
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
  if (isNgsiDatasource && !queryConfig.timeframe) {
    errorsOccured.timeValueError = 'Zeitraum ist erforderlich';
  }

  if (
    isNgsiDatasource &&
    queryConfig.timeframe === timeframeEnum.user_defined &&
    !queryConfig.dataStartDate
  ) {
    errorsOccured.timeValueError = 'Startdatum ist erforderlich';
  }
  if (!queryConfig?.entityIds || queryConfig?.entityIds.length === 0) {
    errorsOccured.sensorError = 'Sensoren sind erforderlich';
  }

  if (componentType === tabComponentTypeEnum.diagram) {
    if (queryConfig?.attributes && queryConfig?.attributes.length === 0) {
      errorsOccured.attributeError =
        'Diagramm Widgets müssen mindestens ein Attribut haben';
    }
    if (componentSubType === tabComponentSubTypeEnum.measurement) {
      if (queryConfig?.attributes && queryConfig.attributes.length !== 1) {
        errorsOccured.attributeError =
          'Messung Widgets müssen ein einzelnes Attribut haben';
      }
      if (
        queryConfig?.entityIds &&
        queryConfig.entityIds.length !== 1 &&
        !usesQueryParameter
      ) {
        errorsOccured.sensorError =
          'Messung Widgets müssen einen einzelnen Sensor oder Source haben';
      }
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
    if (
      queryConfig?.entityIds &&
      queryConfig?.entityIds.length != 1 &&
      !usesQueryParameter
    ) {
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
