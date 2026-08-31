import { EChartsOption } from 'echarts';
import { echarts } from '@/utils/Charts/echartsClient';
import {
  buildCartesianGrid,
  buildChartExportToolbox,
  buildBottomPlainLegend,
  buildHorizontalDataZoom,
  buildTopScrollLegend,
  buildTimeXAxis,
  buildValueYAxis,
  getCartesianSplitNumber,
} from '@/utils/Charts/cartesianChartOptions';
import {
  CARTESIAN_CHART_LAYOUT,
  LINE_CHART_LAYOUT,
} from '@/utils/Charts/chartLayout';
import { ChartData } from '@/types';
import {
  calculateMaxYAxisValue,
  calculateMinYAxisValue,
  calculateYAxisNameGap,
  formatTickByAggrPeriod,
  formatYAxisLabel,
  getAdaptiveWeekdayFormatter,
  getChartDateFormatter,
  getChartDateRichText,
  getXAxisBounds,
  getLabelMap,
} from '@/utils/Charts/chartHelper';
import { getHorizontalLegendLayout } from '@/utils/Charts/legendLayout';
import { LineChartDateRange } from '@/utils/Charts/lineChartZoom';
import { generateTooltipContent } from '@/utils/chartTooltipHelper';
import { getXMinMax } from '@/utils/Charts/lineChartUtil';

export type BuildLineChartOptionProps = {
  allowImageDownload: boolean;
  allowZoom?: boolean;
  axisFontSize: string;
  axisLabelFontColor: string;
  axisLabelSize: string;
  axisLineColor: string;
  axisTicksFontColor: string;
  chartData: ChartData[];
  chartDateRepresentation?: string;
  chartHasAutomaticZoom?: boolean;
  chartHoverSingleValue?: boolean;
  chartYAxisScale?: number;
  chartYAxisScaleChartMaxValue?: number;
  chartYAxisScaleChartMinValue?: number;
  currentValuesColors: string[];
  decimalPlaces?: number;
  exportBackgroundColor?: string;
  gridColor: string;
  hideTimeDetails?: boolean;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  highlightedColor?: string;
  isShownInMapModal?: boolean;
  isStackedChart: boolean;
  isStepline?: boolean;
  legendFontColor: string;
  legendFontSize: string;
  legendAlignment: string;
  menuHoverColor: string;
  legendSelectedMap?: Record<string, boolean>;
  measuredBottomLegendHeight?: number | null;
  playAnimation?: boolean;
  setXByTimeFramePeriod?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  singleSelectLegend?: boolean;
  staticValues: number[];
  staticValuesColors: string[];
  staticValuesTexts?: string[];
  staticValuesTicks?: number[];
  timeFramePeriod?: string | null;
  unhighlightedColor?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
};

function hasSeriesData(chartData: ChartData[]): boolean {
  return chartData.some((series) => series.values.length > 0);
}

function buildSeries(
  props: Pick<
    BuildLineChartOptionProps,
    | 'chartData'
    | 'currentValuesColors'
    | 'highlightedColor'
    | 'isShownInMapModal'
    | 'isStackedChart'
    | 'isStepline'
    | 'unhighlightedColor'
  >,
): echarts.LineSeriesOption[] {
  const {
    chartData,
    currentValuesColors,
    highlightedColor,
    isShownInMapModal = false,
    unhighlightedColor,
  } = props;

  return chartData.map((series, index) => {
    const baseColor =
      series.color ||
      currentValuesColors[index % Math.max(currentValuesColors.length, 1)] ||
      '#70AAFF';
    const resolvedColor =
      series.highlighted === undefined
        ? baseColor
        : series.highlighted
          ? highlightedColor || baseColor
          : unhighlightedColor || baseColor;

    return {
      name: series.name,
      type: 'line',
      data: series.values,
      step: props.isStepline ? 'start' : undefined,
      stack: props.isStackedChart ? 'total' : undefined,
      symbolSize: isShownInMapModal ? 0 : 5,
      lineStyle: {
        width: isShownInMapModal ? 2 : 3,
      },
      color: resolvedColor,
      ...(series.highlighted !== undefined && {
        itemStyle: {
          borderWidth: 2,
        },
      }),
    };
  });
}

