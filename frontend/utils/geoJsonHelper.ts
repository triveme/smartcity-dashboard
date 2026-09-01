import type { ChartData } from '@/types';
import type { GeoJSONSensorData } from '@/types/mapRelatedModels';

export function getFirstGeoJSONSensorData(
  chartData?: ChartData[],
): GeoJSONSensorData[] {
  return (chartData ?? []).flatMap((entry) => {
    const id = entry.id?.trim();
    if (!id) {
      return [];
    }

    return [{ id, value: entry.values[0]?.[1] }];
  });
}
