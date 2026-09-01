'use client';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { echarts, ECHARTS_LOCALE } from '@/utils/Charts/echartsClient';
import { ECharts, EChartsOption } from 'echarts';
import { ChartData, CurrentAreaConfig, timeframeEnum } from '@/types';
import {
  formatYAxisLabel,
  calculateYAxisNameGap,
  calculateLeftGrid,
  calculateBottomGrid,
  getUniqueField,
  getChartDateFormatter,
  getChartDateRichText,
  getSelectedLegendNames,
  getAdaptiveWeekdayFormatter,
} from '@/utils/Charts/chartHelper';
import { applyUserLocaleToNumber, roundToDecimal } from '@/utils/mathHelper';
import DashboardIcon from '../Icons/DashboardIcon';
import FilterButton from '../Buttons/FilterButton';
import { useSearchParams } from 'next/navigation';
import { debounce } from 'lodash';
import { getVisibleDateRange, getXMinMax } from '@/utils/Charts/lineChartUtil';
import eventBus, { VISIBLE_CHART_DATA_DOWNLOAD_EVENT } from '@/app/EventBus';

type BarChartProps = {
  chartDateRepresentation?: string | 'Default';
  chartYAxisScale?: number | undefined;
  chartYAxisScaleChartMinValue?: number | undefined;
  chartYAxisScaleChartMaxValue?: number | undefined;
  data: ChartData[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
  allowImageDownload?: boolean;
  allowZoom?: boolean;
  showLegend?: boolean;
  staticValues: number[];
  staticValuesColors: string[];
  fontColor: string;
  axisColor: string;
  axisFontSize: string;
  axisFontColor: string;
  legendFontSize: string;
  legendFontColor: string;
  axisLabelSize: string;
  currentValuesColors: string[];
  gridColor: string;
  showGrid?: boolean;
  legendAlignment: string;
  hasAdditionalSelection: boolean;
  filterColor?: string;
  filterTextColor?: string;
  isStackedChart: boolean;
  decimalPlaces?: number;
  showTooltip?: boolean;
  showXAxis?: boolean;
  setSortAscending: boolean;
  setSortDescending: boolean;
  setValueLimit: boolean;
  userDefinedLimit: number;
  menuHoverColor: string;
  widgetId?: string;
  usesQueryParameter?: boolean;
  timeFramePeriod?: string | null;
  authDataType?: string | null;
  exportBackgroundColor?: string;
};

type SortValue = 'no-filter' | 'asc' | 'desc';
type LimitValue = 'all' | number;
type SnapshotDatum = {
  color: string;
  label: string;
  timestamp: number | null;
  value: number;
};

export default function BarChartHorizontal(props: BarChartProps): ReactElement {
  const {
    widgetId,
    chartDateRepresentation,
    chartYAxisScale,
    chartYAxisScaleChartMinValue,
    chartYAxisScaleChartMaxValue,
    xAxisLabel,
    yAxisLabel,
    hideXAxis = false,
    hideYAxis = false,
    allowImageDownload,
    allowZoom,
    showLegend,
    staticValues,
    staticValuesColors,
    fontColor,
    axisColor,
    currentValuesColors,
    showGrid,
    gridColor,
    axisFontSize,
    axisLabelSize,
    legendFontSize,
    legendFontColor,
    legendAlignment,
    hasAdditionalSelection,
    filterColor,
    filterTextColor,
    isStackedChart,
    decimalPlaces,
    showTooltip = true,
    showXAxis = true,
    setSortAscending,
    setSortDescending,
    setValueLimit,
    userDefinedLimit,
    menuHoverColor,
    usesQueryParameter = false,
    authDataType,
    timeFramePeriod,
    exportBackgroundColor,
  } = props;
  let { data } = props;

  const searchParams = useSearchParams();
  const entityId = usesQueryParameter ? searchParams.get('entityId') : null;

  if (entityId) {
    data = data.filter((x) => x.id === entityId);
  }

  const [filteredData, setFilteredData] = useState<ChartData[]>(data);
  const [clickedAttribute, setClickedAttribute] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);

  const [limitOfValues, setLimitOfValues] = useState<LimitValue>('all');
  const [sortingValue, setSortingValue] = useState<SortValue>('no-filter');

  const attributes = getUniqueField(data, false);
  const sensorNames = getUniqueField(data, true);
  const axisData = filteredData.length > 0 ? filteredData : data;
  const snapshotMode = sortingValue !== 'no-filter' || limitOfValues !== 'all';

  const getLatestPoint = (
    values: ChartData['values'],
  ): { label: string; timestamp: number | null; value: number } => {
    let latestTimestamp = -Infinity;
    let latestValue = 0;
    let latestLabel = '';

    for (const valueEntry of values) {
      const label = valueEntry?.[0];
      const value = valueEntry?.[1];
      const timestamp = new Date(label).getTime();

      if (
        typeof value !== 'number' ||
        !Number.isFinite(value) ||
        Number.isNaN(timestamp)
      ) {
        continue;
      }

      if (timestamp >= latestTimestamp) {
        latestTimestamp = timestamp;
        latestValue = value;
        latestLabel = label;
      }
    }

    return {
      label: latestLabel,
      timestamp: latestTimestamp === -Infinity ? null : latestTimestamp,
      value: latestValue,
    };
  };

  const getSeriesSortKey = (
    values: ChartData['values'],
    useSnapshotValue = false,
  ): number => {
    if (useSnapshotValue) {
      return getLatestPoint(values).value;
    }

    let max = -Infinity;

    for (const v of values) {
      const y = v?.[1];
      if (typeof y === 'number' && Number.isFinite(y) && y > max) {
        max = y;
      }
    }

    return max === -Infinity ? 0 : max;
  };

  /**
   * Sorts the full dataset by the series key.
   *
   * - no-filter → original order
   * - asc       → ascending
   * - desc      → descending
   *
   * Global sorting is skipped when a value limit is active.
   */
  const sortChartData = (data: ChartData[], order: SortValue): ChartData[] => {
    if (limitOfValues !== 'all') return data;
    if (order === 'no-filter') return data;

    return [...data].sort((a, b) => {
      const aKey = getSeriesSortKey(a.values, snapshotMode);
      const bKey = getSeriesSortKey(b.values, snapshotMode);

      if (aKey === bKey) {
        const aTie = a.id ?? a.name ?? '';
        const bTie = b.id ?? b.name ?? '';
        return aTie.localeCompare(bTie);
      }

      return order === 'asc' ? aKey - bKey : bKey - aKey;
    });
  };

  /**
   * Applies TOP-N limiting and final ordering.
   *
   * - limit = all → return data as-is
   * - limit = N  → select TOP-N largest series
   *
   * Display order:
   * - no-filter → original order
   * - asc/desc → sorted within TOP-N
   */
  const applyLimit = (
    ordered: ChartData[],
    limit: LimitValue,
    order: SortValue,
  ): ChartData[] => {
    if (limit === 'all') return ordered;

    const n = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 0;
    if (n === 0) return [];

    const withMeta = ordered.map((item, idx) => ({
      item,
      idx,
      key: getSeriesSortKey(item.values, snapshotMode),
    }));

    const selectComparator = (
      a: (typeof withMeta)[number],
      b: (typeof withMeta)[number],
    ): number => {
      if (a.key === b.key) return a.idx - b.idx;
      if (order === 'asc') return a.key - b.key;
      return b.key - a.key;
    };

    const displayComparator = (
      a: (typeof withMeta)[number],
      b: (typeof withMeta)[number],
    ): number =>
      a.key === b.key
        ? (a.item.id ?? a.item.name ?? '').localeCompare(
            b.item.id ?? b.item.name ?? '',
          )
        : order === 'asc'
          ? a.key - b.key
          : b.key - a.key;

    const topN = withMeta.sort(selectComparator).slice(0, n);

    if (order === 'no-filter') {
      return topN.sort((a, b) => a.idx - b.idx).map((x) => x.item);
    }

    return topN.sort(displayComparator).map((x) => x.item);
  };

  const update = debounce(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    // getVisibleDateRange assumes the time axis is the xAxis, which does not
    // hold here (time is on the yAxis), so it only resolves via dataZoom.
    // Fall back to the full data range so the download event still fires
    // when zoom is disabled or no zoom has been applied yet.
    const range = getVisibleDateRange(chart) ?? getXMinMax(axisData);
    if (!range) return;

    const selectedLegendNames = getSelectedLegendNames(chart);

    const currentAreaConfig = {
      id: widgetId,
      minRange: range.min,
      maxRange: range.max,
      selectedLegendNames,
      downloadCurrentArea: false,
      changeTimeFramePeriod: false,
      timeFramePeriod: (timeFramePeriod as timeframeEnum) ?? '',
      authDataType: authDataType ?? '',
    };

    // It is important to send it inside the debounce, so the data is only sent after the filter is finally set.
    sendCurrentAreaChartData(currentAreaConfig);
  }, 500);

  // Function for sending the data visible on the axis
  const sendCurrentAreaChartData = (currentAreaConfig: CurrentAreaConfig) => {
    eventBus.emit(VISIBLE_CHART_DATA_DOWNLOAD_EVENT, {
      data: currentAreaConfig,
    });
  };

  const initializeChart = (): void => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        locale: ECHARTS_LOCALE,
      });

      // Calculate dynamic splitNumber based on the container width
      const containerWidth = chartRef.current.clientWidth;
      const splitNumber = Math.max(5, Math.floor(containerWidth / 100));
      const weekdayFormatter =
        chartDateRepresentation === 'Weekdays'
          ? getAdaptiveWeekdayFormatter(
              containerWidth / Math.max(splitNumber, 1),
              axisFontSize,
            )
          : undefined;

      const resolveSeriesName = (
        fullName: string,
        candidates: string[],
      ): string => {
        let match = '';
        for (const c of candidates) {
          if (fullName.includes(c) && c.length > match.length) match = c;
        }
        return match;
      };

      // Main data series
      const series: echarts.BarSeriesOption[] = [];
      const orderedData =
        filteredData && filteredData.length > 0
          ? sortChartData(filteredData, sortingValue)
          : [];
      const limitedData = applyLimit(orderedData, limitOfValues, sortingValue);
      const snapshotData: SnapshotDatum[] = snapshotMode
        ? limitedData.map((item) => {
            const latestPoint = getLatestPoint(item.values);
            const displayName = item.name;
            const sensorName = resolveSeriesName(item.name, sensorNames);
            const colorIdx = Math.max(0, sensorNames.indexOf(sensorName));
            const color =
              currentValuesColors[colorIdx % currentValuesColors.length] ||
              'black';

            return {
              color,
              label: displayName,
              timestamp: latestPoint.timestamp,
              value: latestPoint.value,
            };
          })
        : [];

      if (filteredData && filteredData.length > 0) {
        if (snapshotMode) {
          const markLineData = staticValues.map((value, index) => ({
            xAxis: Number(value),
            lineStyle: {
              color: staticValuesColors[index] || fontColor,
              type: 'solid' as const,
            },
            label: {
              show: false,
            },
          }));

          series.push({
            data: snapshotData.map((item) => ({
              value: item.value,
              itemStyle: {
                color: item.color,
              },
            })),
            type: 'bar',
            name: xAxisLabel || 'Value',
            ...(markLineData.length > 0 && {
              markLine: {
                symbol: 'none',
                data: markLineData,
              },
            }),
          });
        } else {
          for (let i = 0; i < limitedData.length; i++) {
            const item = limitedData[i];
            const dataArray = item.values;
            const displayName = resolveSeriesName(item.name, sensorNames);

            const colorIdx = Math.max(0, sensorNames.indexOf(displayName));
            const color =
              currentValuesColors[colorIdx % currentValuesColors.length] ||
              'black';

            const tempSeries: echarts.BarSeriesOption = {
              data: dataArray.map(([time, value]) => [
                Number(value),
                new Date(time).getTime(),
              ]),
              type: 'bar',
              name: displayName,
              color,
              ...(isStackedChart && { stack: 'a' }),
            };
            series.push(tempSeries);
          }
        }
      }

      // Static value series
      const staticValueSeries: echarts.LineSeriesOption[] =
        !snapshotMode &&
        staticValues &&
        staticValues.length > 0 &&
        filteredData &&
        filteredData.length > 0
          ? staticValues.map((value, index) => ({
              data: filteredData[0].values.map(([t]) => [
                Number(value),
                new Date(t).getTime(),
              ]),
              type: 'line',
              symbol: 'none',
              lineStyle: {
                color: staticValuesColors[index],
                type: 'solid',
              },
              tooltip: {
                show: false,
              },
            }))
          : [];

      const option: EChartsOption = {
        xAxis: {
          name: hideXAxis ? '' : xAxisLabel,
          type: 'value',
          splitNumber: splitNumber,
          nameLocation: 'middle',
          nameGap: hideXAxis ? 0 : 35,
          nameTextStyle: {
            color: fontColor,
            fontSize: axisLabelSize,
          },
          axisLine: {
            lineStyle: {
              color: axisColor,
              width: 2,
            },
            show: !hideXAxis,
          },
          axisLabel: {
            color: fontColor,
            fontSize: axisFontSize,
            hideOverlap: true,
            show: !hideXAxis && showXAxis,
            formatter: (val: number) => {
              const absVal = Math.abs(val);
              if (absVal >= 1000000) {
                return `${(val / 1000000).toFixed(1)} Mio`;
              }
              return val.toString();
            },
          },
          axisTick: {
            show: false,
          },
          interval:
            chartYAxisScale && chartYAxisScale !== 0
              ? chartYAxisScale
              : undefined,
          min:
            chartYAxisScale && chartYAxisScale !== 0
              ? chartYAxisScaleChartMinValue
              : undefined,
          max:
            chartYAxisScale && chartYAxisScale !== 0
              ? chartYAxisScaleChartMaxValue
              : undefined,
        },
        yAxis: {
          type: snapshotMode ? 'category' : 'time',
          ...(snapshotMode && {
            data: snapshotData.map((item) => item.label),
            inverse: true,
          }),
          name: hideYAxis ? '' : formatYAxisLabel(yAxisLabel || ''),
          nameGap: hideYAxis ? 0 : calculateYAxisNameGap(axisData),
          nameLocation: 'middle',
          nameTextStyle: {
            color: fontColor,
            fontSize: axisLabelSize,
          },
          axisLine: {
            lineStyle: {
              color: axisColor,
              width: 2,
            },
            show: !hideYAxis,
          },
          axisLabel: {
            color: fontColor,
            fontSize: axisFontSize,
            show: !hideYAxis,
            formatter: weekdayFormatter
              ? weekdayFormatter
              : chartDateRepresentation
                ? getChartDateFormatter(chartDateRepresentation)
                : undefined,
            rich: chartDateRepresentation
              ? getChartDateRichText(chartDateRepresentation)
              : undefined,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: !hideYAxis && (showGrid || false),
            lineStyle: {
              color: gridColor,
            },
          },
        },
        legend: {
          type: 'scroll',
          orient: legendAlignment === 'Top' ? 'horizontal' : 'horizontal',
          show: snapshotMode ? false : showLegend,
          textStyle: {
            fontSize: legendFontSize,
            color: legendFontColor,
          },
          right: allowImageDownload ? '30' : 'auto',
        },
        toolbox: {
          show: allowImageDownload,
          feature: {
            saveAsImage: {
              backgroundColor: exportBackgroundColor,
              title: 'Als Bild herunterladen...    ',
              icon: 'path://M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z',
              iconStyle: {
                color: fontColor,
                borderColor: 'transparent',
                borderWidth: 0,
              },
              emphasis: {
                iconStyle: {
                  color: menuHoverColor,
                  borderColor: 'transparent',
                  borderWidth: 0,
                },
              },
            },
          },
        },
        grid: {
          left: calculateLeftGrid(
            hideYAxis ? '' : yAxisLabel || '',
            legendAlignment,
          ),
          right: 10,
          top: 30,
          bottom: calculateBottomGrid(
            hideXAxis ? '' : xAxisLabel || '',
            allowZoom,
          ),
          containLabel: true,
        },
        series: [...series, ...staticValueSeries],
        dataZoom: allowZoom
          ? [
              {
                type: 'slider',
                yAxisIndex: 0,
                filterMode: 'filter',
                left: 20,
                start: 0,
                end: 100,
              },
              { type: 'inside', yAxisIndex: 0, start: 0, end: 100 },
            ]
          : [],
        tooltip: {
          show: showTooltip,
          trigger: 'axis',
          formatter: (params: unknown) => {
            const paramArray = Array.isArray(params) ? params : [params];

            if (snapshotMode) {
              const firstParam = paramArray[0] as {
                axisValue?: string;
                dataIndex?: number;
              };
              const snapshotIndex = firstParam?.dataIndex ?? 0;
              const snapshotDataPoint = snapshotData[snapshotIndex] ?? null;
              const title = firstParam?.axisValue || '';
              const formattedTimestamp =
                snapshotDataPoint?.timestamp !== null &&
                snapshotDataPoint?.timestamp !== undefined
                  ? new Date(snapshotDataPoint.timestamp).toLocaleString(
                      navigator.language || 'de-DE',
                      {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )
                  : null;

              let tooltipContent = `<div style="font-weight: bold; margin-bottom: 8px;">${title}</div>`;
              if (formattedTimestamp) {
                tooltipContent += `<div style="margin-bottom: 8px;">${formattedTimestamp}</div>`;
              }

              paramArray.forEach((param: any) => {
                const raw = Array.isArray(param.value)
                  ? param.value[0]
                  : param.value;
                const isNum = typeof raw === 'number' && Number.isFinite(raw);
                const formattedValue = isNum
                  ? applyUserLocaleToNumber(
                      roundToDecimal(raw, decimalPlaces),
                      navigator.language || 'de-DE',
                    )
                  : null;
                if (formattedValue == null) return;

                tooltipContent += `
            <div style="display:flex;align-items:center;margin:4px 0;">
              <span style="display:inline-block;width:10px;height:10px;background-color:${param.color};border-radius:50%;margin-right:8px;"></span>
              <span style="margin-right:8px;">${xAxisLabel || 'Value'}:</span>
              <span style="font-weight:bold;">${formattedValue}</span>
            </div>`;
              });
              return tooltipContent;
            }

            // Get the timestamp from the first param and format it
            const firstParam = paramArray[0] as { axisValue: string };
            const timestamp = firstParam?.axisValue;
            const formattedTimestamp = timestamp
              ? new Date(timestamp).toLocaleString(
                  navigator.language || 'de-DE',
                  {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  },
                )
              : timestamp;
            let tooltipContent = `<div style="font-weight: bold; margin-bottom: 8px;">${formattedTimestamp}</div>`;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            paramArray.forEach((param: any) => {
              const raw = Array.isArray(param.value)
                ? param.value[0]
                : param.value;
              const isNum = typeof raw === 'number' && Number.isFinite(raw);
              const formattedValue = isNum
                ? applyUserLocaleToNumber(
                    roundToDecimal(raw, decimalPlaces),
                    navigator.language || 'de-DE',
                  )
                : null;
              if (formattedValue == null) return;

              tooltipContent += `
            <div style="display:flex;align-items:center;margin:4px 0;">
              <span style="display:inline-block;width:10px;height:10px;background-color:${param.color};border-radius:50%;margin-right:8px;"></span>
              <span style="margin-right:8px;">${param.seriesName}:</span>
              <span style="font-weight:bold;">${formattedValue}</span>
            </div>`;
            });
            return tooltipContent;
          },
        },
      };

      chartInstance.current.setOption(option);

      chartInstance.current.off('legendselectchanged', update);
      chartInstance.current.off('datazoom', update);
      if (!snapshotMode) {
        chartInstance.current.on('legendselectchanged', update);
        chartInstance.current.on('datazoom', update);
        update();
      }
    }
  };

  const handleFilterButtonClicked = (clickedAttribute: string): void => {
    const tempData = data;
    const newFilteredData = tempData.filter((item) =>
      item.name.endsWith(clickedAttribute),
    );
    setClickedAttribute(clickedAttribute);
    setFilteredData(newFilteredData);
  };

  // set sorting value effect (without this effect it takes long to upload data)
  useEffect(() => {
    const calcSortingValue = setSortAscending
      ? 'asc'
      : setSortDescending
        ? 'desc'
        : 'no-filter';

    setSortingValue(calcSortingValue);
  }, [setSortAscending, setSortDescending]);

  useEffect(() => {
    const valuesLimit = setValueLimit ? userDefinedLimit : 'all';
    setLimitOfValues(valuesLimit);
  }, [setValueLimit, userDefinedLimit]);

  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      initializeChart();
    }
  }, [filteredData, props, limitOfValues, sortingValue]);

  useEffect(() => {
    if (data && data.length > 0) {
      if (hasAdditionalSelection) {
        setClickedAttribute(attributes[0]);
        handleFilterButtonClicked(attributes[0]);
      } else {
        const dataToUse = sortChartData(data, sortingValue);
        setFilteredData(dataToUse);
      }
    }
  }, []);

  // Observe the window size
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    });

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }

      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-row">
      {hasAdditionalSelection && (
        <>
          {/* Dropdown for small screens */}
          <div className="sm:hidden w-full px-3 mb-4">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg"
              style={{
                backgroundColor: 'transparent',
                borderColor: filterColor,
                color: filterColor,
                borderWidth: '2px',
              }}
            >
              <span className="truncate">
                {clickedAttribute || 'Select filter'}
              </span>
              <DashboardIcon iconName="ChevronDown" color={filterColor} />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute z-10 mt-1 w-[calc(100%-24px)] rounded-lg shadow-lg"
                style={{
                  backgroundColor: filterColor,
                  borderColor: filterColor,
                }}
              >
                {attributes.map((attribute) => (
                  <button
                    key={`dropdown-${attribute}`}
                    onClick={() => {
                      handleFilterButtonClicked(attribute);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full p-2 text-left hover:opacity-75"
                    style={{
                      color: filterTextColor,
                      borderBottom: `1px solid ${filterTextColor}25`,
                    }}
                  >
                    {attribute}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Buttons for larger screens */}
          <FilterButton
            attributes={attributes}
            onClick={handleFilterButtonClicked}
            filterColor={filterColor}
            filterTextColor={filterTextColor}
            clickedAttribute={clickedAttribute}
          ></FilterButton>
        </>
      )}
      <div className="w-full h-full" ref={chartRef} />
    </div>
  );
}
