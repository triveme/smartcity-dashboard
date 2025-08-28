import { Injectable } from '@nestjs/common';
import { Meta, OutputEntry } from '../data/csv-parser';
import { generateAttributeKey, getValueByKeys } from '../helper';

export interface NGSIv2Entity {
  entityId: string;
  index: string[];
  values: number[];
  labels: string[];
}

export interface NGSIv2AttributeData {
  attrName: string;
  types: { entities: NGSIv2Entity[]; entityType: string }[];
}

@Injectable()
export class TransformationService {
  public transformCollection(
    jsonCollection: OutputEntry[],
    attributes: string[],
    type: string,
  ): NGSIv2AttributeData[] {
    const result: NGSIv2AttributeData[] = attributes.map((attrKey) => {
      const attrKeyEntities = [];
      for (let index = 0; index < jsonCollection.length; index++) {
        const csvEntity = jsonCollection[index];
        const indexes = [];
        const values = [];
        for (let i = 0; i < csvEntity.Values.length; i++) {
          const csvValue = csvEntity.Values[i];
          // 'name' name is handled separately to work with the existing code in the translation service
          if (attrKey === 'name') {
            indexes.push(this.convertMetaToTimeIndex(csvValue.Time));
            const nameValue = csvEntity.Descriptions.join(', ');
            values.push(nameValue);
          } else if (generateAttributeKey(csvValue.Meta) === attrKey) {
            indexes.push(this.convertMetaToTimeIndex(csvValue.Time));
            // const numberValue = parseCleanNumber(csvValue.Value?.toString());
            // values.push(numberValue);
            values.push(csvValue.Value?.toString());
          }
        }
        const entity: NGSIv2Entity = {
          entityId: csvEntity.Id,
          labels: csvEntity.Descriptions,
          index: indexes,
          values: values,
        };
        attrKeyEntities.push(entity);
      }
      const e: NGSIv2AttributeData = {
        attrName: attrKey,
        types: [
          {
            entities: attrKeyEntities,
            entityType: type,
          },
        ],
      };

      return e;
    });

    return result;
  }

  private convertMetaToTimeIndex(timeGroup: Meta): string {
    const yearValue =
      getValueByKeys(timeGroup, ['Year', 'Jahr', 'year']) || '1970';
    const monthValue =
      getValueByKeys(timeGroup, ['Monat', 'Month', 'month']) || '0';
    const dayValue = getValueByKeys(timeGroup, ['Tag', 'Day', 'day']) || '1';

    const date = new Date(
      parseInt(yearValue),
      parseInt(monthValue),
      parseInt(dayValue),
      12,
      0,
      0,
    );
    return date.toISOString();
  }
}
