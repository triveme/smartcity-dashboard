import { tabComponentSubTypeEnum } from '@/types';

export const CUSTOM_MAP_STANDARD_ZOOM_OFFSET_DEFAULT = 0;
export const CUSTOM_MAP_MIN_ZOOM_OFFSET_DEFAULT = -1;
export const CUSTOM_MAP_MAX_ZOOM_OFFSET_DEFAULT = 4;

export function isCustomMapSubType(componentSubType?: string | null): boolean {
  return componentSubType === tabComponentSubTypeEnum.custom_map;
}

export function resolveMapZoomSetting(
  value: number | undefined | null,
  componentSubType: string | undefined | null,
  defaultValue: number,
  customMapDefault: number,
): number {
  return (
    value ??
    (isCustomMapSubType(componentSubType) ? customMapDefault : defaultValue)
  );
}
