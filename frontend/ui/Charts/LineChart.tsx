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
  getInitialLineChartZoomRange,
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
import { calculateEndDate } from '@/utils/dateTimeHelper';
import { useAuth } from 'react-oidc-context';
import { getWidgetDataForRange } from '@/api/widget-service';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
type LineChartSpecificProps = {
  isStepline?: boolean;
  chartAggregationMode?: aggregationEnum | null;
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

type EChartsLegendInternals = {
  getModel?: () => {
    getComponent: (mainType: string, index?: number) => unknown;
  };
  getViewOfComponentModel?: (componentModel: unknown) => {
    group?: {
      getBoundingRect: () => {
        height: number;
      };
    };
  };
};

function getRenderedLegendHeight(chart: ECharts): number | null {
  const chartWithInternals = chart as unknown as EChartsLegendInternals;
  const ecModel = chartWithInternals.getModel?.();
  const legendModel = ecModel?.getComponent?.('legend', 0);

  if (!legendModel) {
    return null;
  }

  const legendView = chartWithInternals.getViewOfComponentModel?.(legendModel);
  const legendRect = legendView?.group?.getBoundingRect?.();

  if (!legendRect || !Number.isFinite(legendRect.height)) {
    return null;
  }

  return legendRect.height > 0 ? legendRect.height : null;
}

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
    chartHoverSingleValue: props.chartHoverSingleValue ?? false,
    showTooltip: props.showTooltip ?? true,
    hideTimeDetails: props.hideTimeDetails ?? false,
    playAnimation: props.playAnimation ?? true,
    isShownInMapModal: props.isShownInMapModal ?? false,
    isStepline: props.isStepline ?? false,
    chartAggregationMode: props.chartAggregationMode ?? null,
    chartInitialZoomPosition: props.chartInitialZoomPosition ?? 'last',
    chartInitialZoomTimeframe: props.chartInitialZoomTimeframe ?? null,
    staticValuesTicks: props.staticValuesTicks ?? [],
    staticValuesTexts: props.staticValuesTexts ?? [],
    showLegend: props.showLegend ?? false,
    singleSelectLegend: props.singleSelectLegend ?? false,
    extendedTimeframe: props.extendedTimeframe,
    extendedDateSelection: props.extendedDateSelection ?? false,
  };
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
  const auth = useAuth();
  const accessToken = auth.user?.access_token || '';
  const { openSnackbar } = useSnackbar();
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
  const [measuredBottomLegendHeight, setMeasuredBottomLegendHeight] = useState<
    number | null
  >(null);
  const [chartWidth, setChartWidth] = useState(0);
  const chartRef = useRef<HTMLDivElement>(null);

  const [rangeData, setRangeData] = useState<ChartData[] | null>(null);

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
  const selectedDateRange = useMemo(
    () =>
      fullDateRange
        ? {
            min: selectedMinDate ?? fullDateRange.min,
            max: selectedMaxDate ?? fullDateRange.max,
          }
        : null,
    [fullDateRange, selectedMaxDate, selectedMinDate],
  );
  const doesSelectedRangeOverlapDefaultData =
    fullDateRange !== null &&
    selectedDateRange !== null &&
    selectedDateRange.min <= fullDateRange.max &&
    selectedDateRange.max >= fullDateRange.min;
  const isHistoricDateRange =
    config.extendedDateSelection &&
    fullDateRange !== null &&
    selectedDateRange !== null &&
    selectedDateRange.min < fullDateRange.min;
  const dateFilteredSourceChartData = useMemo(
    () =>
      effectiveDateRange && doesSelectedRangeOverlapDefaultData
        ? getDisplayedLineChartData({
            sourceData: attributeFilteredChartData,
            dateRange: effectiveDateRange,
          })
        : attributeFilteredChartData,
    [
      attributeFilteredChartData,
      doesSelectedRangeOverlapDefaultData,
      effectiveDateRange,
    ],
  );
  const activeChartData =
    rangeData && rangeData.length > 0 ? rangeData : dateFilteredSourceChartData;

  const zoomBaseRange = useMemo(
    () => getXMinMax(activeChartData),
    [activeChartData],
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
      config.chartAggregationMode !== null
        ? getDisplayedLineChartData({
            sourceData: activeChartData,
            aggregationMode: config.chartAggregationMode,
            desiredPoints: desiredPointCount,
            visibleRange: effectiveVisibleRange ?? zoomBaseRange,
          })
        : activeChartData,
    [
      config.chartAggregationMode,
      activeChartData,
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
  const hasBottomLegend = config.showLegend && config.singleSelectLegend;
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
      measuredBottomLegendHeight,
    }),
    [
      filteredConfig,
      measuredBottomLegendHeight,
      singleSelectionLegendSelectedMap,
    ],
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
    if (!isHistoricDateRange) {
      setRangeData(null);
    }
  }, [isHistoricDateRange]);

  useEffect(() => {
    setVisibleRange(null);
  }, [rangeData]);

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
    if (isAdvancedDateSelectionEnabled && fullDateRange) {
      return;
    }

    setSelectedMinDate(null);
    setSelectedMaxDate(null);
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
        : getInitialLineChartZoomRange(
            zoomBaseRange,
            config.chartInitialZoomPosition,
            config.chartInitialZoomTimeframe,
          );

      if (
        currentRange &&
        currentRange.min.getTime() === nextRange.min.getTime() &&
        currentRange.max.getTime() === nextRange.max.getTime()
      ) {
        return currentRange;
      }

      return nextRange;
    });
  }, [
    config.allowZoom,
    config.chartInitialZoomPosition,
    config.chartInitialZoomTimeframe,
    zoomBaseRange,
  ]);

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

  useEffect(() => {
    if (hasBottomLegend) {
      return;
    }

    setMeasuredBottomLegendHeight((currentHeight) =>
      currentHeight === null ? currentHeight : null,
    );
  }, [hasBottomLegend]);

  const handleDateRangeChange = (
    dateRange: LineChartDateRange | null,
  ): void => {
    if (!dateRange) {
      setSelectedMinDate(null);
      setSelectedMaxDate(null);
      return;
    }

    setSelectedMinDate(dateRange.min);
    setSelectedMaxDate(dateRange.max);
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
    const chart = chartInstanceRef.current;
    if (!chart) {
      return;
    }

    const syncMeasuredLegendHeight = (): void => {
      if (!hasBottomLegend) {
        setMeasuredBottomLegendHeight((currentHeight) =>
          currentHeight === null ? currentHeight : null,
        );
        return;
      }

      const nextHeight = getRenderedLegendHeight(chart);
      if (nextHeight === null) {
        return;
      }

      const roundedNextHeight = Math.ceil(nextHeight);
      setMeasuredBottomLegendHeight((currentHeight) =>
        currentHeight !== null &&
        Math.abs(currentHeight - roundedNextHeight) < 1
          ? currentHeight
          : roundedNextHeight,
      );
    };

    chart.off('rendered', syncMeasuredLegendHeight);
    chart.on('rendered', syncMeasuredLegendHeight);
    syncMeasuredLegendHeight();

    return () => {
      chart.off('rendered', syncMeasuredLegendHeight);
    };
  }, [hasBottomLegend]);

  const handleLoadDataForSelectedRange = async () => {
    if (!selectedDateRange || !fullDateRange || !isHistoricDateRange) {
      setRangeData(null);
      return;
    }

    if (selectedDateRange.min > selectedDateRange.max) {
      openSnackbar(
        'Es muss ein gültiger Zeitraum ausgewählt werden!',
        'warning',
      );
      return;
    }

    const maxAllowedDate = fullDateRange
      ? calculateEndDate(
          config.extendedTimeframe ?? '',
          selectedDateRange.min,
          fullDateRange.max,
        )
      : null;

    if (!maxAllowedDate || selectedDateRange.max > maxAllowedDate) {
      openSnackbar(
        'Es muss ein gültiger Zeitraum ausgewählt werden!',
        'warning',
      );
      return;
    }

    if (!config.widgetId) {
      openSnackbar('Ein Fehler ist aufgetreten!', 'warning');
      return;
    }

    const range = {
      from: selectedDateRange.min.toISOString(),
      to: selectedDateRange.max.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      tabId: config.tabId,
    };

    try {
      const rangeChartData = await getWidgetDataForRange(
        accessToken,
        config.widgetId,
        range,
      );

      if (rangeChartData && rangeChartData.length === 0) {
        openSnackbar(
          'Für den ausgewählten Zeitraum sind keine Daten verfügbar.',
          'warning',
        );
        setRangeData(null);
        return;
      }
      setRangeData(rangeChartData);
    } catch (error) {
      console.error(error);
      openSnackbar('Daten konnten nicht geladen werden!', 'error');
    }
  };

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
                      maxDate={selectedDateRange?.max ?? effectiveDateRange.max}
                      minDate={selectedDateRange?.min ?? effectiveDateRange.min}
                      onDateRangeChange={handleDateRangeChange}
                      extendedDateSelection={
                        config.extendedDateSelection ?? false
                      }
                      extendedTimeframe={config.extendedTimeframe ?? ''}
                      onLoadData={handleLoadDataForSelectedRange}
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
