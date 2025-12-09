'use client';
import { ReactElement, useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ECharts, EChartsOption } from 'echarts';
import { aggregationEnum, ChartData } from '@/types';
import {
  formatYAxisLabel,
  calculateYAxisNameGap,
  calculateLeftGrid,
  calculateBottomGrid,
  getUniqueField,
  calculateMinYAxisValue,
  calculateMaxYAxisValue,
  getChartDateFormatter,
  getChartDateRichText,
  getLabelMap,
} from '@/utils/chartHelper';
import DashboardIcon from '../Icons/DashboardIcon';
import FilterButton from '../Buttons/FilterButton';
import { generateTooltipContent } from '@/utils/chartTooltipHelper';
import {
  getIntervalDaysFromChart,
  downsampleValues,
  getXMinMax,
} from '@/utils/lineChartUtil';
import { debounce } from 'lodash';

type LineChartProps = {
  chartDateRepresentation?: string | 'Default';
  chartYAxisScale?: number | undefined;
  chartYAxisScaleChartMinValue?: number | undefined;
  chartYAxisScaleChartMaxValue?: number | undefined;
  labels: string[] | undefined;
  data: ChartData[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  allowImageDownload: boolean;
  allowZoom?: boolean;
  isStepline?: boolean;
  isStackedChart: boolean;
  chartHasAutomaticZoom?: boolean;
  showLegend?: boolean;
  staticValues: number[];
  staticValuesColors: string[];
  chartAggregationMode?: aggregationEnum;
  staticValuesTicks?: number[];
  staticValuesTexts?: string[];

  axisLabelFontColor: string;
  axisLineColor: string;
  legendFontSize: string;
  legendFontColor: string;
  axisFontSize: string;
  axisLabelSize: string;
  currentValuesColors: string[];
  gridColor: string;
  axisTicksFontColor: string;
  legendAlignment: string;
  hasAdditionalSelection: boolean;
  filterColor?: string;
  filterTextColor?: string;
  showTooltip?: boolean;
  hideTimeDetails?: boolean;
  decimalPlaces?: number;
  isShownInMapModal?: boolean;
  playAnimation?: boolean;
  highlightedColor?: string;
  unhighlightedColor?: string;
};

export default function LineChart(props: LineChartProps): ReactElement {
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
    isStepline,
    isStackedChart,
    showLegend,
    staticValues,
    staticValuesColors,
    staticValuesTexts = [],
    staticValuesTicks = [],
    axisLabelFontColor,
    chartHasAutomaticZoom,
    currentValuesColors,
    gridColor,
    axisTicksFontColor,
    axisFontSize,
    axisLabelSize,
    axisLineColor,
    legendFontSize,
    legendFontColor,
    legendAlignment,
    hasAdditionalSelection,
    filterColor,
    filterTextColor,
    showTooltip = true,
    hideTimeDetails = false,
    decimalPlaces,
    isShownInMapModal = false,
    playAnimation = true,
    highlightedColor,
    unhighlightedColor,
    chartAggregationMode = aggregationEnum.none,
  } = props;

  const [filteredData, setFilteredData] = useState<ChartData[]>(data);
  const [clickedAttribute, setClickedAttribute] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);

  const attributes = getUniqueField(data, false);
  const xRange = getXMinMax(filteredData); // TODO This should maybe update on filter

  const update = debounce(() => {
    const chart = chartInstance.current;
    if (!chart) return;
    const daysIntervall = getIntervalDaysFromChart(chart, 20);
    const allSeries = getAllSeries(daysIntervall);
    chart.setOption({ series: allSeries }, false);
  }, 200);

  const initializeChart = (): void => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = echarts.init(chartRef.current);

      const seriesAll = getAllSeries(0);
      const labelMap = getLabelMap(chartDateRepresentation, seriesAll);
      const hasEndLabel = seriesAll.find((value) => value.endLabel?.show);

      // Calculate dynamic splitNumber based on the container width
      const containerWidth = chartRef.current.clientWidth;
      const splitNumber = Math.max(5, Math.floor(containerWidth / 100));
      const option: EChartsOption = {
        animation: playAnimation,
        animationDuration: 2000,
        animationEasing: 'cubicOut',
        animationDelay: 0,
        animationDurationUpdate: 500,
        animationEasingUpdate: 'cubicOut',
        xAxis: {
          name: xAxisLabel,
          type: 'time',
          splitNumber: splitNumber,
          nameLocation: 'middle',
          nameGap: isShownInMapModal ? 26 : 35,
          nameTextStyle: {
            color: axisLabelFontColor,
            fontSize: axisLabelSize,
          },
          axisLine: {
            lineStyle: {
              color: axisLineColor,
              width: 2,
            },
            show: true,
          },
          axisLabel: {
            color: axisTicksFontColor,
            fontSize: axisFontSize,
            hideOverlap: true,
            formatter: chartDateRepresentation
              ? getChartDateFormatter(chartDateRepresentation, labelMap)
              : undefined,
            rich: chartDateRepresentation
              ? getChartDateRichText(chartDateRepresentation)
              : undefined,
          },
          axisTick: {
            show: false,
          },
          min: xRange?.min?.toISOString(),
          max: xRange?.max?.toISOString(),
        },
        yAxis: {
          name: formatYAxisLabel(yAxisLabel || ''),
          nameGap: calculateYAxisNameGap(data),
          nameLocation: 'middle',
          interval:
            chartYAxisScale !== undefined && chartYAxisScale !== 0
              ? chartYAxisScale
              : undefined,
          nameTextStyle: {
            color: axisLabelFontColor,
            fontSize: axisLabelSize,
          },
          axisLine: {
            lineStyle: {
              color: axisLineColor,
              width: 2,
            },
            show: true,
          },
          axisLabel: {
            color: axisTicksFontColor,
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
            show: true,
            lineStyle: {
              color: gridColor,
              type: 'dashed',
            },
          },
          min:
            chartYAxisScale !== undefined
              ? chartYAxisScaleChartMinValue
              : chartHasAutomaticZoom
                ? calculateMinYAxisValue(data, decimalPlaces)
                : undefined,
          max:
            chartYAxisScale !== undefined
              ? chartYAxisScaleChartMaxValue
              : chartHasAutomaticZoom
                ? calculateMaxYAxisValue(data, decimalPlaces)
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
                color: axisLabelFontColor,
                borderColor: axisLabelFontColor,
              },
            },
          },
        },
        grid: {
          left: isShownInMapModal
            ? 10
            : calculateLeftGrid(yAxisLabel || '', legendAlignment),
          right: hasEndLabel ? 100 * (14 / parseInt(legendFontSize)) : 10,
          top: isShownInMapModal ? 20 : 30,
          bottom: isShownInMapModal
            ? 20
            : calculateBottomGrid(xAxisLabel || '', allowZoom),
          containLabel: true,
        },
        dataZoom: allowZoom
          ? [
              {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'none',
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
          trigger: 'axis',
          formatter: (params: unknown) => {
            const tooltipContent = generateTooltipContent(
              params,
              decimalPlaces,
              hideTimeDetails,
              labelMap,
            );
            return tooltipContent;
          },
        },
      };

      chartInstance.current.setOption(option);

      update();

      chartInstance.current.on('datazoom', update);
      // Clean up previous listeners on dispose
      chartRef.current.addEventListener('dispose', () => {
        chartInstance.current?.off('datazoom', update);
      });
    }
  };

  const handleFilterButtonClicked = (clickedAttribute: string): void => {
    const tempData = data;
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
  }, []);

  return (
    <div className="w-full h-full flex flex-col sm:flex-row">
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
      <div className="w-full h-full flex flex-col sm:flex-col">
        <div className="w-full h-full" ref={chartRef} />
      </div>
    </div>
  );

  function getAllSeries(intervallDays: number): echarts.LineSeriesOption[] {
    const series: echarts.LineSeriesOption[] = [];
    if (filteredData && filteredData.length > 0) {
      for (let i = 0; i < filteredData.length; i++) {
        const dataArray =
          chartAggregationMode && chartAggregationMode != aggregationEnum.none
            ? downsampleValues(
                filteredData[i].values,
                intervallDays,
                chartAggregationMode,
              )
            : filteredData[i].values;
        const tempSeries: echarts.LineSeriesOption = {
          data: dataArray,
          type: 'line',
          symbolSize: isShownInMapModal ? 0 : 6,
          step: isStepline ? 'start' : undefined,
          name: filteredData[i].name,
          color: currentValuesColors[i % 10] || 'black',
          ...(isStackedChart && { stack: 'a' }),
          ...(isStackedChart && {
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: echarts.color.lift(
                    currentValuesColors[i % currentValuesColors.length],
                    -1,
                  ),
                },
                {
                  offset: 1,
                  color: echarts.color.lift(
                    currentValuesColors[i % currentValuesColors.length],
                    0.2,
                  ),
                },
              ]),
            },
          }),
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
    const seriesAll = [...series, ...staticValueSeries];
    return seriesAll;
  }
}
