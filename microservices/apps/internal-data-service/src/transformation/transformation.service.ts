import { Injectable } from '@nestjs/common';
import { Meta, OutputEntry } from '../data/csv-parser';
import { generateAttributeKey, getValueByKeys } from '../helper';

export interface NGSIv2Entity {
  entityId: string;
  index: string[];
  values: number[];
  labels: string[];
  timeLabels: string[];
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
        const timeLabels = [];
        for (let i = 0; i < csvEntity.Values.length; i++) {
          const csvValue = csvEntity.Values[i];
          // 'name' name is handled separately to work with the existing code in the translation service
          if (attrKey === 'name') {
            indexes.push(this.convertMetaToTimeIndex(csvValue.Time));
            timeLabels.push(this.convertMetaToTimeLabel(csvValue.Time));
            const nameValue = csvEntity.Descriptions.join(', ');
            values.push(nameValue);
          } else if (generateAttributeKey(csvValue.Meta) === attrKey) {
            indexes.push(this.convertMetaToTimeIndex(csvValue.Time));
            timeLabels.push(this.convertMetaToTimeLabel(csvValue.Time));
            values.push(csvValue.Value?.toString());
          }
        }
        const entity: NGSIv2Entity = {
          entityId: csvEntity.Id,
          labels: csvEntity.Descriptions,
          index: indexes,
          values: values,
          timeLabels: timeLabels,
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

  convertMetaToTimeLabel(timeGroup: Meta): string {
    const label = Object.entries(timeGroup)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    return label;
  }
  convertMetaToTimeIndex(timeGroup: Meta): string {
    let date: Date | undefined;
    const timestampValue =
      getValueByKeys(timeGroup, [
        'Timestamp',
        'Zeit',
        'timestamp',
        'Time',
        'time',
        '',
      ]) || undefined;

    if (timestampValue) {
      const trimmed = timestampValue.trim();
      const [datePart, timePart = '12:00'] = trimmed.split(/[T ]/);

      const patterns: {
        regex: RegExp;
        map: (match: RegExpMatchArray) => {
          year: number;
          month?: number;
          day?: number;
        };
      }[] = [
        // German full dates
        {
          regex: /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/,
          map: ([, d, m, y]) => ({ day: +d, month: +m - 1, year: +y }),
        },
        // German month/year
        {
          regex: /^(\d{1,2})[./](\d{4})$/,
          map: ([, m, y]) => ({ month: +m - 1, year: +y }),
        },
        // ISO full dates
        {
          regex: /^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/,
          map: ([, y, m, d]) => ({ year: +y, month: +m - 1, day: +d }),
        },
        // ISO year-month
        {
          regex: /^(\d{4})[./-](\d{1,2})$/,
          map: ([, y, m]) => ({ year: +y, month: +m - 1 }),
        },
        // Year only
        { regex: /^(\d{4})$/, map: ([, y]) => ({ year: +y }) },
      ];

      let parts: { year: number; month?: number; day?: number } | undefined;

      for (const { regex, map } of patterns) {
        const match = datePart.match(regex);
        if (match) {
          parts = map(match);
          break;
        }
      }

      const timeMatch = timePart.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      const hours = timeMatch ? +timeMatch[1] : 12;
      const minutes = timeMatch ? +timeMatch[2] : 0;
      const seconds = timeMatch && timeMatch[3] ? +timeMatch[3] : 0;

      date = new Date(
        parts.year,
        parts.month ?? 0,
        parts.day ?? 1,
        hours,
        minutes,
        seconds,
      );
    } else {
      let yearValue =
        getValueByKeys(timeGroup, ['Year', 'Jahr', 'year', 'Schuljahr']) ||
        '1970';

      const isRangeYearRegEx = /^(\d{4})[-](\d{4})$/;
      if (yearValue.match(isRangeYearRegEx)) {
        yearValue = yearValue.split('-')[0];
      }

      const mCSVValues = getValueByKeys(timeGroup, ['Monat', 'Month', 'month']);
      const monthValue = mCSVValues ? `${parseInt(mCSVValues) - 1}` : '0';
      const dayValue = getValueByKeys(timeGroup, ['Tag', 'Day', 'day']) || '1';

      date = new Date(
        parseInt(yearValue),
        parseInt(monthValue),
        parseInt(dayValue),
        12,
        0,
        0,
      );
    }
    return date.toISOString();
  }
}
