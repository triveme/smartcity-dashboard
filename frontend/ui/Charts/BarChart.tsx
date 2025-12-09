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
  getLabelMap,
} from '@/utils/chartHelper';
import DashboardIcon from '../Icons/DashboardIcon';
import FilterButton from '../Buttons/FilterButton';
import { generateTooltipContent } from '@/utils/chartTooltipHelper';

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
  staticValuesTicks?: number[];
  staticValuesTexts?: string[];
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
  playAnimation?: boolean;
  highlightedColor?: string;
  unhighlightedColor?: string;
  chartHoverSingleValue?: boolean;
  showTimestampOnHover?: boolean;
};

export default function BarChart(props: BarChartProps): ReactElement {
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
    staticValuesTexts = [],
    staticValuesTicks = [],
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
    playAnimation = true,
    highlightedColor,
    unhighlightedColor,
    chartHoverSingleValue,
    showTimestampOnHover,
  } = props;

  const [filteredData, setFilteredData] = useState<ChartData[]>(data);
  const [clickedAttribute, setClickedAttribute] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);

  const attributes = getUniqueField(data, false);
  const sensorNames = getUniqueField(data, true);

  const initializeChart = (): void => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = echarts.init(chartRef.current);

      // Calculate dynamic splitNumber based on the container width
      const containerWidth = chartRef.current.clientWidth;
      const splitNumber = Math.max(5, Math.floor(containerWidth / 100));

      // Main data series
      const series: echarts.BarSeriesOption[] = [];
      if (filteredData && filteredData.length > 0) {
        for (let i = 0; i < filteredData.length; i++) {
          const dataArray = filteredData[i].values;

          const tempSeries: echarts.BarSeriesOption = {
            data: dataArray,
            type: 'bar',
            name: sensorNames[i],
            color: currentValuesColors[i % 10] || 'black',
            ...(isStackedChart && { stack: 'a' }),
          };
          if (filteredData[i].highlighted != undefined) {
            tempSeries.color = filteredData[i].highlighted
              ? highlightedColor
              : unhighlightedColor;
            tempSeries.itemStyle = {
              borderWidth: 2,
            };
          }
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
              data: filteredData[0].values.map((label) => [label[0], value]),
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
                // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                formatter: function () {
                  return staticValuesTexts[
                    staticValuesTicks.findIndex((tick) => tick == value)
                  ];
                },
                fontSize: legendFontSize,
                color: legendFontColor,
              },
            }))
          : [];
      const hasEndLabel = staticValueSeries.find(
        (value) => value.endLabel?.show,
      );
      const seriesAll = [...series, ...staticValueSeries];
      const labelMap = getLabelMap(chartDateRepresentation, seriesAll);

      const option: EChartsOption = {
        animation: playAnimation,
        xAxis: {
          name: xAxisLabel,
          type: 'time',
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
            formatter: chartDateRepresentation
              ? getChartDateFormatter(chartDateRepresentation, labelMap)
              : undefined,
            rich: chartDateRepresentation
              ? getChartDateRichText(chartDateRepresentation)
              : undefined,
            show: showXAxis,
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          name: formatYAxisLabel(yAxisLabel || ''),
          nameGap: calculateYAxisNameGap(data),
          nameLocation: 'middle',
          interval:
            chartYAxisScale && chartYAxisScale !== 0
              ? chartYAxisScale
              : undefined,
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
          splitLine: {
            show: showGrid || false,
            lineStyle: {
              color: gridColor,
            },
          },
          min:
            chartYAxisScale && chartYAxisScale !== 0
              ? chartYAxisScaleChartMinValue
              : undefined,
          max:
            chartYAxisScale && chartYAxisScale !== 0
              ? chartYAxisScaleChartMaxValue
              : undefined,
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
          right: hasEndLabel ? 100 * (14 / parseInt(legendFontSize)) : 10,
          top: 30,
          bottom: calculateBottomGrid(xAxisLabel || '', allowZoom),
          containLabel: true,
        },
        series: seriesAll,
        dataZoom: allowZoom
          ? [
              {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'filter',
                start: 0,
                end: 100,
              },
              {
                type: 'inside',
                xAxisIndex: 0,
                start: 0,
                end: 100,
              },
            ]
          : [],
        tooltip: {
          show: showTooltip,
          trigger: chartHoverSingleValue ? 'item' : 'axis',
          formatter: (params: unknown) => {
            const tooltipContent = generateTooltipContent(
              params,
              decimalPlaces,
              false,
              undefined,
              showTimestampOnHover,
            );
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

  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      initializeChart();
    }
  }, [filteredData, props]);

  useEffect(() => {
    if (data && data.length > 0) {
      if (hasAdditionalSelection) {
        setClickedAttribute(attributes[0]);
        handleFilterButtonClicked(attributes[0]);
      } else {
        setFilteredData(data);
      }
    }
  }, [data]);

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
  }, [chartRef, chartInstance]); // delete dependencie from dependencies arr. It was added just for test

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
