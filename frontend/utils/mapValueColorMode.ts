import { MapValueColorMode } from '@/types';

export function getMapStaticValues(
  mode: MapValueColorMode | undefined,
  numericValues?: (number | string)[] | null,
  textValues?: string[] | null,
): (number | string)[] {
  return mode === 'text' ? (textValues ?? []) : (numericValues ?? []);
}

export function getCombinedMapStaticValues(
  modes: MapValueColorMode[] | undefined,
  numericValues?: (number | string)[][] | null,
  textValues?: string[][] | null,
): (number | string)[][] {
  const sourceCount = Math.max(
    modes?.length || 0,
    numericValues?.length || 0,
    textValues?.length || 0,
  );

  return Array.from({ length: sourceCount }, (_, index) =>
    getMapStaticValues(
      modes?.[index],
      numericValues?.[index],
      textValues?.[index],
    ),
  );
}
