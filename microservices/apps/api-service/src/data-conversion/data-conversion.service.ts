import { Injectable } from '@nestjs/common';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';

@Injectable()
export class DataConversionService {
  convertToNgsi(
    queryConfig: QueryConfig,
    newData: object | object[],
  ): object | object[] {
    if (Array.isArray(newData)) {
      newData = newData.sort(
        (a, b) => Date.parse(a['timestamp']) - Date.parse(b['timestamp']),
      );

      if (queryConfig.timeframe !== 'live') {
        return this.convertToNgsiQuantumLeapObject(
          queryConfig,
          newData as object[],
        );
      } else if (queryConfig.timeframe === 'live') {
        return this.convertToNgsiArray(newData as object[]);
      }
    } else {
      return this.convertToNgsiObject(newData);
    }
  }

  private convertToNgsiArray(newData: Array<object>): object[] {
    const convertedData: object[] = [];

    for (const dataObject of newData) {
      convertedData.push(this.convertToNgsiObject(dataObject));
    }

    return convertedData;
  }

  private convertToNgsiQuantumLeapObject(
    queryConfig: QueryConfig,
    newData: Array<object>,
  ): object {
    if (newData.length > 0 && queryConfig.entityIds.length === 1) {
      return this.convertToNgsiQuantumLeapObjectForSingleEntity(
        queryConfig,
        newData,
      );
    } else if (newData.length > 0 && queryConfig.entityIds.length > 1) {
      return this.convertToNgsiQuantumLeapObjectForMultipleEntities(
        queryConfig,
        newData,
      );
    }
  }

  private convertToNgsiObject(newDataObject: object): object {
    const convertedData: object = {};

    for (const key in newDataObject) {
      this.convertToLiveNgsiValueObject(newDataObject, key, convertedData);
    }

    return convertedData;
  }

  private convertToNgsiQuantumLeapObjectForSingleEntity(
    queryConfig: QueryConfig,
    newData: Array<object>,
  ): object {
    const convertedData: object = {};

    convertedData['entityId'] = newData[0]['id'];
    convertedData['entityType'] = queryConfig.fiwareType;
    convertedData['index'] = this.buildIndexArray(newData);
    convertedData['attributes'] = [];

    for (const attribute of queryConfig.attributes) {
      const attributes = this.createQuantumLeapObjectAttributeForSingleEntity(
        attribute,
        newData,
      );
      convertedData['attributes'].push(attributes);
    }

    return convertedData;
  }

  private convertToNgsiQuantumLeapObjectForMultipleEntities(
    queryConfig: QueryConfig,
    newData: Array<object>,
  ): object {
    const convertedData: object = {};
    convertedData['attrs'] = [];

    for (const attribute of queryConfig.attributes) {
      const attributeObject =
        this.createQuantumLeapObjectAttributeForMultipleEntities(
          attribute,
          queryConfig,
          newData,
        );
      convertedData['attrs'].push(attributeObject);
    }

    return convertedData;
  }

  private convertToLiveNgsiValueObject(
    newData: object,
    key: string,
    convertedData: object,
  ): void {
    const value = newData[key];

    if (key === 'position') {
      convertedData[key] = {
        value: value['coordinates'].join(','),
        type: 'geo:point',
      };
    } else if (key === 'id') {
      convertedData[key] = value;
    } else if (key !== 'timestamp') {
      convertedData[key] = {
        value: value,
        type: isNaN(Number(value)) ? 'Text' : 'Number',
      };
    }
  }

  private createQuantumLeapObjectAttributeForSingleEntity(
    attribute: string,
    newData: Array<object>,
  ): object {
    const attributeObject = {};

    attributeObject['attrName'] = attribute;
    attributeObject['values'] = [];

    for (const dataObject of newData) {
      const value = dataObject[attribute];

      attributeObject['values'].push(value ? value : '');
    }

    return attributeObject;
  }

  private createQuantumLeapObjectAttributeForMultipleEntities(
    attribute: string,
    queryConfig: QueryConfig,
    newData: Array<object>,
  ): object {
    const attributeObject = {};

    attributeObject['attrName'] = attribute;
    attributeObject['types'] = [];

    /**
     * Types is an array but supported at the moment is only
     * one type per configuration
     */
    const typeObject = {};
    typeObject['entityType'] = queryConfig.fiwareType;
    typeObject['entities'] = [];

    for (const entityId of queryConfig.entityIds) {
      this.createQuantumLeapObjectEntityForMultipleEntities(
        newData,
        entityId,
        typeObject,
        attribute,
      );
    }

    attributeObject['types'].push(typeObject);

    return attributeObject;
  }

  private createQuantumLeapObjectEntityForMultipleEntities(
    newData: Array<object>,
    entityId: string,
    typeObject: object,
    attribute: string,
  ): void {
    const entityObject = {};
    const entityValues = newData.filter((data) => data['id'] === entityId);

    if (entityValues.length > 0) {
      entityObject['index'] = this.buildIndexArray(newData);
      entityObject['entityId'] = entityValues[0]['id'];
      entityObject['index'] = this.buildIndexArray(entityValues);
      entityObject['values'] = entityValues.map((data) => data[attribute]);

      typeObject['entities'].push(entityObject);
    }
  }

  private buildIndexArray(newData: Array<object>): Array<string> {
    const indexArray = [];

    for (const dataObject of newData) {
      indexArray.push(dataObject['timestamp']);
    }

    return indexArray;
  }
}
