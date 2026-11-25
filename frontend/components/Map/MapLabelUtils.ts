import { ValueTranslation } from '@/types';
import { convertToLocaleNumber, roundToDecimal } from '@/utils/mathHelper';

export function getFormattedDate(value: string): string {
  const date = new Date(value);
  return date.getMonth() === 0 &&
    date.getDate() === 1 &&
    date.getHours() === 1 &&
    date.getMinutes() === 0
    ? date.getFullYear().toString()
    : date.toLocaleString(navigator.language || 'de-DE', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      });
}

function normalizeSensorAttributeLabelKey(sensorAttribute: string): string {
  return sensorAttribute.trim().toUpperCase();
}

export function getGermanLabelForSensorAttribute(
  sensorAttribute: string,
  translations: ValueTranslation[],
  tenant?: string,
): string {
  const normalizedSensorAttribute =
    normalizeSensorAttributeLabelKey(sensorAttribute);
  const tenantTranslation = translations.find(
    (value) =>
      value.rawValue &&
      normalizeSensorAttributeLabelKey(value.rawValue) ===
        normalizedSensorAttribute &&
      value.tenantId === tenant,
  );
  const generalTranslation = translations.find(
    (value) =>
      value.rawValue &&
      normalizeSensorAttributeLabelKey(value.rawValue) ===
        normalizedSensorAttribute &&
      value.tenantId === null,
  );

  return (
    tenantTranslation?.label ?? generalTranslation?.label ?? sensorAttribute
  );
}

export function getValueString(
  tempValue: { value?: unknown; type?: string },
  decimalSeparator: string = '.',
  decimalPlaces: number = 1,
): string {
  if (tempValue.value === null || tempValue.value === undefined) {
    return 'Keine Daten';
  }
  // NGSI numeric values can be wrapped in a `Property` object, e.g.
  // `{ type: 'Property', value: 4.0136, observedAt: '...' }`.
  // Format the nested numeric value regardless of the wrapper type.
  if (tempValue.type === 'Number' || typeof tempValue.value === 'number') {
    return convertToLocaleNumber(
      roundToDecimal(Number(tempValue.value), decimalPlaces).toString(),
      decimalSeparator,
    );
  }
  if (Array.isArray(tempValue.value)) {
    return tempValue.value.join(', ');
  }
  return String(tempValue.value);
}
