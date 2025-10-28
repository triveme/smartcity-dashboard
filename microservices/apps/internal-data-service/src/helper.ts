import { Meta } from './data/csv-parser';

export function generateAttributeKey(meta: Meta): string {
  let attrKey = '';
  for (const k in meta) {
    attrKey += `${k}: ${meta[k]};`;
  }
  return attrKey.slice(0, -1);
}
export function getValueByKeys(
  obj: Record<string, string | number>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined) {
      return value.toString();
    }
  }
  return undefined;
}
export function parseCleanNumber(input?: string): number | null {
  if (input === '' || input === undefined || input === null) return null;

  // Match optional leading minus sign, digits, optional decimal point, and more digits
  const match = input.match(/-?\d+(\.\d+)?/);

  if (match) {
    return parseFloat(match[0]);
  }

  return null; // Return null if no number can be extracted
}
