'use client';

import { ReactElement, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ECharts, EChartsOption } from 'echarts';
import { ChartData } from '@/types';

const labelsDummy = [
  '2024-01-10',
  '2024-01-11',
  '2024-01-12',
  '2024-01-13',
  '2024-01-14',
  '2024-01-15',
  '2024-01-16',
];

const dataDummy = [20, 50, 30, 40, 80, 60, 70];

const defaultData: ChartData[] = [{ name: 'Default', values: dataDummy }];

type LineChartProps = {
  labels: string[] | undefined;
  data: ChartData[] | undefined;
  xAxisLabel?: string;
  yAxisLabel?: string;
  allowZoom?: boolean;
  isStepline?: boolean;
  showLegend?: boolean;
  staticValues: number[];
  staticValuesColors: string[];
  fontColor: string;
  axisColor: string;
};

export default function LineChart(props: LineChartProps): ReactElement {
  const {
    labels,
    data,
    xAxisLabel,
    yAxisLabel,
    allowZoom,
    isStepline,
    showLegend,
    staticValues,
    staticValuesColors,
    fontColor,
    axisColor,
  } = props;

  const chartRef = useRef<HTMLDivElement>(null);
  let myChart: ECharts | null = null;
  const finalData = data && data.length > 0 ? data : defaultData;
  const finalLabels = labels && labels.length > 0 ? labels : labelsDummy;

  const initializeChart = (): void => {
    if (chartRef.current) {
      myChart = echarts.init(chartRef.current);

      // Main data series
      const series: echarts.LineSeriesOption[] = finalData.map((ds) => ({
        data: ds.values.map((value, index) => [finalLabels[index], value]),
        type: 'line',
        name: ds.name,
        symbolSize: 6,
        step: isStepline ? 'start' : undefined,
      }));

      // Static value series
      const staticValueSeries: echarts.LineSeriesOption[] =
        staticValues && staticValues.length > 0
          ? staticValues.map((value, index) => ({
              data: finalLabels.map((label) => [label, value]),
              type: 'line',
              symbol: 'none',
              lineStyle: {
                color: staticValuesColors[index],
                type: 'solid',
              },
            }))
          : [];

      const option: EChartsOption = {
        xAxis: {
          type: 'category',
          data: finalLabels,
          name: xAxisLabel,
          nameTextStyle: {
            color: fontColor,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: axisColor,
              width: 2,
            },
          },
          axisLabel: {
            color: fontColor,
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          name: yAxisLabel,
          nameTextStyle: {
            color: fontColor,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: axisColor,
              width: 2,
            },
          },
          axisLabel: {
            color: fontColor,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
        },
        legend: {
          top: 'top',
          show: showLegend,
          textStyle: {
            color: fontColor,
          },
          padding: [20, 0, 0, 0],
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
          show: true,
          trigger: 'item',
        },
        grid: {
          left: 50,
          right: 50,
        },
      };

      myChart.setOption(option);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeChart();

      const resizeChart = (): void => {
        if (myChart !== null) {
          myChart.resize();
        }
      };

      window.addEventListener('resize', resizeChart);

      return () => {
        window.removeEventListener('resize', resizeChart);
        if (myChart !== null) {
          myChart.dispose();
        }
      };
    }
  }, [
    labels,
    finalData,
    xAxisLabel,
    yAxisLabel,
    allowZoom,
    isStepline,
    staticValues,
    staticValuesColors,
  ]);

  return <div className="w-full h-full" ref={chartRef} />;
}
