export const CARTESIAN_CHART_LAYOUT = {
  splitNumber: {
    min: 3,
    pixelsPerTick: 120,
  },
  grid: {
    topDefault: 20,
    topWithLegend: 56,
    topInMapModal: 12,
    rightDefault: 8,
    rightWithToolbox: 32,
    leftWithoutYAxisLabel: 10,
    leftWithYAxisLabel: 16,
    leftWhenYAxisHidden: 8,
  },
  legend: {
    top: 0,
    bottom: 0,
    lineHeight: 16,
    reservedHeight: 44,
    itemWidth: 14,
    itemHeight: 14,
    itemGap: 12,
    iconTextGap: 6,
    rowHeight: 24,
    verticalPadding: 20,
    zoomGapStartRow: 3,
    zoomGapPerAdditionalRow: 4,
  },
  axisTitle: {
    xNameGapWithTitle: 30,
    xNameGapWithoutTitle: 12,
  },
} as const;

const lineYAxisTitleOffset = 44;
export const LINE_CHART_LAYOUT = {
  grid: {
    bottomWhenXAxisHidden: 0,
    bottomWithXAxisTitle: 32,
    bottomWithZoomBar: 80,
    leftWithYAxisTitle: lineYAxisTitleOffset,
  },
  legend: {
    bottom: 0,
  },
  dataZoom: {
    bottomOffset: 8,
    leftInsetDefault: 22,
    leftInsetWithYAxisTitle: 22 + lineYAxisTitleOffset,
    rightInsetDefault: 12,
    rightInsetWithToolbox: 30,
  },
  staticEndLabel: {
    rightReserveBase: 100,
    rightReserveFontBase: 14,
    fallbackLegendFontSize: 12,
  },
} as const;
