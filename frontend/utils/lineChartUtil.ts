import { aggregationEnum, ChartData } from '@/types';
import { ECharts } from 'echarts';

export function getXMinMax(data: ChartData[]): { min: Date; max: Date } | null {
  if (!data || data.length === 0) return null;

  let minTime = Infinity;
  let maxTime = -Infinity;

  data.forEach((series) => {
    series.values.forEach(([timestamp]) => {
      const time = new Date(timestamp).getTime();
      if (time < minTime) minTime = time;
      if (time > maxTime) maxTime = time;
    });
  });

  return {
    min: new Date(minTime),
    max: new Date(maxTime),
  };
}

// TODO this loses the "string?"
export function downsampleValues(
  values: [string, number, string?][],
  intervalDays: number,
  aggregation: aggregationEnum,
): [string, number, string?][] {
  if (!values.length) return [];
  if (intervalDays == 0) return values;

  const msPerDay = 1000 * 60 * 60 * 24;

  // Sort by date (important if data is not sorted)
  const sorted = [...values].sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
  );

  const startDate = new Date(sorted[0][0]);
  const buckets: Record<number, number[]> = {};
  const bucketDates: Record<number, string> = {};

  for (const [dateStr, value] of sorted) {
    const date = new Date(dateStr);
    const daysDiff = Math.floor(
      (date.getTime() - startDate.getTime()) / msPerDay,
    );
    const bucketIndex = Math.floor(daysDiff / intervalDays);

    if (!buckets[bucketIndex]) {
      buckets[bucketIndex] = [];
      bucketDates[bucketIndex] = dateStr; // Use first date in the bucket as the representative
    }

    buckets[bucketIndex].push(value);
  }

  const aggregated: [string, number, string?][] = Object.entries(buckets).map(
    ([bucketKey, values]) => {
      const date = bucketDates[parseInt(bucketKey)];
      const aggValue = aggregate(values, aggregation);
      return [date, aggValue];
    },
  );

  return aggregated;
}

function aggregate(values: number[], type: aggregationEnum): number {
  switch (type) {
    case aggregationEnum.average:
      return parseFloat(
        (values.reduce((a, b) => a + b, 0) / values.length).toFixed(6),
      );
    case aggregationEnum.minimum:
      return Math.min(...values);
    case aggregationEnum.maximum:
      return Math.max(...values);
    case aggregationEnum.sum:
      return parseFloat(values.reduce((a, b) => a + b, 0).toFixed(6));
    case aggregationEnum.none:
    default:
      return values[0];
  }
}

export function getVisibleDateRange(
  chart: ECharts,
): { min: Date; max: Date } | null {
  const option = chart.getOption();
  if (!option) return null;

  // Support both types of xAxis (array or object)
  const xAxis = Array.isArray(option.xAxis) ? option.xAxis[0] : option.xAxis;

  // Case 1: If dataZoom is used and affects x-axis
  const dataZoom = Array.isArray(option.dataZoom)
    ? option.dataZoom[0]
    : option.dataZoom;
  if (dataZoom?.startValue != null && dataZoom?.endValue != null) {
    return {
      min: new Date(dataZoom.startValue),
      max: new Date(dataZoom.endValue),
    };
  }

  // Case 2: Try xAxis min/max (if explicitly set)
  if (xAxis?.min != null && xAxis?.max != null) {
    return {
      min: new Date(xAxis.min as string | number),
      max: new Date(xAxis.max as string | number),
    };
  }

  return null;
}

export function setVisibleDateRange(
  chart: ECharts,
  min: Date,
  max: Date,
): void {
  chart.setOption({
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none',
        startValue: min.getTime(),
        endValue: max.getTime(),
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        filterMode: 'none',
        startValue: min.getTime(),
        endValue: max.getTime(),
      },
    ],
  });
}

export function getIntervalDaysFromChart(
  chart: ECharts,
  desiredPoints: number,
  range: { min: Date; max: Date },
): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = (range.max.getTime() - range.min.getTime()) / msPerDay;
  const intervalDays = totalDays / (desiredPoints - 1);

  return intervalDays;
}

export function getLegendOptions(
  allowImageDownload: boolean,
  legendAlignment: string,
  legendFontSize: string,
  legendFontColor: string,
  singleSelectLegend?: boolean,
  showLegend?: boolean,
  advancedDateSelection?: boolean,
): echarts.LegendComponentOption {
  if (singleSelectLegend) {
    return {
      type: 'plain',
      orient: legendAlignment === 'Top' ? 'horizontal' : 'horizontal',
      show: showLegend,
      textStyle: {
        fontSize: legendFontSize,
        color: legendFontColor,
      },
      bottom: advancedDateSelection ? 120 : 65,
      selectedMode: true,
    };
  }
  return {
    type: 'scroll',
    orient: legendAlignment === 'Top' ? 'horizontal' : 'horizontal',
    show: showLegend,
    textStyle: {
      fontSize: legendFontSize,
      color: legendFontColor,
    },
    right: allowImageDownload ? '30' : 'auto',
    selectedMode: 'multiple',
  };
}

export function getGridOptions(
  isShownInMapModal: boolean,
  hasEndLabel: echarts.LineSeriesOption | undefined,
  legendFontSize: number,
  lGrid: number,
  bGrid: number,
): echarts.GridComponentOption {
  return {
    left: isShownInMapModal ? 10 : lGrid,
    right: hasEndLabel ? 100 * (14 / legendFontSize) : 10,
    top: isShownInMapModal ? 20 : 30,
    bottom: isShownInMapModal ? 20 : bGrid,
    containLabel: true,
  };
}
