import {
  PipeTransform,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';

interface QueryConfigWithTypes extends QueryConfig {
  componentType?: string;
  componentSubType?: string;
  dataSourceType?: string;
}

@Injectable()
export class SanitizeQueryConfigPipe implements PipeTransform {
  transform(queryConfig: QueryConfigWithTypes): QueryConfig {
    if (queryConfig.id) {
      return queryConfig;
    }
    const errorsOccured: string[] = [];
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
      queryConfig.dataSourceType !== 'ngs-ld'
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
      queryConfig.componentType !== 'Karte' &&
      queryConfig.componentType !== 'Wert' &&
      queryConfig.componentType !== 'Slider' &&
      queryConfig.componentSubType !== '180° Chart' &&
      queryConfig.componentSubType !== '360° Chart' &&
      queryConfig.componentSubType !== 'Stageable Chart' &&
      queryConfig.componentSubType !== 'Pie Chart' &&
      queryConfig?.timeframe === 'live'
    ) {
      errorsOccured.push('Zeitwert ist erforderlich');
    }

    if (queryConfig.componentType === 'Diagram') {
      if (queryConfig.componentSubType === 'Pie Chart') {
        if (queryConfig.attributes && !(queryConfig?.attributes.length >= 3)) {
          errorsOccured.push('Pie Charts benötigen mindestens 3 Attribute');
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
      throw new HttpException(
        `Errors in query config: ${JSON.stringify(errorsOccured)}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    delete queryConfig.componentType;
    delete queryConfig.componentSubType;
    return queryConfig;
  }
}
