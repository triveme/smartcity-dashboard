import { EChartsOption } from 'echarts';
import { CARTESIAN_CHART_LAYOUT } from '@/utils/Charts/chartLayout';

type ChartAxisLabelFormatter =
  | ((value: any) => string)
  | {
      year: string;
      month: string;
      day: string;
      hour?: string;
      second?: string;
    };

type BuildChartExportToolboxArgs = {
  allowImageDownload: boolean;
  exportBackgroundColor?: string;
  iconColor: string;
  hoverColor: string;
};

type BuildCartesianGridArgs = {
  allowImageDownload: boolean;
  bottom: number;
  hideYAxis?: boolean;
  isShownInMapModal?: boolean;
  showLegend?: boolean;
  yAxisLabel?: string;
  leftWhenYAxisHidden?: number;
  leftWithYAxisLabel?: number;
  leftWithoutYAxisLabel?: number;
  topInMapModal?: number;
  topDefault?: number;
  topWithLegend?: number;
  rightWithToolbox?: number;
  rightDefault?: number;
};

type BuildTimeXAxisArgs = {
  axisFontSize: string;
  axisLabelColor: string;
  axisLabelSize: string;
  axisLineColor: string;
  axisNameColor?: string;
  formatter?: ChartAxisLabelFormatter;
  rich?: Record<string, object>;
  hasData: boolean;
  hideXAxis?: boolean;
  max?: 'dataMax' | number | string | Date;
  min?: 'dataMin' | number | string | Date;
  showAxisLabels?: boolean;
  splitNumber: number;
  xAxisLabel?: string;
  nameGapWithTitle?: number;
  nameGapWithoutTitle?: number;
};

type BuildValueYAxisArgs = {
  axisFontSize: string;
  axisLabelColor: string;
  axisLabelSize: string;
  axisLineColor: string;
  axisNameColor?: string;
  gridColor: string;
  hideYAxis?: boolean;
  interval?: number;
  max?: number;
  min?: number;
  name?: string;
  nameGap?: number;
  showSplitLine?: boolean;
  splitLineType?: 'solid' | 'dashed' | 'dotted';
  valueFormatter?: (value: number) => string;
};

type LegendPosition = 'top' | 'bottom';

type BuildHorizontalLegendArgs = {
  allowImageDownload: boolean;
  itemGap?: number;
  itemHeight?: number;
  itemWidth?: number;
  legendFontColor: string;
  legendFontSize: string;
  left?: number | string;
  position?: LegendPosition;
  right?: number | string;
  selected?: Record<string, boolean>;
  showLegend?: boolean;
  bottom?: number | string;
  top?: number | string;
  width?: number | string;
};

type BuildHorizontalDataZoomArgs = {
  allowZoom?: boolean;
  bottom?: number | string;
  endValue?: number | string;
  filterMode?: 'filter' | 'none';
  left?: number | string;
  right?: number | string;
  startValue?: number | string;
};

const SAVE_AS_IMAGE_ICON =
  'path://M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z';

export function getCartesianSplitNumber(
  containerWidth: number,
  minSplitNumber = CARTESIAN_CHART_LAYOUT.splitNumber.min,
  pixelsPerTick = CARTESIAN_CHART_LAYOUT.splitNumber.pixelsPerTick,
): number {
  return Math.max(minSplitNumber, Math.floor(containerWidth / pixelsPerTick));
}

export function buildChartExportToolbox(
  args: BuildChartExportToolboxArgs,
): EChartsOption['toolbox'] {
  if (!args.allowImageDownload) {
    return undefined;
  }

  return {
    show: true,
    feature: {
      saveAsImage: {
        backgroundColor: args.exportBackgroundColor,
        title: 'Als Bild herunterladen...    ',
        icon: SAVE_AS_IMAGE_ICON,
        iconStyle: {
          color: args.iconColor,
          borderColor: 'transparent',
          borderWidth: 0,
        },
        emphasis: {
          iconStyle: {
            color: args.hoverColor,
            borderColor: 'transparent',
            borderWidth: 0,
          },
        },
      },
    },
  };
}

export function buildCartesianGrid(
  args: BuildCartesianGridArgs,
): EChartsOption['grid'] {
  const topDefault =
    args.showLegend === true
      ? (args.topWithLegend ?? CARTESIAN_CHART_LAYOUT.grid.topWithLegend)
      : (args.topDefault ?? CARTESIAN_CHART_LAYOUT.grid.topDefault);

  return {
    top: args.isShownInMapModal
      ? (args.topInMapModal ?? CARTESIAN_CHART_LAYOUT.grid.topInMapModal)
      : topDefault,
    right: args.allowImageDownload
      ? (args.rightWithToolbox ?? CARTESIAN_CHART_LAYOUT.grid.rightWithToolbox)
      : (args.rightDefault ?? CARTESIAN_CHART_LAYOUT.grid.rightDefault),
    bottom: args.bottom,
    left:
      args.hideYAxis === true
        ? (args.leftWhenYAxisHidden ??
          CARTESIAN_CHART_LAYOUT.grid.leftWhenYAxisHidden)
        : args.yAxisLabel
          ? (args.leftWithYAxisLabel ??
            CARTESIAN_CHART_LAYOUT.grid.leftWithYAxisLabel)
          : (args.leftWithoutYAxisLabel ??
            CARTESIAN_CHART_LAYOUT.grid.leftWithoutYAxisLabel),
    containLabel: true,
  };
}

