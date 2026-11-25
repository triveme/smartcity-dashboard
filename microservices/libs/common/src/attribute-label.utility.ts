import { ValueTranslation } from '@app/postgres-db/schemas/value-translation.schema';
function normalizeAttributeLabelKey(attribute: string): string {
  return attribute.trim().toUpperCase();
}

export function getGermanLabelForAttribute(
  attribute: string,
  translations: ValueTranslation[],
): string {
  const translatedValue = translations.find(
    (value) =>
      normalizeAttributeLabelKey(value.rawValue) ===
      normalizeAttributeLabelKey(attribute),
  );

  return translatedValue ? translatedValue.label : attribute;
}
