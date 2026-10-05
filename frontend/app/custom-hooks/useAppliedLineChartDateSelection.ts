import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChartData } from '@/types';
import {
  getDisplayedLineChartData,
  getEffectiveLineChartDateRange,
  LineChartDateRange,
} from '@/utils/Charts/lineChartZoom';

type AppliedDateSelection = {
  dateRange: LineChartDateRange;
  data: ChartData[] | null;
};

type AppliedLineChartDateSelectionOptions = {
  baseData: ChartData[];
  fullDateRange: LineChartDateRange | null;
  effectiveDateRange: LineChartDateRange | null;
  isEnabled: boolean;
  extendedDateSelection: boolean;
};

function containsDateRange(
  availableRange: LineChartDateRange,
  dateRange: LineChartDateRange,
): boolean {
  return (
    dateRange.min >= availableRange.min && dateRange.max <= availableRange.max
  );
}

function mergeChartData(
  historicData: ChartData[],
  baseData: ChartData[],
): ChartData[] {
  const seriesByKey = new Map<string, ChartData>();

  [...historicData, ...baseData].forEach((series) => {
    const key = JSON.stringify([series.id, series.name]);
    const existingSeries = seriesByKey.get(key);
    const valuesByTime = new Map<number, ChartData['values'][number]>();

    [...(existingSeries?.values ?? []), ...series.values].forEach((value) => {
      valuesByTime.set(new Date(value[0]).getTime(), value);
    });

    seriesByKey.set(key, {
      ...series,
      values: [...valuesByTime.entries()]
        .sort(([firstTime], [secondTime]) => firstTime - secondTime)
        .map(([, value]) => value),
    });
  });

  return [...seriesByKey.values()];
}

export function useAppliedLineChartDateSelection({
  baseData,
  fullDateRange,
  effectiveDateRange,
  isEnabled,
  extendedDateSelection,
}: AppliedLineChartDateSelectionOptions): {
  chartData: ChartData[];
  applyDateSelection: (
    dateRange: LineChartDateRange,
    data: ChartData[] | null,
  ) => void;
  tryApplyAvailableDateSelection: (dateRange: LineChartDateRange) => boolean;
} {
  const [appliedDateSelection, setAppliedDateSelection] =
    useState<AppliedDateSelection | null>(null);
  const [historicSelection, setHistoricSelection] =
    useState<AppliedDateSelection | null>(null);

  useEffect(() => {
    if (!isEnabled || !extendedDateSelection) {
      setAppliedDateSelection(null);
      setHistoricSelection(null);
    }
  }, [extendedDateSelection, isEnabled]);

  const chartData = useMemo(() => {
    if (isEnabled && extendedDateSelection && appliedDateSelection?.data) {
      return getDisplayedLineChartData({
        sourceData: appliedDateSelection.data,
        dateRange: appliedDateSelection.dateRange,
      });
    }

    const dateRange = extendedDateSelection
      ? isEnabled && appliedDateSelection && fullDateRange
        ? getEffectiveLineChartDateRange(
            fullDateRange,
            appliedDateSelection.dateRange.min,
            appliedDateSelection.dateRange.max,
          )
        : null
      : effectiveDateRange;

    return dateRange
      ? getDisplayedLineChartData({ sourceData: baseData, dateRange })
      : baseData;
  }, [
    appliedDateSelection,
    baseData,
    effectiveDateRange,
    extendedDateSelection,
    fullDateRange,
    isEnabled,
  ]);

  const applyDateSelection = useCallback(
    (dateRange: LineChartDateRange, data: ChartData[] | null): void => {
      setAppliedDateSelection({ dateRange, data });
      if (data !== null) {
        setHistoricSelection({ dateRange, data });
      }
    },
    [],
  );

  const tryApplyAvailableDateSelection = useCallback(
    (dateRange: LineChartDateRange): boolean => {
      if (
        !isEnabled ||
        !extendedDateSelection ||
        !Number.isFinite(dateRange.min.getTime()) ||
        !Number.isFinite(dateRange.max.getTime()) ||
        dateRange.min > dateRange.max
      ) {
        return false;
      }

      if (fullDateRange && containsDateRange(fullDateRange, dateRange)) {
        setAppliedDateSelection({ dateRange, data: null });
        return true;
      }

      if (!historicSelection || historicSelection.data === null) return false;

      if (containsDateRange(historicSelection.dateRange, dateRange)) {
        setAppliedDateSelection({ dateRange, data: historicSelection.data });
        return true;
      }

      if (
        fullDateRange &&
        historicSelection.dateRange.min <= fullDateRange.max &&
        historicSelection.dateRange.max >= fullDateRange.min &&
        containsDateRange(
          {
            min: new Date(
              Math.min(
                fullDateRange.min.getTime(),
                historicSelection.dateRange.min.getTime(),
              ),
            ),
            max: new Date(
              Math.max(
                fullDateRange.max.getTime(),
                historicSelection.dateRange.max.getTime(),
              ),
            ),
          },
          dateRange,
        )
      ) {
        setAppliedDateSelection({
          dateRange,
          data: mergeChartData(historicSelection.data, baseData),
        });
        return true;
      }

      return false;
    },
    [
      baseData,
      extendedDateSelection,
      fullDateRange,
      historicSelection,
      isEnabled,
    ],
  );

  return { chartData, applyDateSelection, tryApplyAvailableDateSelection };
}