function buildStaticValueSeries(
  props: Pick<
    BuildLineChartOptionProps,
    | 'chartData'
    | 'legendFontColor'
    | 'legendFontSize'
    | 'staticValues'
    | 'staticValuesColors'
    | 'staticValuesTexts'
    | 'staticValuesTicks'
  >,
): echarts.LineSeriesOption[] {
  const {
    chartData,
    legendFontColor,
    legendFontSize,
    staticValues,
    staticValuesColors,
    staticValuesTexts = [],
    staticValuesTicks = [],
  } = props;

  if (
    !chartData.length ||
    !chartData[0]?.values?.length ||
    !staticValues.length
  ) {
    return [];
  }

  return staticValues.map((value, index) => ({
    data: chartData[0].values.map(([timestamp]) => [timestamp, value]),
    type: 'line',
    symbol: 'none',
    lineStyle: {
      color: staticValuesColors[index],
      type: 'solid',
    },
    tooltip: {
      show: false,
    },
    endLabel: {
      show: staticValuesTicks.includes(value),
      formatter: (): string =>
        staticValuesTexts[
          staticValuesTicks.findIndex((tick) => tick == value)
        ] || '',
      fontSize: legendFontSize,
      color: legendFontColor,
    },
  }));
}

function getYAxisBounds(
  chartData: ChartData[],
  props: Pick<
    BuildLineChartOptionProps,
    | 'chartHasAutomaticZoom'
    | 'chartYAxisScale'
    | 'chartYAxisScaleChartMaxValue'
    | 'chartYAxisScaleChartMinValue'
  >,
  decimalPlaces: number,
): { min?: number; max?: number } {
  const { chartHasAutomaticZoom = false, chartYAxisScale } = props;

  if (!hasSeriesData(chartData)) {
    return {};
  }

  if (chartYAxisScale !== undefined) {
    return {
      min: props.chartYAxisScaleChartMinValue,
      max: props.chartYAxisScaleChartMaxValue,
    };
  }

  if (!chartHasAutomaticZoom) {
    return {};
  }

  return {
    min: calculateMinYAxisValue(chartData, decimalPlaces),
    max: calculateMaxYAxisValue(chartData, decimalPlaces),
  };
}

function getYAxisNameGap(chartData: ChartData[]): number {
  return hasSeriesData(chartData) ? calculateYAxisNameGap(chartData) : 45;
}

function getGridBottom(
  props: Pick<
    BuildLineChartOptionProps,
    | 'allowZoom'
    | 'hideXAxis'
    | 'showLegend'
    | 'singleSelectLegend'
    | 'xAxisLabel'
  >,
  bottomLegendReserve: number,
): number {
  const hasBottomLegend =
    props.showLegend === true && props.singleSelectLegend === true;

  if (props.allowZoom ?? false) {
    return hasBottomLegend
      ? LINE_CHART_LAYOUT.grid.bottomWithZoomBar + bottomLegendReserve
      : LINE_CHART_LAYOUT.grid.bottomWithZoomBar;
  }

  if (props.hideXAxis ?? false) {
    return hasBottomLegend
      ? LINE_CHART_LAYOUT.grid.bottomWhenXAxisHidden + bottomLegendReserve
      : LINE_CHART_LAYOUT.grid.bottomWhenXAxisHidden;
  }

  const baseBottom = props.xAxisLabel
    ? LINE_CHART_LAYOUT.grid.bottomWithXAxisTitle
    : LINE_CHART_LAYOUT.grid.bottomWhenXAxisHidden;

  return hasBottomLegend ? baseBottom + bottomLegendReserve : baseBottom;
}

