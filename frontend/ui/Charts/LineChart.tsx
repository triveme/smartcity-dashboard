'use client';

import { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { echarts, ECHARTS_LOCALE } from '@/utils/Charts/echartsClient';
import { ECharts } from 'echarts';
import { aggregationEnum, ChartData, CurrentAreaConfig } from '@/types';
import eventBus, { VISIBLE_CHART_DATA_DOWNLOAD_EVENT } from '@/app/EventBus';
import {
  getSelectedLegendNames,
  getUniqueField,
} from '@/utils/Charts/chartHelper';
import {
  getDesiredLineChartPointCount,
  getDisplayedLineChartData,
  getEffectiveLineChartDateRange,
  getVisibleRangeFromChart,
  filterLineChartDataByAttribute,
  LineChartDateRange,
} from '@/utils/Charts/lineChartZoom';
import {
  areSingleSelectionLegendStatesEqual,
  buildSingleSelectionLegendSelectedMap,
  getEffectiveSingleSelectionLegendNames,
  getLineChartLegendNames,
  getNextSingleSelectionLegendState,
  reconcileSingleSelectionLegendState,
  SingleSelectionLegendState,
} from '@/utils/Charts/lineChartLegendSelection';
import { getXMinMax } from '@/utils/Charts/lineChartUtil';
import { buildLineChartOption } from './ChartOptions/LineChartOptions';
import LineChartDateRangeControls from './Components/LineChartDateRangeControls';
import LineChartFilterControls from './Components/LineChartFilterControls';
import LineChartLegendSelectionControls from './Components/LineChartLegendSelectionControls';
import {
  ChartCartesianAxisProps,
  ChartCartesianStyleProps,
  ChartDataProps,
  ChartExportProps,
  ChartFilterProps,
  ChartHighlightProps,
  ChartInteractionProps,
  ChartLegendProps,
  ChartSeriesStyleProps,
  ChartStaticValueProps,
  ChartTimeProps,
} from '../../types/chartSharedProps';

type LineChartSpecificProps = {
  isStepline?: boolean;
  chartAggregationMode?: aggregationEnum;
};

type LineChartProps = ChartTimeProps &
  ChartDataProps &
  ChartCartesianAxisProps &
  ChartExportProps &
  ChartCartesianStyleProps &
  ChartLegendProps &
  ChartFilterProps &
  ChartInteractionProps &
  ChartHighlightProps &
  ChartStaticValueProps &
  ChartSeriesStyleProps &
  LineChartSpecificProps;

type NormalizedLineChartProps = Omit<
  LineChartProps,
  'data' | 'usesQueryParameter'
> & {
  chartData: ChartData[];
};

function normalizeLineChartProps(
  props: LineChartProps,
  entityId: string | null,
): NormalizedLineChartProps {
  const chartData = entityId
    ? props.data.filter((series) => series.id === entityId)
    : props.data;
  const {
    data: _data,
    usesQueryParameter: _usesQueryParameter,
    ...restProps
  } = props;

  return {
    ...restProps,
    chartData,
    decimalPlaces: props.decimalPlaces ?? 0,
    chartDateRepresentation: props.chartDateRepresentation ?? 'Default',
    timeFramePeriod: props.timeFramePeriod ?? null,
    setXByTimeFramePeriod: props.setXByTimeFramePeriod ?? false,
    xAxisLabel: props.xAxisLabel ?? '',
    yAxisLabel: props.yAxisLabel ?? '',
    hideXAxis: props.hideXAxis ?? false,
    hideYAxis: props.hideYAxis ?? false,
    chartHasAutomaticZoom: props.chartHasAutomaticZoom ?? false,
    allowZoom: props.allowZoom ?? false,
    advancedDateSelection: props.advancedDateSelection ?? false,
    showTooltip: props.showTooltip ?? true,
    hideTimeDetails: props.hideTimeDetails ?? false,
    playAnimation: props.playAnimation ?? true,
    isShownInMapModal: props.isShownInMapModal ?? false,
    isStepline: props.isStepline ?? false,
    chartAggregationMode: props.chartAggregationMode ?? aggregationEnum.none,
    staticValuesTicks: props.staticValuesTicks ?? [],
    staticValuesTexts: props.staticValuesTexts ?? [],
    showLegend: props.showLegend ?? false,
    singleSelectLegend: props.singleSelectLegend ?? false,
  };
}

function normalizeStartOfDay(date: Date): Date {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function normalizeEndOfDay(date: Date): Date {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(23, 59, 59, 999);
  return normalizedDate;
}

function getCurrentAreaConfigKey(config: CurrentAreaConfig): string {
  const minRange =
    config.minRange instanceof Date
      ? config.minRange.getTime()
      : new Date(config.minRange).getTime();
  const maxRange =
    config.maxRange instanceof Date
      ? config.maxRange.getTime()
      : new Date(config.maxRange).getTime();

  return [
    config.id ?? '',
    minRange,
    maxRange,
    config.selectedLegendNames.join('|'),
    config.changeTimeFramePeriod ? '1' : '0',
    config.downloadCurrentArea ? '1' : '0',
    config.timeFramePeriod,
    config.authDataType,
  ].join('::');
}

function getLegendSelectionChangedName(event: unknown): string | undefined {
  if (!event || typeof event !== 'object' || !('name' in event)) {
    return undefined;
  }

  return typeof event.name === 'string' ? event.name : undefined;
}

export default function LineChart(props: LineChartProps): ReactElement {
  const searchParams = useSearchParams();
  const entityId =
    props.usesQueryParameter === true ? searchParams.get('entityId') : null;
  const config = useMemo(
    () => normalizeLineChartProps(props, entityId),
    [entityId, props],
  );
  const [selectedAttribute, setSelectedAttribute] = useState('');
  const [selectedMinDate, setSelectedMinDate] = useState<Date | null>(null);
  const [selectedMaxDate, setSelectedMaxDate] = useState<Date | null>(null);
  const [visibleRange, setVisibleRange] = useState<LineChartDateRange | null>(
    null,
  );
  const [singleSelectionLegendState, setSingleSelectionLegendState] =
    useState<SingleSelectionLegendState>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);
  const lastCurrentAreaConfigKeyRef = useRef('');
  const availableAttributes = useMemo(
    () => getUniqueField(config.chartData, false),
    [config.chartData],
  );
  const attributeFilteredChartData = useMemo(() => {
    if (!config.hasAdditionalSelection || !selectedAttribute) {
      return config.chartData;
    }

    return filterLineChartDataByAttribute(config.chartData, selectedAttribute);
  }, [config.chartData, config.hasAdditionalSelection, selectedAttribute]);
  const fullDateRange = useMemo(
    () => getXMinMax(attributeFilteredChartData),
    [attributeFilteredChartData],
  );
  const isAdvancedDateSelectionEnabled =
    config.allowZoom && config.advancedDateSelection && fullDateRange !== null;
  const effectiveDateRange = useMemo(
    () =>
      isAdvancedDateSelectionEnabled && fullDateRange
        ? getEffectiveLineChartDateRange(
            fullDateRange,
            selectedMinDate,
            selectedMaxDate,
          )
        : null,
    [
      fullDateRange,
      isAdvancedDateSelectionEnabled,
      selectedMaxDate,
      selectedMinDate,
    ],
  );
  const dateFilteredSourceChartData = useMemo(
    () =>
      effectiveDateRange
        ? getDisplayedLineChartData({
            sourceData: attributeFilteredChartData,
            dateRange: effectiveDateRange,
          })
        : attributeFilteredChartData,
    [attributeFilteredChartData, effectiveDateRange],
  );
  const zoomBaseRange = useMemo(
    () => getXMinMax(dateFilteredSourceChartData),
    [dateFilteredSourceChartData],
  );
  const effectiveVisibleRange = useMemo(
    () =>
      zoomBaseRange
        ? getEffectiveLineChartDateRange(
            zoomBaseRange,
            visibleRange?.min ?? null,
            visibleRange?.max ?? null,
          )
        : null,
    [visibleRange, zoomBaseRange],
  );
  const desiredPointCount = useMemo(
    () => getDesiredLineChartPointCount(chartWidth),
    [chartWidth],
  );
  const displayedChartData = useMemo(
    () =>
      config.allowZoom
        ? getDisplayedLineChartData({
            sourceData: dateFilteredSourceChartData,
            aggregationMode: config.chartAggregationMode,
            desiredPoints: desiredPointCount,
            visibleRange: effectiveVisibleRange ?? zoomBaseRange,
          })
        : dateFilteredSourceChartData,
    [
      config.allowZoom,
      config.chartAggregationMode,
      dateFilteredSourceChartData,
      desiredPointCount,
      effectiveVisibleRange,
      zoomBaseRange,
    ],
  );
  const dynamicLegendNames = useMemo(
    () => getLineChartLegendNames(displayedChartData),
    [displayedChartData],
  );
  const effectiveSingleSelectionLegendNames = useMemo(
    () =>
      getEffectiveSingleSelectionLegendNames(
        dynamicLegendNames,
        singleSelectionLegendState,
      ),
    [dynamicLegendNames, singleSelectionLegendState],
  );
  const showSingleSelectionLegendControls =
    config.showLegend &&
    config.singleSelectLegend &&
    dynamicLegendNames.length > 0;
  const isAllLegendsSelected =
    dynamicLegendNames.length > 0 &&
    effectiveSingleSelectionLegendNames.length === dynamicLegendNames.length;
  const isLegendSelectionEmpty =
    effectiveSingleSelectionLegendNames.length === 0;
  const singleSelectionLegendSelectedMap = useMemo(
    () =>
      config.showLegend && config.singleSelectLegend
        ? buildSingleSelectionLegendSelectedMap(
            dynamicLegendNames,
            singleSelectionLegendState,
          )
        : undefined,
    [
      config.showLegend,
      config.singleSelectLegend,
      dynamicLegendNames,
      singleSelectionLegendState,
    ],
  );
  const filteredConfig = useMemo(
    () => ({
      ...config,
      chartData: displayedChartData,
    }),
    [config, displayedChartData],
  );
  const optionConfig = useMemo(
    () => ({
      ...filteredConfig,
      legendSelectedMap: singleSelectionLegendSelectedMap,
    }),
    [filteredConfig, singleSelectionLegendSelectedMap],
  );

  const emitCurrentAreaConfig = (
    chart: ECharts,
    rangeOverride?: LineChartDateRange | null,
    selectedLegendNamesOverride?: string[],
  ): void => {
    const resolvedRange =
      rangeOverride ?? getVisibleRangeFromChart(chart) ?? zoomBaseRange;

    if (!resolvedRange) {
      return;
    }

    const currentAreaConfig: CurrentAreaConfig = {
      id: config.widgetId,
      minRange: resolvedRange.min,
      maxRange: resolvedRange.max,
      selectedLegendNames:
        selectedLegendNamesOverride ?? getSelectedLegendNames(chart),
      changeTimeFramePeriod: false,
      downloadCurrentArea: false,
      timeFramePeriod: config.timeFramePeriod ?? '',
      authDataType: config.authDataType ?? '',
    };
    const nextConfigKey = getCurrentAreaConfigKey(currentAreaConfig);

    if (lastCurrentAreaConfigKeyRef.current === nextConfigKey) {
      return;
    }

    lastCurrentAreaConfigKeyRef.current = nextConfigKey;
    eventBus.emit(VISIBLE_CHART_DATA_DOWNLOAD_EVENT, {
      data: currentAreaConfig,
    });
  };

  useEffect(() => {
    if (!config.hasAdditionalSelection) {
      setSelectedAttribute('');
      return;
    }

    if (availableAttributes.length === 0) {
      setSelectedAttribute('');
      return;
    }

    setSelectedAttribute((currentAttribute) =>
      availableAttributes.includes(currentAttribute)
        ? currentAttribute
        : availableAttributes[0],
    );
  }, [availableAttributes, config.hasAdditionalSelection]);

  useEffect(() => {
    if (!isAdvancedDateSelectionEnabled || !fullDateRange) {
      setSelectedMinDate(null);
      setSelectedMaxDate(null);
      return;
    }

    setSelectedMinDate((currentDate) =>
      currentDate
        ? new Date(Math.max(currentDate.getTime(), fullDateRange.min.getTime()))
        : null,
    );
    setSelectedMaxDate((currentDate) =>
      currentDate
        ? new Date(Math.min(currentDate.getTime(), fullDateRange.max.getTime()))
        : null,
    );
  }, [fullDateRange, isAdvancedDateSelectionEnabled]);

  useEffect(() => {
    if (!config.allowZoom || !zoomBaseRange) {
      setVisibleRange(null);
      return;
    }

    setVisibleRange((currentRange) => {
      const nextRange = currentRange
        ? getEffectiveLineChartDateRange(
            zoomBaseRange,
            currentRange.min,
            currentRange.max,
          )
        : zoomBaseRange;

      if (
        currentRange &&
        currentRange.min.getTime() === nextRange.min.getTime() &&
        currentRange.max.getTime() === nextRange.max.getTime()
      ) {
        return currentRange;
      }

      return nextRange;
    });
  }, [config.allowZoom, zoomBaseRange]);

  useEffect(() => {
    if (!config.showLegend || !config.singleSelectLegend) {
      setSingleSelectionLegendState((currentState) =>
        currentState === null ? currentState : null,
      );
      return;
    }

    setSingleSelectionLegendState((currentState) => {
      const nextState = reconcileSingleSelectionLegendState(
        dynamicLegendNames,
        currentState,
      );

      return areSingleSelectionLegendStatesEqual(currentState, nextState)
        ? currentState
        : nextState;
    });
  }, [config.showLegend, config.singleSelectLegend, dynamicLegendNames]);

  const handleMinDateChange = (date: Date | null): void => {
    if (!date) {
      setSelectedMinDate(null);
      return;
    }

    const nextMinDate = normalizeStartOfDay(date);
    setSelectedMinDate(nextMinDate);
    setSelectedMaxDate((currentDate) =>
      currentDate && currentDate.getTime() < nextMinDate.getTime()
        ? normalizeEndOfDay(date)
        : currentDate,
    );
  };

  const handleMaxDateChange = (date: Date | null): void => {
    if (!date) {
      setSelectedMaxDate(null);
      return;
    }

    const nextMaxDate = normalizeEndOfDay(date);
    setSelectedMaxDate(nextMaxDate);
    setSelectedMinDate((currentDate) =>
      currentDate && currentDate.getTime() > nextMaxDate.getTime()
        ? normalizeStartOfDay(date)
        : currentDate,
    );
  };

  const handleSelectAllLegends = (): void => {
    setSingleSelectionLegendState(null);
  };

  const handleDeselectAllLegends = (): void => {
    setSingleSelectionLegendState([]);
  };

  useEffect(() => {
    const chartElement = chartRef.current;
    if (!chartElement) {
      return;
    }

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartElement, undefined, {
        locale: ECHARTS_LOCALE,
      });
    }

    const chart = chartInstanceRef.current;
    const width = chartElement.clientWidth || chart.getWidth();
    const height = chartElement.clientHeight || chart.getHeight();

    setChartWidth((currentWidth) =>
      currentWidth === width ? currentWidth : width,
    );
    chart.setOption(
      buildLineChartOption(optionConfig, width, effectiveVisibleRange),
      true,
    );
    emitCurrentAreaConfig(
      chart,
      effectiveVisibleRange ?? zoomBaseRange,
      config.singleSelectLegend
        ? effectiveSingleSelectionLegendNames
        : undefined,
    );
    chart.resize({
      width,
      height,
      silent: true,
    });
  }, [
    config.authDataType,
    config.singleSelectLegend,
    config.timeFramePeriod,
    config.widgetId,
    effectiveSingleSelectionLegendNames,
    effectiveVisibleRange,
    optionConfig,
    zoomBaseRange,
  ]);

  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) {
      return;
    }

    const handleDataZoom = (): void => {
      if (!config.allowZoom) {
        return;
      }

      const nextVisibleRange = getVisibleRangeFromChart(chart);
      if (!nextVisibleRange) {
        return;
      }

      setVisibleRange((currentRange) => {
        if (
          currentRange &&
          currentRange.min.getTime() === nextVisibleRange.min.getTime() &&
          currentRange.max.getTime() === nextVisibleRange.max.getTime()
        ) {
          return currentRange;
        }

        return nextVisibleRange;
      });
    };
    const handleLegendSelectionChange = (event: unknown): void => {
      if (config.singleSelectLegend) {
        setSingleSelectionLegendState((currentState) => {
          const nextState = getNextSingleSelectionLegendState({
            allLegendNames: dynamicLegendNames,
            clickedLegendName: getLegendSelectionChangedName(event),
            currentSelectionState: currentState,
          });

          return areSingleSelectionLegendStatesEqual(currentState, nextState)
            ? currentState
            : nextState;
        });
        return;
      }

      emitCurrentAreaConfig(chart);
    };

    chart.off('datazoom', handleDataZoom);
    chart.off('legendselectchanged', handleLegendSelectionChange);

    if (config.allowZoom) {
      chart.on('datazoom', handleDataZoom);
    }

    if (config.showLegend) {
      chart.on('legendselectchanged', handleLegendSelectionChange);
    }

    return () => {
      chart.off('datazoom', handleDataZoom);
      chart.off('legendselectchanged', handleLegendSelectionChange);
    };
  }, [
    config.allowZoom,
    config.authDataType,
    config.showLegend,
    config.singleSelectLegend,
    config.timeFramePeriod,
    config.widgetId,
    dynamicLegendNames,
    zoomBaseRange,
  ]);

  useEffect(() => {
    const chartElement = chartRef.current;
    if (!chartElement) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const chart = chartInstanceRef.current;
      if (!chart) {
        return;
      }

      const width = chartElement.clientWidth || chart.getWidth();
      const height = chartElement.clientHeight || chart.getHeight();

      setChartWidth((currentWidth) =>
        currentWidth === width ? currentWidth : width,
      );
      chart.setOption(
        buildLineChartOption(optionConfig, width, effectiveVisibleRange),
        true,
      );
      emitCurrentAreaConfig(
        chart,
        effectiveVisibleRange ?? zoomBaseRange,
        config.singleSelectLegend
          ? effectiveSingleSelectionLegendNames
          : undefined,
      );
      chart.resize({
        width,
        height,
        silent: true,
      });
    });

    observer.observe(chartElement);

    return () => {
      observer.disconnect();
    };
  }, [
    config.authDataType,
    config.singleSelectLegend,
    config.timeFramePeriod,
    config.widgetId,
    effectiveSingleSelectionLegendNames,
    effectiveVisibleRange,
    optionConfig,
    zoomBaseRange,
  ]);

  useEffect(() => {
    return () => {
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="flex h-full w-full min-w-0 flex-col sm:flex-row">
      {config.hasAdditionalSelection && (
        <LineChartFilterControls
          attributes={availableAttributes}
          filterColor={config.filterColor}
          filterTextColor={config.filterTextColor}
          onSelect={setSelectedAttribute}
          selectedAttribute={selectedAttribute}
        />
      )}
      <div className="min-w-0 flex h-full flex-1 flex-col">
        <div className="w-full min-h-0 min-w-0 flex-1" ref={chartRef} />
        {(showSingleSelectionLegendControls ||
          (isAdvancedDateSelectionEnabled &&
            fullDateRange &&
            effectiveDateRange)) && (
          <div className="mt-[12px] w-full shrink-0 px-4">
            <div className="flex w-full flex-wrap items-center gap-y-4">
              {showSingleSelectionLegendControls && (
                <div className="flex min-w-[320px] flex-1 justify-center">
                  <LineChartLegendSelectionControls
                    filterColor={config.filterColor}
                    filterTextColor={config.filterTextColor}
                    isAllSelected={isAllLegendsSelected}
                    isSelectionEmpty={isLegendSelectionEmpty}
                    onDeselectAll={handleDeselectAllLegends}
                    onSelectAll={handleSelectAllLegends}
                  />
                </div>
              )}
              {isAdvancedDateSelectionEnabled &&
                fullDateRange &&
                effectiveDateRange && (
                  <div className="flex min-w-[320px] flex-1 justify-center">
                    <LineChartDateRangeControls
                      filterColor={config.filterColor}
                      filterTextColor={config.filterTextColor}
                      fullDateRange={fullDateRange}
                      maxDate={effectiveDateRange.max}
                      minDate={effectiveDateRange.min}
                      onMaxDateChange={handleMaxDateChange}
                      onMinDateChange={handleMinDateChange}
                    />
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
