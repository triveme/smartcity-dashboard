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
  calculateMinYAxisValue,
  calculateMaxYAxisValue,
  getChartDateFormatter,
  getChartDateRichText,
} from '@/utils/chartHelper';
import { applyUserLocaleToNumber, roundToDecimal } from '@/utils/mathHelper';
import DashboardIcon from '../Icons/DashboardIcon';
import FilterButton from '../Buttons/FilterButton';

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
  decimalPlaces?: number;
  isShownInMapModal?: boolean;
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
    decimalPlaces,
    isShownInMapModal = false,
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

      const series: echarts.LineSeriesOption[] = [];
      if (filteredData && filteredData.length > 0) {
        for (let i = 0; i < filteredData.length; i++) {
          const dataArray = filteredData[i].values;
          const tempSeries: echarts.LineSeriesOption = {
            data: dataArray,
            type: 'line',
            symbolSize: isShownInMapModal ? 0 : 6,
            step: isStepline ? 'start' : undefined,
            name: sensorNames[i],
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
            }))
          : [];

      const option: EChartsOption = {
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
              ? getChartDateFormatter(chartDateRepresentation)
              : undefined,
            rich: chartDateRepresentation
              ? getChartDateRichText(chartDateRepresentation)
              : undefined,
          },
          axisTick: {
            show: false,
          },
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
          right: 10,
          top: isShownInMapModal ? 20 : 30,
          bottom: isShownInMapModal
            ? 20
            : calculateBottomGrid(xAxisLabel || '', allowZoom),
          containLabel: true,
        },
        series: [...series, ...staticValueSeries],
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
          trigger: 'axis',
          valueFormatter: (value) =>
            applyUserLocaleToNumber(
              roundToDecimal(Number(value), decimalPlaces),
              navigator.language || 'de-DE',
            ),
        },
      };

      chartInstance.current.setOption(option);
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
      <div className="w-full h-full" ref={chartRef} />
    </div>
  );
}
