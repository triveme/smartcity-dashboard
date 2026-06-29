import { aggregationEnum, ChartData } from '@/types';
import { ECharts } from 'echarts';
import {
  downsampleValues,
  getVisibleDateRange,
} from '@/utils/Charts/lineChartUtil';

export type LineChartDateRange = {
  min: Date;
  max: Date;
};

export type LineChartResolution = {
  desiredPoints: number;
  intervalDays: number;
  shouldDownsample: boolean;
};

type GetDisplayedLineChartDataArgs = {
  sourceData: ChartData[];
  attribute?: string | null;
  aggregationMode?: aggregationEnum;
  dateRange?: LineChartDateRange | null;
  desiredPoints?: number;
  visibleRange?: LineChartDateRange | null;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_MIN_DESIRED_POINTS = 20;
const DEFAULT_PIXELS_PER_POINT = 8;

export function getVisibleRangeFromChart(
  chart: ECharts,
): LineChartDateRange | null {
  return getVisibleDateRange(chart);
}

export function getDesiredLineChartPointCount(
  containerWidth: number,
  minDesiredPoints = DEFAULT_MIN_DESIRED_POINTS,
  pixelsPerPoint = DEFAULT_PIXELS_PER_POINT,
): number {
  if (containerWidth <= 0) {
    return minDesiredPoints;
  }

  return Math.max(
    minDesiredPoints,
    Math.floor(containerWidth / pixelsPerPoint),
  );
}

export function filterLineChartDataByAttribute(
  chartData: ChartData[],
  attribute: string | null | undefined,
): ChartData[] {
  if (!attribute) {
    return chartData;
  }

  return chartData.filter((series) => series.name.endsWith(attribute));
}

export function filterLineChartDataByDateRange(
  chartData: ChartData[],
  dateRange: LineChartDateRange,
): ChartData[] {
  return chartData.map((series) => ({
    ...series,
    values: series.values.filter(([timestamp]) => {
      const valueTime = new Date(timestamp).getTime();

      return (
        valueTime >= dateRange.min.getTime() &&
        valueTime <= dateRange.max.getTime()
      );
    }),
  }));
}

export function getEffectiveLineChartDateRange(
  fullDateRange: LineChartDateRange,
  selectedMinDate: Date | null,
  selectedMaxDate: Date | null,
): LineChartDateRange {
  let minTime = selectedMinDate
    ? Math.max(selectedMinDate.getTime(), fullDateRange.min.getTime())
    : fullDateRange.min.getTime();
  let maxTime = selectedMaxDate
    ? Math.min(selectedMaxDate.getTime(), fullDateRange.max.getTime())
    : fullDateRange.max.getTime();

  if (minTime > maxTime) {
    maxTime = minTime;
  }

  return {
    min: new Date(minTime),
    max: new Date(maxTime),
  };
}

export function getLineChartResolution(args: {
  aggregationMode?: aggregationEnum;
  desiredPoints: number;
  visibleRange: LineChartDateRange | null;
}): LineChartResolution {
  if (!args.visibleRange || args.desiredPoints < 2) {
    return {
      desiredPoints: args.desiredPoints,
      intervalDays: 0,
      shouldDownsample: false,
    };
  }

  const totalDays = Math.max(
    (args.visibleRange.max.getTime() - args.visibleRange.min.getTime()) /
      MS_PER_DAY,
    0,
  );
  const intervalDays = totalDays / (args.desiredPoints - 1);

  return {
    desiredPoints: args.desiredPoints,
    intervalDays,
    shouldDownsample: intervalDays > 0,
  };
}

function applyLineChartResolution(
  chartData: ChartData[],
  resolution: LineChartResolution,
  aggregationMode: aggregationEnum,
): ChartData[] {
  if (!resolution.shouldDownsample) {
    return chartData;
  }

  return chartData.map((series) => ({
    ...series,
    values: downsampleValues(
      series.values,
      resolution.intervalDays,
      aggregationMode,
    ),
  }));
}

export function getDisplayedLineChartData(
  args: GetDisplayedLineChartDataArgs,
): ChartData[] {
  const attributeFilteredData = filterLineChartDataByAttribute(
    args.sourceData,
    args.attribute,
  );
  const dateFilteredData = args.dateRange
    ? filterLineChartDataByDateRange(attributeFilteredData, args.dateRange)
    : attributeFilteredData;
  const aggregationMode = args.aggregationMode ?? aggregationEnum.none;
  const resolution = getLineChartResolution({
    aggregationMode,
    desiredPoints: args.desiredPoints ?? 20,
    visibleRange: args.visibleRange ?? null,
  });

  return applyLineChartResolution(
    dateFilteredData,
    resolution,
    aggregationMode,
  );
}