export function buildHorizontalLegend(
  args: BuildHorizontalLegendArgs,
): EChartsOption['legend'] {
  if (!args.showLegend) {
    return undefined;
  }

  const position = args.position ?? 'top';
  const legendType = position === 'bottom' ? 'plain' : 'scroll';

  return {
    type: legendType,
    orient: 'horizontal',
    ...(position === 'bottom'
      ? { bottom: args.bottom ?? CARTESIAN_CHART_LAYOUT.legend.bottom }
      : { top: args.top ?? CARTESIAN_CHART_LAYOUT.legend.top }),
    width: args.width,
    left: args.left,
    right:
      args.right ??
      (args.allowImageDownload
        ? CARTESIAN_CHART_LAYOUT.grid.rightWithToolbox
        : 'auto'),
    itemWidth: args.itemWidth,
    itemHeight: args.itemHeight,
    itemGap: args.itemGap,
    selected: args.selected,
    textStyle: {
      fontSize: args.legendFontSize,
      color: args.legendFontColor,
      lineHeight: CARTESIAN_CHART_LAYOUT.legend.lineHeight,
    },
  };
}

export function buildTopLegend(
  args: Omit<BuildHorizontalLegendArgs, 'position' | 'bottom'>,
): EChartsOption['legend'] {
  return buildHorizontalLegend({
    ...args,
    position: 'top',
  });
}

export function buildHorizontalDataZoom(
  args: BuildHorizontalDataZoomArgs,
): EChartsOption['dataZoom'] {
  if (!args.allowZoom) {
    return [];
  }

  const hasExplicitRange =
    args.startValue !== undefined && args.endValue !== undefined;

  const sharedRangeProps = hasExplicitRange
    ? {
        startValue: args.startValue,
        endValue: args.endValue,
      }
    : {
        start: 0,
        end: 100,
      };

  return [
    {
      type: 'slider',
      xAxisIndex: 0,
      filterMode: args.filterMode ?? 'filter',
      bottom: args.bottom,
      left: args.left,
      right: args.right,
      ...sharedRangeProps,
    },
    {
      type: 'inside',
      xAxisIndex: 0,
      filterMode: args.filterMode ?? 'filter',
      ...sharedRangeProps,
    },
  ];
}

export function buildTimeXAxis(
  args: BuildTimeXAxisArgs,
): EChartsOption['xAxis'] {
  const hideXAxis = args.hideXAxis ?? false;
  const showAxisLabels = args.showAxisLabels ?? true;
  const xAxisLabel = args.xAxisLabel ?? '';

  return {
    type: 'time',
    boundaryGap: [0, 0],
    splitNumber: args.splitNumber,
    min: args.hasData ? (args.min ?? 'dataMin') : undefined,
    max: args.hasData ? (args.max ?? 'dataMax') : undefined,
    name: hideXAxis ? '' : xAxisLabel,
    nameLocation: 'middle',
    nameGap: hideXAxis
      ? 0
      : xAxisLabel
        ? (args.nameGapWithTitle ??
          CARTESIAN_CHART_LAYOUT.axisTitle.xNameGapWithTitle)
        : (args.nameGapWithoutTitle ??
          CARTESIAN_CHART_LAYOUT.axisTitle.xNameGapWithoutTitle),
    nameTextStyle: {
      color: args.axisNameColor ?? args.axisLabelColor,
      fontSize: args.axisLabelSize,
    },
    axisLine: {
      show: !hideXAxis,
      lineStyle: {
        color: args.axisLineColor,
        width: 2,
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: !hideXAxis && showAxisLabels,
      color: args.axisLabelColor,
      fontSize: args.axisFontSize,
      hideOverlap: true,
      formatter: args.formatter,
      rich: args.rich,
    },
    splitLine: {
      show: false,
    },
  };
}

export function formatCompactAxisValue(value: number): string {
  const absoluteValue = Math.abs(value);
  if (absoluteValue >= 1000000) {
    return `${(value / 1000000).toFixed(1)} Mio`;
  }

  return value.toString();
}

export function buildValueYAxis(
  args: BuildValueYAxisArgs,
): EChartsOption['yAxis'] {
  const hideYAxis = args.hideYAxis ?? false;

  return {
    type: 'value',
    min: args.min,
    max: args.max,
    interval: args.interval,
    name: hideYAxis ? '' : (args.name ?? ''),
    nameLocation: 'middle',
    nameGap: hideYAxis ? 0 : args.nameGap,
    nameTextStyle: {
      color: args.axisNameColor ?? args.axisLabelColor,
      fontSize: args.axisLabelSize,
    },
    axisLine: {
      show: !hideYAxis,
      lineStyle: {
        color: args.axisLineColor,
        width: 2,
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      show: !hideYAxis,
      color: args.axisLabelColor,
      fontSize: args.axisFontSize,
      formatter: args.valueFormatter ?? formatCompactAxisValue,
    },
    splitLine: {
      show: args.showSplitLine ?? !hideYAxis,
      lineStyle: {
        color: args.gridColor,
        type: args.splitLineType ?? 'dashed',
      },
    },
  };
}
