import {
  PipeTransform,
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';

interface QueryConfigWithTypes extends QueryConfig {
  componentType?: string;
  componentSubType?: string;
  dataSourceType?: string;
}

@Injectable()
export class SanitizeQueryConfigPipe implements PipeTransform {
  private readonly logger = new Logger(SanitizeQueryConfigPipe.name);

  transform(queryConfig: QueryConfigWithTypes): QueryConfig {
    const isExistingQueryConfig = Boolean(queryConfig.id);
    const errorsOccured: string[] = [];
    const fatalErrorsOccured: string[] = [];
    const isNgsiDatasource =
      queryConfig.dataSourceType === 'ngsi-v2' ||
      queryConfig.dataSourceType === 'ngsi-ld';

    if (queryConfig.componentSubType === 'Measurement') {
      queryConfig.aggrMode = 'none';
    }
    if (
      queryConfig?.interval === undefined ||
      queryConfig?.interval === null ||
      queryConfig?.interval === 0
    ) {
      errorsOccured.push('Aktualisierungsintervall ist erforderlich');
    }

    if (
      queryConfig.dataSourceType !== 'static-endpoint' &&
      queryConfig.dataSourceType !== 'ngs-ld' &&
      queryConfig.dataSourceType !== 'usi'
    ) {
      if (!queryConfig?.fiwareService) {
        errorsOccured.push('Fiware-Dienst-/Sammlungsfeld ist erforderlich');
      }
      if (!queryConfig?.fiwareType) {
        errorsOccured.push('Fiware-Typ ist erforderlich');
      }
      if (!queryConfig?.aggrMode) {
        errorsOccured.push('Aggregationsmodus ist erforderlich');
      }
      if (!queryConfig?.entityIds || queryConfig?.entityIds.length === 0) {
        errorsOccured.push('Sensoren sind erforderlich');
      }
    }

    if (
      isNgsiDatasource &&
      (queryConfig.timeframe === undefined || queryConfig.timeframe === null)
    ) {
      const error = 'Zeitraum ist erforderlich';
      errorsOccured.push(error);
      fatalErrorsOccured.push(error);
    }

    if (
      isNgsiDatasource &&
      queryConfig.timeframe === 'user_defined' &&
      !queryConfig.dataStartDate
    ) {
      const error = 'Startdatum ist erforderlich';
      errorsOccured.push(error);
      fatalErrorsOccured.push(error);
    }

    if (
      queryConfig.componentType !== 'Karte' &&
      queryConfig.componentType !== 'Wert' &&
      queryConfig.componentType !== 'Slider' &&
      queryConfig.componentSubType !== '180° Chart' &&
      queryConfig.componentSubType !== '360° Chart' &&
      queryConfig.componentSubType !== 'Stageable Chart' &&
      queryConfig.componentSubType !== 'Pie Chart' &&
      queryConfig.componentSubType !== 'Pie Chart (dynamisch)' &&
      queryConfig?.timeframe === 'live'
    ) {
      errorsOccured.push('Zeitwert ist erforderlich');
    }

    if (queryConfig.componentType === 'Diagram') {
      if (
        queryConfig.componentSubType === 'Pie Chart' ||
        queryConfig.componentSubType === 'Pie Chart (dynamisch)'
      ) {
        if (queryConfig.attributes && !(queryConfig?.attributes.length > 0)) {
          errorsOccured.push('Pie Charts benötigen mindestens 1 Attribute');
        }
      }
    }
    if (queryConfig.componentType === 'Wert') {
      if (queryConfig?.attributes && queryConfig?.attributes.length != 1) {
        errorsOccured.push('Wert Widgets müssen ein einzelnes Attribut haben');
      }
      if (queryConfig?.entityIds && queryConfig?.entityIds.length != 1) {
        errorsOccured.push(
          'Wert Widgets müssen einen einzelnen Sensor oder Source haben',
        );
      }
    }
    if (errorsOccured.length > 0) {
      if (fatalErrorsOccured.length > 0 || !isExistingQueryConfig) {
        throw new HttpException(
          `Errors in query config: ${JSON.stringify(errorsOccured)}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (isExistingQueryConfig) {
        this.logger.warn(
          `Allowing existing query config ${queryConfig.id} despite validation errors: ${JSON.stringify(errorsOccured)}`,
        );
      }
    }
    delete queryConfig.componentType;
    delete queryConfig.componentSubType;
    return queryConfig;
  }
}
