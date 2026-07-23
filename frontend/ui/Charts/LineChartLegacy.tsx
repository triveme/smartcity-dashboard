'use client';
import {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { echarts, ECHARTS_LOCALE } from '@/utils/Charts/echartsClient';
import { ECharts, EChartsOption } from 'echarts';
import {
  aggregationEnum,
  ChartData,
  CurrentAreaConfig,
  timeframeEnum,
} from '@/types';
import {
  formatYAxisLabel,
  calculateYAxisNameGap,
  calculateBottomGrid,
  getUniqueField,
  calculateMinYAxisValue,
  calculateMaxYAxisValue,
  getChartDateFormatter,
  getChartDateRichText,
  getLabelMap,
  getSelectedLegendNames,
  formatTickByAggrPeriod,
  setXAxisBounds,
  getAdaptiveWeekdayFormatter,
} from '@/utils/Charts/chartHelper';
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
} from '@/utils/Charts/lineChartUtil';
import { debounce } from 'lodash';
import WizardLabel from '../WizardLabel';
import { useSearchParams } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import eventBus, { VISIBLE_CHART_DATA_DOWNLOAD_EVENT } from '@/app/EventBus';
// import { downloadChartDataCsv } from '@/utils/downloadHelper';

type LegendSelectedMap = Record<string, boolean>;

