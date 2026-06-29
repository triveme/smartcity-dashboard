import { ChartData } from '@/types';

export type ChartDataProps = {
  labels: string[] | undefined;
  data: ChartData[];
  decimalPlaces?: number;
  widgetId?: string;
  usesQueryParameter?: boolean;
};

export type ChartTimeProps = {
  chartDateRepresentation?: string | 'Default';
  setXByTimeFramePeriod?: boolean;
  timeFramePeriod?: string | null;
  authDataType?: string | null;
};

export type ChartCartesianAxisProps = {
  xAxisLabel?: string;
  yAxisLabel?: string;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  chartYAxisScale?: number;
  chartYAxisScaleChartMinValue?: number;
  chartYAxisScaleChartMaxValue?: number;
  chartHasAutomaticZoom?: boolean;
};

export type ChartExportProps = {
  allowImageDownload: boolean;
  menuHoverColor: string;
  exportBackgroundColor?: string;
};

export type ChartCartesianStyleProps = {
  axisLabelFontColor: string;
  axisLineColor: string;
  axisTicksFontColor: string;
  axisFontSize: string;
  axisLabelSize: string;
  gridColor: string;
};

export type ChartLegendProps = {
  showLegend?: boolean;
  singleSelectLegend?: boolean;
  legendFontSize: string;
  legendFontColor: string;
  legendAlignment: string;
};

export type ChartFilterProps = {
  hasAdditionalSelection: boolean;
  filterColor?: string;
  filterTextColor?: string;
};

export type ChartInteractionProps = {
  allowZoom?: boolean;
  advancedDateSelection?: boolean;
  showTooltip?: boolean;
  hideTimeDetails?: boolean;
  playAnimation?: boolean;
  isShownInMapModal?: boolean;
};

export type ChartHighlightProps = {
  highlightedColor?: string;
  unhighlightedColor?: string;
};

export type ChartStaticValueProps = {
  staticValues: number[];
  staticValuesColors: string[];
  staticValuesTicks?: number[];
  staticValuesTexts?: string[];
};

export type ChartSeriesStyleProps = {
  currentValuesColors: string[];
  isStackedChart: boolean;
};
