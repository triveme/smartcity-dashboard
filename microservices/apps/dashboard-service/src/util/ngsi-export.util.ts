import { getGermanLabelForAttribute } from '@app/common';
import { ValueTranslation } from '@app/postgres-db/schemas/value-translation.schema';

export type FlattenedNgsiExportRow = {
  entityId: string;
  attrName: string;
  value: number | string;
  index: string | null;
  seriesName: string;
};

type NgsiDataItem = {
  attrs?: NgsiAttribute[];
  attributes?: NgsiAttribute[];
  entityId?: string;
  index?: string[];
};

type NgsiEntity = {
  entityId?: string;
  index?: string[];
  values?: (number | string)[];
};

type NgsiAttribute = {
  attrName?: string;
  values?: (number | string)[];
  types?: Array<{
    entities?: NgsiEntity[];
  }>;
};

export function flattenNgsiExportData(
  rawDataArray: unknown[],
  queryAttributes: string[],
  translations: ValueTranslation[],
): FlattenedNgsiExportRow[] {
  const isSingleAttribute =
    queryAttributes.filter((attribute) => attribute !== 'name').length === 1;

  return rawDataArray.flatMap((rawDataItem) => {
    const dataItem = rawDataItem as NgsiDataItem;
    const attributes = dataItem.attrs || dataItem.attributes;

    if (!attributes) {
      console.warn('Missing attrs/attributes in rawData item');
      return [];
    }

    const entityLabels = getEntityLabels(attributes, translations);

    return attributes.flatMap((attr) => {
      const attrName = attr.attrName || '';

      if (!attr.types || !Array.isArray(attr.types)) {
        console.warn(
          `Missing types for attribute: ${attrName}. Processing without types.`,
        );

        return (attr.values || []).map((value, index) => ({
          entityId: dataItem.entityId,
          attrName,
          value,
          index: dataItem.index ? dataItem.index[index] : null,
          seriesName: getGermanLabelForAttribute(attrName, translations),
        }));
      }

      return attr.types.flatMap((type) =>
        (type.entities || []).flatMap((entity) => {
          const entityId = entity.entityId || '';
          const sensorLabel = entityLabels.get(entityId) || entityId;
          const seriesName = buildSeriesName(
            attrName,
            sensorLabel,
            isSingleAttribute,
            translations,
          );
          const indexValues = entity.index || [];
          const entityValues = entity.values || [];

          return entityValues.map((value, i) => ({
            entityId,
            attrName,
            value,
            index: indexValues[i] || null,
            seriesName,
          }));
        }),
      );
    });
  });
}

function getEntityLabels(
  attributes: NgsiAttribute[],
  translations: ValueTranslation[],
): Map<string, string> {
  const labels = new Map<string, string>();

  appendLabelsByAttribute(labels, attributes, 'name', translations);
  appendLabelsByAttribute(labels, attributes, 'id', translations);

  return labels;
}

function appendLabelsByAttribute(
  labels: Map<string, string>,
  attributes: NgsiAttribute[],
  targetAttribute: string,
  translations: ValueTranslation[],
): void {
  const attribute = attributes.find(
    (item) => item.attrName === targetAttribute,
  );

  if (!attribute?.types) {
    return;
  }

  attribute.types.forEach((type) => {
    (type.entities || []).forEach((entity) => {
      const entityId = entity.entityId;
      const rawLabel = entity.values?.[entity.values.length - 1];

      if (!entityId || rawLabel === undefined || rawLabel === null) {
        return;
      }

      if (!labels.has(entityId)) {
        labels.set(
          entityId,
          getGermanLabelForAttribute(String(rawLabel), translations),
        );
      }
    });
  });
}

function buildSeriesName(
  attrName: string,
  sensorLabel: string,
  isSingleAttribute: boolean,
  translations: ValueTranslation[],
): string {
  const formattedSensorLabel = getGermanLabelForAttribute(
    sensorLabel,
    translations,
  );

  if (isSingleAttribute) {
    return formattedSensorLabel;
  }

  return `${formattedSensorLabel} | ${getGermanLabelForAttribute(attrName, translations)}`;
}