export function buildLineChartOption(
  props: BuildLineChartOptionProps,
  containerWidth: number,
  visibleRange: LineChartDateRange | null,
): EChartsOption {
  const {
    allowImageDownload,
    allowZoom = false,
    axisFontSize,
    axisLabelFontColor,
    axisLabelSize,
    axisLineColor,
    axisTicksFontColor,
    chartData,
    chartDateRepresentation = 'Default',
    chartHoverSingleValue = false,
    chartYAxisScale,
    decimalPlaces = 0,
    gridColor,
    hideTimeDetails = false,
    hideXAxis = false,
    hideYAxis = false,
    isShownInMapModal = false,
    showLegend = false,
    singleSelectLegend = false,
    menuHoverColor,
    playAnimation = true,
    setXByTimeFramePeriod = false,
    showTooltip = true,
    timeFramePeriod = null,
    legendFontColor,
    legendFontSize,
    xAxisLabel = '',
    yAxisLabel = '',
  } = props;
  const splitNumber = getCartesianSplitNumber(containerWidth);
  const dynamicSeries = buildSeries(props);
  const staticValueSeries = buildStaticValueSeries(props);
  const chartSeries = [...dynamicSeries, ...staticValueSeries];
  const labelMap = getLabelMap(chartDateRepresentation, chartSeries);
  const hasData = hasSeriesData(chartData);
  const yAxisBounds = getYAxisBounds(chartData, props, decimalPlaces);
  const xAxisBounds = getXAxisBounds(
    chartData,
    timeFramePeriod ?? 'live',
    setXByTimeFramePeriod,
  );
  const xAxisRange =
    xAxisBounds.min !== undefined && xAxisBounds.max !== undefined
      ? {
          min: new Date(xAxisBounds.min),
          max: new Date(xAxisBounds.max),
        }
      : getXMinMax(chartData);
  const hasEndLabel = staticValueSeries.some((series) => series.endLabel?.show);
  const weekdayFormatter =
    chartDateRepresentation === 'Weekdays'
      ? getAdaptiveWeekdayFormatter(
          containerWidth / Math.max(splitNumber, 1),
          axisFontSize,
        )
      : undefined;
  const normalizedTimeFramePeriod = timeFramePeriod ?? undefined;
  const legendFontSizeNumber =
    Number.parseInt(legendFontSize, 10) ||
    LINE_CHART_LAYOUT.staticEndLabel.fallbackLegendFontSize;
  const hasYAxisTitle = !hideYAxis && Boolean(yAxisLabel?.trim());
  const dataZoomLeftInset = hideYAxis
    ? LINE_CHART_LAYOUT.dataZoom.leftInsetDefault
    : hasYAxisTitle
      ? LINE_CHART_LAYOUT.dataZoom.leftInsetWithYAxisTitle
      : LINE_CHART_LAYOUT.dataZoom.leftInsetDefault;
  const dataZoomRightInset = allowImageDownload
    ? LINE_CHART_LAYOUT.dataZoom.rightInsetWithToolbox
    : LINE_CHART_LAYOUT.dataZoom.rightInsetDefault;
  const isBottomLegend = showLegend && singleSelectLegend;
  const topLegendLeftInset = 0;
  const topLegendRightInset = allowImageDownload
    ? CARTESIAN_CHART_LAYOUT.grid.rightWithToolbox
    : CARTESIAN_CHART_LAYOUT.grid.rightDefault;
  const topLegendWidth = Math.max(
    containerWidth - topLegendLeftInset - topLegendRightInset,
    1,
  );
  const bottomLegendWidth = Math.max(
    containerWidth - dataZoomLeftInset - dataZoomRightInset,
    1,
  );
  const bottomLegendLayout = isBottomLegend
    ? getHorizontalLegendLayout({
        fontSize: legendFontSize,
        iconTextGap: CARTESIAN_CHART_LAYOUT.legend.iconTextGap,
        itemGap: CARTESIAN_CHART_LAYOUT.legend.itemGap,
        itemWidth: CARTESIAN_CHART_LAYOUT.legend.itemWidth,
        items: dynamicSeries
          .map((series) => series.name)
          .filter(
            (name): name is string => typeof name === 'string' && name !== '',
          ),
        maxWidth: bottomLegendWidth,
        rowHeight: CARTESIAN_CHART_LAYOUT.legend.rowHeight,
        verticalPadding: CARTESIAN_CHART_LAYOUT.legend.verticalPadding,
      })
    : null;
  const measuredBottomLegendHeight =
    isBottomLegend &&
    props.measuredBottomLegendHeight !== undefined &&
    props.measuredBottomLegendHeight !== null &&
    Number.isFinite(props.measuredBottomLegendHeight) &&
    props.measuredBottomLegendHeight > 0
      ? Math.ceil(props.measuredBottomLegendHeight)
      : null;
  const estimatedBottomLegendHeight = bottomLegendLayout
    ? Math.max(
        bottomLegendLayout.height,
        CARTESIAN_CHART_LAYOUT.legend.reservedHeight,
      )
    : 0;
  const bottomLegendHeight =
    measuredBottomLegendHeight ?? estimatedBottomLegendHeight;
  const extraLegendZoomGap = bottomLegendLayout
    ? Math.max(
        0,
        bottomLegendLayout.rowCount -
          CARTESIAN_CHART_LAYOUT.legend.zoomGapStartRow +
          1,
      ) * CARTESIAN_CHART_LAYOUT.legend.zoomGapPerAdditionalRow
    : 0;
  const bottomLegendReserve =
    bottomLegendHeight + (allowZoom ? extraLegendZoomGap : 0);
  const dataZoomBottomOffset = isBottomLegend
    ? bottomLegendReserve + LINE_CHART_LAYOUT.dataZoom.bottomOffset
    : LINE_CHART_LAYOUT.dataZoom.bottomOffset;

  return {
    animation: playAnimation,
    animationDuration: 2000,
    animationEasing: 'cubicOut',
    animationDelay: 0,
    animationDurationUpdate: 0,
    animationEasingUpdate: 'cubicOut',
    grid: buildCartesianGrid({
      allowImageDownload,
      bottom: getGridBottom(props, bottomLegendReserve),
      hideYAxis,
      isShownInMapModal,
      leftWithYAxisLabel: LINE_CHART_LAYOUT.grid.leftWithYAxisTitle,
      rightDefault: hasEndLabel
        ? LINE_CHART_LAYOUT.staticEndLabel.rightReserveBase *
          (LINE_CHART_LAYOUT.staticEndLabel.rightReserveFontBase /
            Math.max(legendFontSizeNumber, 1))
        : 8,
      showLegend: showLegend && !isBottomLegend,
      yAxisLabel,
    }),
    legend: isBottomLegend
      ? buildBottomPlainLegend({
          allowImageDownload,
          bottom: LINE_CHART_LAYOUT.legend.bottom,
          itemGap: CARTESIAN_CHART_LAYOUT.legend.itemGap,
          itemHeight: CARTESIAN_CHART_LAYOUT.legend.itemHeight,
          itemWidth: CARTESIAN_CHART_LAYOUT.legend.itemWidth,
          legendFontColor,
          legendFontSize,
          left: dataZoomLeftInset,
          right: dataZoomRightInset,
          selected: props.legendSelectedMap,
          showLegend,
          width: bottomLegendWidth,
        })
      : buildTopScrollLegend({
          allowImageDownload,
          legendFontColor,
          legendFontSize,
          left: topLegendLeftInset,
          right: topLegendRightInset,
          selected: props.legendSelectedMap,
          showLegend,
          width: topLegendWidth,
        }),
    toolbox: buildChartExportToolbox({
      allowImageDownload,
      exportBackgroundColor: props.exportBackgroundColor,
      iconColor: axisLabelFontColor,
      hoverColor: menuHoverColor,
    }),
    tooltip: {
      show: showTooltip,
      trigger: chartHoverSingleValue ? 'item' : 'axis',
      formatter: (params: unknown) =>
        generateTooltipContent(
          params,
          decimalPlaces,
          hideTimeDetails,
          labelMap,
        ),
    },
    dataZoom: buildHorizontalDataZoom({
      allowZoom,
      bottom: dataZoomBottomOffset,
      endValue: visibleRange?.max.getTime(),
      filterMode: 'none',
      left: dataZoomLeftInset,
      right: dataZoomRightInset,
      startValue: visibleRange?.min.getTime(),
    }),
    xAxis: buildTimeXAxis({
      axisFontSize,
      axisLabelColor: axisTicksFontColor,
      axisLabelSize,
      axisLineColor,
      axisNameColor: axisLabelFontColor,
      formatter:
        setXByTimeFramePeriod && normalizedTimeFramePeriod
          ? (value: number | string): string =>
              formatTickByAggrPeriod(
                value,
                normalizedTimeFramePeriod,
                xAxisRange,
              )
          : weekdayFormatter
            ? weekdayFormatter
            : chartDateRepresentation
              ? getChartDateFormatter(chartDateRepresentation, labelMap)
              : undefined,
      hasData,
      hideXAxis,
      max: xAxisBounds.max,
      min: xAxisBounds.min,
      rich:
        setXByTimeFramePeriod && normalizedTimeFramePeriod
          ? undefined
          : getChartDateRichText(chartDateRepresentation),
      splitNumber,
      xAxisLabel,
    }),
    yAxis: buildValueYAxis({
      axisFontSize,
      axisLabelColor: axisTicksFontColor,
      axisLabelSize,
      axisLineColor,
      axisNameColor: axisLabelFontColor,
      gridColor,
      hideYAxis,
      interval:
        chartYAxisScale !== undefined && chartYAxisScale !== 0
          ? chartYAxisScale
          : undefined,
      max: yAxisBounds.max,
      min: yAxisBounds.min,
      name: formatYAxisLabel(yAxisLabel),
      nameGap: getYAxisNameGap(chartData),
    }),
    series: chartSeries,
  };
}
