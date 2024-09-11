'use client';

import { ReactElement, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ECharts, EChartsOption } from 'echarts';
import { ChartData } from '@/types';

const dataDummy: [string, number][] = [
  ['2024-01-11', 20],
  ['2024-01-12', 50],
  ['2024-01-13', 30],
  ['2024-01-14', 40],
  ['2024-01-15', 80],
  ['2024-01-16', 60],
  ['2024-01-17', 7],
];

const defaultData: ChartData[] = [{ name: 'Default', values: dataDummy }];

type BarChartProps = {
  labels: string[] | undefined;
  data: ChartData[] | undefined;
  xAxisLabel?: string;
  yAxisLabel?: string;
  allowZoom?: boolean;
  showLegend?: boolean;
  staticValues: number[];
  staticValuesColors: string[];
  fontColor: string;
  axisColor: string;
};

export default function BarChart(props: BarChartProps): ReactElement {
  const {
    labels,
    data,
    xAxisLabel,
    yAxisLabel,
    allowZoom,
    showLegend,
    staticValues,
    staticValuesColors,
    fontColor,
    axisColor,
  } = props;

  const chartRef = useRef<HTMLDivElement>(null);
  let myChart: ECharts | null = null;
  const finalData = data && data.length > 0 ? data : defaultData;

  const initializeChart = (): void => {
    if (chartRef.current) {
      myChart = echarts.init(chartRef.current);

      // Main data series
      const series: echarts.BarSeriesOption[] = [];
      if (finalData && finalData.length > 0) {
        for (let i = 0; i < finalData.length; i++) {
          const dataArray = finalData[i].values;
          const tempSeries: echarts.BarSeriesOption = {
            data: dataArray,
            type: 'bar',
            name: finalData[i].name,
          };
          series.push(tempSeries);
        }
      }

      // Static value series
      const staticValueSeries: echarts.LineSeriesOption[] =
        staticValues && staticValues?.length > 0
          ? staticValues.map((value, index) => ({
              data: finalData[0].values.map((label) => [label[0], value]),
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
          name: xAxisLabel,
          type: 'time',
          splitNumber: 11,
          nameTextStyle: {
            color: fontColor,
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
            lineStyle: {
              color: axisColor,
              width: 2,
            },
            show: true,
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
      if (myChart !== null) {
        myChart.dispose();
      }
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
    staticValues,
    staticValuesColors,
  ]);

  return <div className="w-full h-full" ref={chartRef} />;
}
