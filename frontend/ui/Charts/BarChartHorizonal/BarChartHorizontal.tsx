'use client';
import { ReactElement, useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ECharts, EChartsOption } from 'echarts';
import { ChartData } from '@/types';
import {
  formatYAxisLabel,
  calculateYAxisNameGap,
  calculateLeftGrid,
  calculateBottomGrid,
  getUniqueField,
  getChartDateFormatter,
  getChartDateRichText,
} from '@/utils/chartHelper';
import { applyUserLocaleToNumber, roundToDecimal } from '@/utils/mathHelper';
import DashboardIcon from '../../Icons/DashboardIcon';
import FilterButton from '../../Buttons/FilterButton';

type BarChartProps = {
  chartDateRepresentation?: string | 'Default';
  chartYAxisScale?: number | undefined;
  chartYAxisScaleChartMinValue?: number | undefined;
  chartYAxisScaleChartMaxValue?: number | undefined;
  data: ChartData[];
  xAxisLabel?: string;
  yAxisLabel?: string;
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
};

type SortValue = 'no-filter' | 'asc' | 'desc';
type LimitValue = 'all' | number;

export default function BarChartHorizontal(props: BarChartProps): ReactElement {
  const {
    chartDateRepresentation,
    chartYAxisScale,
    chartYAxisScaleChartMinValue,
    chartYAxisScaleChartMaxValue,
    data,
    xAxisLabel,
    yAxisLabel,
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
  } = props;

  const [filteredData, setFilteredData] = useState<ChartData[]>(data);
  const [clickedAttribute, setClickedAttribute] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);

  const [limitOfValues, setLimitOfValues] = useState<LimitValue>('all');
  const [sortingValue, setSortingValue] = useState<SortValue>('no-filter');

  const attributes = getUniqueField(data, false);
  const sensorNames = getUniqueField(data, true);

  const sortChartData = (
    data: ChartData[],
    order: 'asc' | 'desc' | 'no-filter',
  ): ChartData[] => {
    if (order === 'no-filter') return data;
    const sorted = [...data].sort((a, b) => {
      const lastA = a.values[a.values.length - 1]?.[1] ?? 0;
      const lastB = b.values[b.values.length - 1]?.[1] ?? 0;
      return order === 'asc' ? lastA - lastB : lastB - lastA;
    });
    return sorted;
  };

  const applyLimit = (
    ordered: ChartData[],
    limit: LimitValue,
    order: 'no-filter' | 'asc' | 'desc',
  ): ChartData[] => {
    if (limit === 'all') return ordered;

    return order === 'desc' ? ordered.slice(0, limit) : ordered.slice(-limit);
  };

  const initializeChart = (): void => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = echarts.init(chartRef.current);

      // Calculate dynamic splitNumber based on the container width
      const containerWidth = chartRef.current.clientWidth;
      const splitNumber = Math.max(5, Math.floor(containerWidth / 100));

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
      if (filteredData && filteredData.length > 0) {
        const orderedData = sortChartData(filteredData, sortingValue);
        const limitedData = applyLimit(
          orderedData,
          limitOfValues,
          sortingValue,
        );

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

      // Static value series
      const staticValueSeries: echarts.LineSeriesOption[] =
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
          name: xAxisLabel,
          type: 'value',
          splitNumber: splitNumber,
          nameLocation: 'middle',
          nameGap: 35,
          nameTextStyle: {
            color: fontColor,
            fontSize: axisLabelSize,
          },
          axisLine: {
            lineStyle: {
              color: axisColor,
              width: 2,
            },
            show: true,
          },
          axisLabel: {
            color: fontColor,
            fontSize: axisFontSize,
            hideOverlap: true,
            show: showXAxis,
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
          type: 'time',
          name: formatYAxisLabel(yAxisLabel || ''),
          nameGap: calculateYAxisNameGap(data),
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
            show: true,
          },
          axisLabel: {
            color: fontColor,
            fontSize: axisFontSize,
            formatter: chartDateRepresentation
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
            show: showGrid || false,
            lineStyle: {
              color: gridColor,
            },
          },
        },
        legend: {
          type: 'scroll',
          orient: legendAlignment === 'Top' ? 'horizontal' : 'horizontal',
          show: showLegend,
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
              title: 'Bild Downloaden',
              iconStyle: {
                color: fontColor,
                borderColor: fontColor,
              },
            },
          },
        },
        grid: {
          left: calculateLeftGrid(yAxisLabel || '', legendAlignment),
          right: 10,
          top: 30,
          bottom: calculateBottomGrid(xAxisLabel || '', allowZoom),
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
    }
  };

  const handleFilterButtonClicked = (clickedAttribute: string): void => {
    const tempData = data ? data : data;
    const newFilteredData = tempData.filter((item) =>
      item.name.includes(clickedAttribute),
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
  }, [setSortAscending, setSortDescending, setValueLimit]);

  useEffect(() => {
    const valuesLimit = setValueLimit ? userDefinedLimit : 'all';
    setLimitOfValues(valuesLimit);
  }, [setValueLimit]);

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
  }, [data, sortingValue]);

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
