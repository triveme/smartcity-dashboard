'use client';

import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';

type ColumnChartProps = {
  value: number;
  chartLabels: string[];
  maxValue: number;
  valueWarning?: number;
  valueAlarm?: number;
};

export default function ColumnChart({
  value,
  chartLabels,
  maxValue,
  valueWarning,
  valueAlarm,
}: ColumnChartProps): React.ReactElement {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let myChart: echarts.ECharts | null = null;

    if (chartRef.current) {
      myChart = echarts.init(chartRef.current);

      const option: EChartsOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: chartLabels,
          axisTick: {
            alignWithLabel: true,
          },
          axisLine: {
            lineStyle: {
              color: '#D9D9D9',
            },
          },
        },
        yAxis: {
          type: 'value',
          max: maxValue,
          min: 0,
          axisLine: {
            lineStyle: {
              color: '#D9D9D9',
            },
          },
          axisTick: {
            show: true,
          },
          axisLabel: {
            formatter: (value) => value.toString(),
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#e8e8e8',
              type: 'dashed',
            },
          },
        },
        series: [
          {
            type: 'bar',
            barWidth: '60%',
            data: [value],
            itemStyle: {
              color: '#DE507D',
            },
            markLine: {
              silent: true,
              symbol: 'none',
              data: [
                {
                  yAxis: valueWarning,
                  name: 'Warnung',
                  lineStyle: {
                    color: 'orange',
                    type: 'solid',
                  },
                  label: {
                    show: true,
                    color: 'white',
                    position: 'insideMiddleTop',
                    formatter: 'Warnung',
                  },
                },
                {
                  yAxis: valueAlarm,
                  name: 'Alarm',
                  lineStyle: {
                    color: 'red',
                    type: 'solid',
                  },
                  label: {
                    show: true,
                    color: 'white',
                    position: 'insideMiddleTop',
                    formatter: 'Alarm',
                  },
                },
              ],
            },
          },
        ],
      };

      myChart.setOption(option);

      const resizeChart = (): void => {
        myChart?.resize();
      };

      window.addEventListener('resize', resizeChart);

      return () => {
        window.removeEventListener('resize', resizeChart);
        myChart?.dispose();
      };
    }
  }, [value, chartLabels, maxValue]);

  return <div className="w-full h-full" ref={chartRef} />;
}
