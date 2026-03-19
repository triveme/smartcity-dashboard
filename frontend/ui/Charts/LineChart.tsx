'use client';
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { echarts, ECHARTS_LOCALE } from '@/utils/echartsClient';
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
  getVisibleDateRange,
  setVisibleDateRange,
  getGridOptions,
  getLegendOptions,
} from '@/utils/lineChartUtil';
import { debounce } from 'lodash';
import WizardLabel from '../WizardLabel';
import { useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type LegendSelectedMap = Record<string, boolean>;

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
  singleSelectLegend?: boolean;
  advancedDateSelection?: boolean;
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
  menuHoverColor: string;
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
    singleSelectLegend,
    advancedDateSelection,
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
    menuHoverColor,
  } = props;

  const searchParams = useSearchParams();
  const entityId = searchParams.get('entityId');

  const [chartData] = useState<ChartData[]>(
    entityId ? data.filter((x) => x.id === entityId) : data,
  );

  const [filteredData, setFilteredData] = useState<ChartData[]>(
    hasAdditionalSelection ? [] : data,
  );
  const [clickedAttribute, setClickedAttribute] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);
  const chartInitialized = useRef<boolean>(false);

  const attributes = getUniqueField(chartData, false);

  const xFullRange = getXMinMax(filteredData); // TODO This should maybe update on filter
  const [xRange, setXRange] = useState(xFullRange);
  const hasEndLabel = useRef<echarts.LineSeriesOption | undefined>(undefined);

  const [minDate, setMinDate] = useState<Date | undefined>(new Date());
  const [maxDate, setMaxDate] = useState<Date | undefined>(new Date());

  const textMeasureCanvas = document.createElement('canvas');

  const update = debounce(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    const range = getVisibleDateRange(chart);
    if (!range) return;
    setXRange(range);
    const daysIntervall = getIntervalDaysFromChart(chart, 20, range);
    const allSeries = getAllSeries(daysIntervall);
    chart.setOption({ series: allSeries }, false);
  }, 500);

  const initializeChart = (): void => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        locale: ECHARTS_LOCALE,
      });

      chartInitialized.current = true;
      const seriesAll = getAllSeries(0);
      const labelMap = getLabelMap(chartDateRepresentation, seriesAll);
      hasEndLabel.current = seriesAll.find((value) => value.endLabel?.show);

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
          min: xFullRange?.min,
          max: xFullRange?.max,
        },
        yAxis: {
          name: formatYAxisLabel(yAxisLabel || ''),
          nameGap: calculateYAxisNameGap(chartData),
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
                ? calculateMinYAxisValue(chartData, decimalPlaces)
                : undefined,
          max:
            chartYAxisScale !== undefined
              ? chartYAxisScaleChartMaxValue
              : chartHasAutomaticZoom
                ? calculateMaxYAxisValue(chartData, decimalPlaces)
                : undefined,
        },
        legend: getLegendOptions(
          allowImageDownload,
          legendAlignment,
          legendFontSize,
          legendFontColor,
          singleSelectLegend,
          showLegend,
          advancedDateSelection,
        ),
        toolbox: {
          show: allowImageDownload,
          feature: {
            saveAsImage: {
              title: 'Als Bild herunterladen...    ',
              icon: 'path://M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z',
              iconStyle: {
                color: axisLabelFontColor,
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
        grid: getGridOptions(
          isShownInMapModal,
          hasEndLabel.current,
          parseInt(legendFontSize),
          calculateLeftGrid(yAxisLabel || '', legendAlignment),
          calculateBottomGrid(
            xAxisLabel || '',
            allowZoom,
            advancedDateSelection,
          ),
        ),
        dataZoom: allowZoom
          ? [
              {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'none',
                start: 0,
                end: 100,
                bottom: advancedDateSelection ? 70 : undefined,
              },
              {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'none',
                start: 0,
                end: 100,
                bottom: advancedDateSelection ? 70 : undefined,
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

      const listener = (params: unknown): void => {
        const p = params as { name: string; selected: Record<string, boolean> };
        handleLegendSelect(p);
      };
      if (singleSelectLegend) {
        chartInstance.current.on('legendselectchanged', listener);
      }
      chartInstance.current.on('datazoom', update);
      // Clean up previous listeners on dispose
      chartRef.current.addEventListener('dispose', () => {
        chartInstance.current?.off('datazoom', update);
        chartInstance.current?.off('legendselectchanged', listener);
      });
    }
  };

  const handleFilterButtonClicked = (clickedAttribute: string): void => {
    const tempData = chartData;
    let newFilteredData = tempData.filter((item) =>
      item.name.endsWith(clickedAttribute),
    );
    if (entityId) {
      newFilteredData = newFilteredData.filter((x) => x.id === entityId);
    }
    setClickedAttribute(clickedAttribute);
    setFilteredData(newFilteredData);
  };

  const handleLegendSelect = useCallback(
    (params: { name: string; selected: LegendSelectedMap }) => {
      const chart = chartInstance.current;
      if (!chart) return;

      const selectedMap = params.selected;
      const selectedKeys = Object.keys(selectedMap).filter(
        (key) => selectedMap[key],
      );

      // 1️⃣ None selected → reset all
      if (selectedKeys.length === 0) {
        const allSelected: LegendSelectedMap = {};
        Object.keys(selectedMap).forEach((key) => {
          allSelected[key] = true;
        });

        chart.setOption({ legend: { selected: allSelected } });
        return;
      }

      // 2️⃣ Multiple selected → force only clicked one
      if (selectedKeys.length > 1) {
        const onlyOne: LegendSelectedMap = {};
        Object.keys(selectedMap).forEach((key) => {
          onlyOne[key] = key === params.name;
        });

        chart.setOption({ legend: { selected: onlyOne } });
      }
    },
    [],
  );

  useEffect(() => {
    setMaxDate(xRange?.max);
    setMinDate(xRange?.min);
  }, [xRange]);

  useEffect(() => {
    if (filteredData && filteredData.length > 0) {
      initializeChart();
    }

    if (singleSelectLegend) {
      const chart = chartInstance.current;
      if (!chart) return;

      const width = chart.getWidth();
      const seriesData = [...filteredData];
      const names = seriesData.map((s) => s.name);

      const legendHeight = estimateLegendHeight(names, width);
      chart.setOption({
        grid: {
          bottom:
            legendHeight +
            calculateBottomGrid(
              xAxisLabel || '',
              allowZoom,
              advancedDateSelection,
            ),
        },
      });
    }
  }, [filteredData, props]);

  useEffect(() => {
    if (chartData && chartData.length > 0) {
      if (hasAdditionalSelection) {
        setClickedAttribute(attributes[0]);
        handleFilterButtonClicked(attributes[0]);
      } else {
        setFilteredData(filteredData);
      }
    }
  }, [chartData, entityId]);

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
      if (chartInstance.current && singleSelectLegend) {
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
        <div className="w-full h-full test" ref={chartRef} />
        {allowZoom && xRange && advancedDateSelection && (
          <div className="w-full flex" style={{ marginTop: -50 }}>
            <div className="flex w-1/2 mt-1 ml-4">
              <WizardLabel label="Beginn" />
              <DatePicker
                selected={minDate}
                onChange={(date: Date | null): void => {
                  const chart = chartInstance.current;
                  if (!chart) return;
                  const newDate = new Date(date as Date);
                  newDate.setHours(0, 0, 0); // Set time to start of date
                  setMinDate(newDate);
                  setVisibleDateRange(chart, newDate, maxDate as Date);
                }}
                wrapperClassName="w-full"
                customInput={
                  <input
                    className="block h-14 w-full border-4 rounded-lg p-4 text-base w-full"
                    style={{
                      color: 'white',
                      backgroundColor: filterColor ?? '#F1B434',
                      border: filterColor ?? '#F1B434',
                      borderRadius: '6px',
                    }}
                  />
                }
                dateFormat={'yyyy-dd-MM'}
                maxDate={xRange.max}
                minDate={xRange.min}
              />
            </div>
            <div className="flex w-1/2 mt-1 ml-4">
              <WizardLabel label="Ende" />
              <DatePicker
                selected={maxDate}
                onChange={(date: Date | null): void => {
                  const chart = chartInstance.current;
                  if (!chart) return;
                  const newDate = new Date(date as Date);
                  newDate.setHours(23, 59, 59); // Set time to end of date
                  setMaxDate(newDate);
                  setVisibleDateRange(chart, minDate as Date, newDate);
                }}
                wrapperClassName="w-full"
                customInput={
                  <input
                    className="flex h-14 w-full border-4 rounded-lg p-4 text-base w-full"
                    style={{
                      color: 'white',
                      backgroundColor: filterColor ?? '#F1B434',
                      border: filterColor ?? '#F1B434',
                      borderRadius: '6px',
                    }}
                  />
                }
                dateFormat={'yyyy-dd-MM'}
                maxDate={xRange.max}
                minDate={xRange.min}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function getAllSeries(intervallDays: number): echarts.LineSeriesOption[] {
    const series: echarts.LineSeriesOption[] = [];
    let seriesData = [...filteredData];
    if (entityId) {
      seriesData = seriesData.filter((x) => x.id === entityId);
    }
    if (clickedAttribute) {
      seriesData = seriesData.filter((item) =>
        item.name.includes(clickedAttribute),
      );
    }
    if (seriesData && seriesData.length > 0) {
      for (let i = 0; i < seriesData.length; i++) {
        const dataArray =
          chartAggregationMode && chartAggregationMode != aggregationEnum.none
            ? downsampleValues(
                seriesData[i].values,
                intervallDays,
                chartAggregationMode,
              )
            : seriesData[i].values;
        const tempSeries: echarts.LineSeriesOption = {
          data: dataArray,
          type: 'line',
          symbolSize: isShownInMapModal ? 0 : 6,
          step: isStepline ? 'start' : undefined,
          name: seriesData[i].name,
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
        if (seriesData[i].highlighted != undefined) {
          tempSeries.color = seriesData[i].highlighted
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
      seriesData &&
      seriesData.length > 0
        ? staticValues.map((value, index) => ({
            data: seriesData[0].values.map((label) => [label[0], value]),
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

  function measureText(text: string, font = '12px sans-serif'): number {
    const context = textMeasureCanvas.getContext('2d');
    if (context) {
      context.font = font;
      return context.measureText(text).width;
    }
    return 0;
  }

  function getLegendItemWidth(
    name: string,
    iconWidth: number,
    padding: number,
  ): number {
    const textWidth = measureText(name, `${legendFontSize}px sans-serif`);
    return iconWidth + textWidth + padding;
  }

  function estimateLegendHeight(
    names: string[],
    chartWidth: number,
    rowHeight = 24,
    legendWidthRatio = 0.95,
  ): number {
    const maxWidth = chartWidth * legendWidthRatio;
    let rows = 1;
    let currentRowWidth = 0;

    names.forEach((name) => {
      const itemWidth = getLegendItemWidth(name, 12, 25);
      if (currentRowWidth + itemWidth > maxWidth) {
        rows++;
        currentRowWidth = itemWidth;
      } else {
        currentRowWidth += itemWidth;
      }
    });

    return Math.ceil(rows * rowHeight) + 20;
  }
}