type LineChartProps = {
  chartDateRepresentation?: string | 'Default';
  setXByTimeFramePeriod?: boolean;
  timeFramePeriod?: string | null;
  authDataType?: string | null;
  chartYAxisScale?: number | undefined;
  chartYAxisScaleChartMinValue?: number | undefined;
  chartYAxisScaleChartMaxValue?: number | undefined;
  labels: string[] | undefined;
  data: ChartData[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  hideXAxis?: boolean;
  hideYAxis?: boolean;
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
  widgetId?: string;
  usesQueryParameter?: boolean;
  exportBackgroundColor?: string;
};

function filterSeriesDataByAttribute(
  sourceData: ChartData[],
  attribute: string,
): ChartData[] {
  if (!attribute) {
    return sourceData;
  }

  return sourceData.filter((item) => item.name.endsWith(attribute));
}

function getSelectedChartData(
  sourceData: ChartData[],
  attribute: string,
  hasAdditionalSelection: boolean,
): ChartData[] {
  if (!hasAdditionalSelection) {
    return sourceData;
  }

  return filterSeriesDataByAttribute(sourceData, attribute);
}

export default function LineChart(props: LineChartProps): ReactElement {
  const {
    widgetId,
    chartDateRepresentation,
    setXByTimeFramePeriod,
    timeFramePeriod,
    chartYAxisScale,
    chartYAxisScaleChartMinValue,
    chartYAxisScaleChartMaxValue,
    data,
    xAxisLabel,
    yAxisLabel,
    hideXAxis = false,
    hideYAxis = false,
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
    usesQueryParameter = false,
    authDataType,
    exportBackgroundColor,
  } = props;

  const searchParams = useSearchParams();
  const entityId = usesQueryParameter ? searchParams.get('entityId') : null;
  const initialChartData = entityId
    ? data.filter((x) => x.id === entityId)
    : data;
  const initialAttributes = getUniqueField(initialChartData, false);
  const initialClickedAttribute =
    hasAdditionalSelection && initialAttributes.length > 0
      ? initialAttributes[0]
      : '';
  const initialFilteredData = getSelectedChartData(
    initialChartData,
    initialClickedAttribute,
    hasAdditionalSelection,
  );

  const [chartData] = useState<ChartData[]>(initialChartData);

  const [filteredData, setFilteredData] =
    useState<ChartData[]>(initialFilteredData);
  const [clickedAttribute, setClickedAttribute] = useState<string>(
    initialClickedAttribute,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [xAxisMin, setXAxisMin] = useState<number | undefined>();
  const [xAxisMax, setXAxisMax] = useState<number | undefined>();

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ECharts | null>(null);
  const resizeFrameRef = useRef<number | null>(null);
  const textMeasureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const attributes = getUniqueField(chartData, false);
  const axisData = filteredData.length > 0 ? filteredData : chartData;

  const xFullRange = useMemo(
    () =>
      xAxisMin !== undefined && xAxisMax !== undefined
        ? {
            min: new Date(xAxisMin),
            max: new Date(xAxisMax),
          }
        : getXMinMax(filteredData),
    [filteredData, xAxisMax, xAxisMin],
  );
  const [xRange, setXRange] = useState<{ min: Date; max: Date } | null>(null);
  const hasEndLabel = useRef<echarts.LineSeriesOption | undefined>(undefined);

  const [minDate, setMinDate] = useState<Date | undefined>(new Date());
  const [maxDate, setMaxDate] = useState<Date | undefined>(new Date());
  const update = debounce(() => {
    const chart = chartInstance.current;
    if (!chart) return;

    const range = getVisibleDateRange(chart);
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

    setXRange(range);
    const daysIntervall = getIntervalDaysFromChart(chart, 20, range);
    const allSeries = getAllSeries(daysIntervall);
    chart.setOption({ series: allSeries }, false);
  }, 500);

  // Function for sending the data visible on the axis
  const sendCurrentAreaChartData = (currentAreaConfig: CurrentAreaConfig) => {
    eventBus.emit(VISIBLE_CHART_DATA_DOWNLOAD_EVENT, {
      data: currentAreaConfig,
    });
  };

  const getBaseBottomGrid = (): number => {
    const baseBottom = calculateBottomGrid(
      hideXAxis ? '' : xAxisLabel || '',
      allowZoom,
      advancedDateSelection,
    );

    if (allowZoom && !advancedDateSelection && !hideXAxis && xAxisLabel) {
      return baseBottom + 12;
    }

    return baseBottom;
  };

  const initializeChart = (): void => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      chartInstance.current = echarts.init(chartRef.current, undefined, {
        locale: ECHARTS_LOCALE,
      });

      const seriesAll = getAllSeries(0);
      const labelMap = getLabelMap(chartDateRepresentation, seriesAll);
      hasEndLabel.current = seriesAll.find((value) => value.endLabel?.show);

      // Calculate dynamic splitNumber based on the container width
      const containerWidth = chartRef.current.clientWidth;
      const splitNumber = Math.max(5, Math.floor(containerWidth / 100));
      const hasYAxisTitle = !hideYAxis && Boolean(yAxisLabel?.trim());
      const horizontalLeftInset = hasYAxisTitle ? 12 : 6;
      const horizontalRightInset = allowImageDownload ? 30 : 12;
      const xAxisNameGap = hideXAxis
        ? 0
        : isShownInMapModal
          ? 32
          : allowZoom && xAxisLabel && !advancedDateSelection
            ? 30
            : 41;
      const weekdayFormatter =
        chartDateRepresentation === 'Weekdays'
          ? getAdaptiveWeekdayFormatter(
              containerWidth / Math.max(splitNumber, 1),
              axisFontSize,
            )
          : undefined;
      const option: EChartsOption = {
        animation: playAnimation,
        animationDuration: 2000,
        animationEasing: 'cubicOut',
        animationDelay: 0,
        animationDurationUpdate: 0,
        animationEasingUpdate: 'cubicOut',
        xAxis: {
          name: hideXAxis ? '' : xAxisLabel,
          type: 'time',
          splitNumber: splitNumber,
          nameLocation: 'middle',
          nameGap: xAxisNameGap,
          nameTextStyle: {
            color: axisLabelFontColor,
            fontSize: axisLabelSize,
          },
          axisLine: {
            lineStyle: {
              color: axisLineColor,
              width: 2,
            },
            show: !hideXAxis,
          },
          axisLabel: {
            color: axisTicksFontColor,
            fontSize: axisFontSize,
            hideOverlap: true,
            show: !hideXAxis,
            // When setXByTimeFramePeriod is true, enforce a fixed format for all ticks
            formatter:
              setXByTimeFramePeriod && timeFramePeriod
                ? (value: unknown): string =>
                    formatTickByAggrPeriod(
                      value as number | string,
                      timeFramePeriod,
                      xFullRange,
                    )
                : weekdayFormatter
                  ? weekdayFormatter
                  : chartDateRepresentation
                    ? getChartDateFormatter(chartDateRepresentation, labelMap)
                    : undefined,
            // Disable rich text when custom formatter is active to avoid mixed styles
            rich:
              setXByTimeFramePeriod && timeFramePeriod
                ? undefined
                : chartDateRepresentation
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
          name: hideYAxis ? '' : formatYAxisLabel(yAxisLabel || ''),
          nameGap: hideYAxis ? 0 : calculateYAxisNameGap(axisData),
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
            show: !hideYAxis,
          },
          axisLabel: {
            color: axisTicksFontColor,
            fontSize: axisFontSize,
            show: !hideYAxis,
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
            show: !hideYAxis,
            lineStyle: {
              color: gridColor,
              type: 'dashed',
            },
          },
          min:
            chartYAxisScale !== undefined
              ? chartYAxisScaleChartMinValue
              : chartHasAutomaticZoom
                ? calculateMinYAxisValue(axisData, decimalPlaces)
                : undefined,
          max:
            chartYAxisScale !== undefined
              ? chartYAxisScaleChartMaxValue
              : chartHasAutomaticZoom
                ? calculateMaxYAxisValue(axisData, decimalPlaces)
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
              backgroundColor: exportBackgroundColor,
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
          horizontalLeftInset,
          getBaseBottomGrid(),
          horizontalRightInset,
        ),
        dataZoom: allowZoom
          ? [
              {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'none',
                start: 0,
                end: 100,
                bottom: advancedDateSelection ? 54 : undefined,
                left: horizontalLeftInset,
                right: horizontalRightInset,
              },
              {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'none',
                start: 0,
                end: 100,
                bottom: advancedDateSelection ? 54 : undefined,
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
        series: seriesAll,
      };

      chartInstance.current.setOption(option);
      syncChartLayout(chartInstance.current, containerWidth);

      const legendListener = (params: unknown): void => {
        const p = params as { name: string; selected: Record<string, boolean> };
        if (singleSelectLegend) {
          handleLegendSelect(p);
        }
        update();
      };

      chartInstance.current.off('legendselectchanged', legendListener);
      chartInstance.current.on('legendselectchanged', legendListener);

      chartInstance.current.off('datazoom', update);
      chartInstance.current.on('datazoom', update);
      // Clean up previous listeners on dispose
      chartRef.current.addEventListener('dispose', () => {
        chartInstance.current?.off('datazoom', update);
        chartInstance.current?.off('legendselectchanged', legendListener);
      });

      update();
    }
  };

  const handleFilterButtonClicked = useCallback(
    (nextAttribute: string): void => {
      setClickedAttribute(nextAttribute);
      setFilteredData(
        getSelectedChartData(chartData, nextAttribute, hasAdditionalSelection),
      );
    },
    [chartData, hasAdditionalSelection],
  );

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
    const relevantData = filteredData.length > 0 ? filteredData : chartData;

    setXAxisBounds(
      relevantData,
      timeFramePeriod ?? 'live',
      setXByTimeFramePeriod ?? false,
      setXAxisMin,
      setXAxisMax,
    );
  }, [filteredData, chartData, timeFramePeriod, setXByTimeFramePeriod]);

  useEffect(() => {
    setXRange(xFullRange);
  }, [xFullRange]);

  useEffect(() => {
    setMaxDate(xRange?.max);
    setMinDate(xRange?.min);
  }, [xRange]);

  useEffect(() => {
    if (filteredData && filteredData.length > 0 && xFullRange) {
      initializeChart();
    }

    const chart = chartInstance.current;
    if (!chart) return;
    syncChartLayout(chart, chartRef.current?.clientWidth);
  }, [filteredData, props, xAxisMin, xAxisMax]);

  useEffect(() => {
    if (chartData && chartData.length > 0) {
      if (hasAdditionalSelection) {
        if (!clickedAttribute && attributes[0]) {
          handleFilterButtonClicked(attributes[0]);
        }
      } else {
        setFilteredData(chartData);
      }
    }
  }, [
    attributes,
    chartData,
    clickedAttribute,
    handleFilterButtonClicked,
    hasAdditionalSelection,
  ]);

  // Observe the window size
  useEffect(() => {
    const chartElement = chartRef.current;
    const observer = new ResizeObserver(() => {
      if (chartInstance.current) {
        if (resizeFrameRef.current !== null) {
          cancelAnimationFrame(resizeFrameRef.current);
        }

        resizeFrameRef.current = requestAnimationFrame(() => {
          if (chartInstance.current) {
            syncChartLayout(
              chartInstance.current,
              chartRef.current?.clientWidth,
            );
          }
        });
      }
    });

    if (chartElement) {
      observer.observe(chartElement);
    }

    return () => {
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
      }
      if (chartElement) {
        observer.unobserve(chartElement);
      }
      if (chartInstance.current && singleSelectLegend) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full h-full min-w-0 flex flex-col sm:flex-row">
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
      <div className="min-w-0 h-full flex flex-1 flex-col">
        <div className="w-full min-h-0 flex-1" ref={chartRef} />
        {allowZoom && xRange && advancedDateSelection && (
          <div className="w-full shrink-0 px-4 -mt-4">
            <div className="flex flex-wrap items-center gap-1">
              <div className="flex min-w-[320px] flex-1 items-center gap-2">
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
                  wrapperClassName="w-full min-w-0 flex-1"
                  customInput={
                    <input
                      className="block h-14 w-full min-w-0 rounded-lg border-4 p-4 text-base"
                      style={{
                        color: 'white',
                        backgroundColor: filterColor ?? '#F1B434',
                        border: filterColor ?? '#F1B434',
                        borderRadius: '6px',
                      }}
                    />
                  }
                  dateFormat={'yyyy-dd-MM'}
                  maxDate={xFullRange?.max}
                  minDate={xFullRange?.min}
                />
              </div>
              <div className="flex min-w-[320px] flex-1 items-center gap-2">
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
                  wrapperClassName="w-full min-w-0 flex-1"
                  customInput={
                    <input
                      className="block h-14 w-full min-w-0 rounded-lg border-4 p-4 text-base"
                      style={{
                        color: 'white',
                        backgroundColor: filterColor ?? '#F1B434',
                        border: filterColor ?? '#F1B434',
                        borderRadius: '6px',
                      }}
                    />
                  }
                  dateFormat={'yyyy-dd-MM'}
                  maxDate={xFullRange?.max}
                  minDate={xFullRange?.min}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function getAllSeries(intervallDays: number): echarts.LineSeriesOption[] {
    const series: echarts.LineSeriesOption[] = [];
    const seriesData = filteredData;
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
    if (!textMeasureCanvasRef.current) {
      textMeasureCanvasRef.current = document.createElement('canvas');
    }

    const context = textMeasureCanvasRef.current.getContext('2d');
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

  function getVisibleLegendNames(chart?: ECharts): string[] {
    if (filteredData.length > 0) {
      return filteredData.map((series) => series.name);
    }

    if (chart) {
      const option = chart.getOption();
      const chartSeries = Array.isArray(option.series)
        ? option.series
        : option.series
          ? [option.series]
          : [];

      return chartSeries
        .map((series) =>
          typeof series?.name === 'string' ? series.name : undefined,
        )
        .filter((name): name is string => Boolean(name));
    }

    return [];
  }

  function syncChartLayout(chart: ECharts, nextWidth?: number): void {
    const width =
      nextWidth ?? chartRef.current?.clientWidth ?? chart.getWidth();
    const height = chartRef.current?.clientHeight ?? chart.getHeight();

    applyResponsiveGridBottom(chart, width);
    chart.resize({
      width,
      height,
      silent: true,
    });
  }

  function applyResponsiveGridBottom(chart: ECharts, nextWidth?: number): void {
    const baseBottom = getBaseBottomGrid();

    if (!showLegend || !advancedDateSelection) {
      setGridBottom(chart, baseBottom);
      return;
    }

    const legendNames = getVisibleLegendNames(chart);
    if (legendNames.length === 0) {
      setGridBottom(chart, baseBottom);
      return;
    }

    const chartWidth =
      nextWidth ?? chartRef.current?.clientWidth ?? chart.getWidth();
    const legendHeight = estimateLegendHeight(
      legendNames,
      chartWidth,
      24,
      0.72,
    );
    const legendBottomOffset = advancedDateSelection ? 12 : 8;
    let responsiveWidthReserve = 0;

    if (chartWidth < 1200) responsiveWidthReserve += 10;
    if (chartWidth < 1024) responsiveWidthReserve += 8;
    if (chartWidth < 860) responsiveWidthReserve += 8;

    const extraLegendSpace =
      Math.max(0, legendHeight - 48) +
      legendBottomOffset +
      responsiveWidthReserve;

    setGridBottom(chart, baseBottom + extraLegendSpace);
  }

  function setGridBottom(chart: ECharts, bottom: number): void {
    chart.setOption(
      {
        grid: [
          {
            bottom,
          },
        ],
      },
      {
        replaceMerge: ['grid'],
        lazyUpdate: false,
        silent: true,
      },
    );
  }
}
