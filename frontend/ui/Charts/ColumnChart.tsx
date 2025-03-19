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
  barColor?: string;
  gridColor?: string;
  warningColor?: string;
  alarmColor?: string;
  axisTicksFontColor: string;
};

export default function ColumnChart({
  value,
  chartLabels,
  maxValue,
  valueWarning,
  valueAlarm,
  barColor,
  gridColor,
  warningColor,
  alarmColor,
  axisTicksFontColor,
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
              color: axisTicksFontColor,
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
              color: gridColor || '#e8e8e8',
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
              color: barColor,
            },
            markLine: {
              silent: true,
              label: {
                show: false,
              },
              symbol: 'none',
              data: [
                {
                  yAxis: valueWarning,
                  name: 'Warnung',
                  lineStyle: {
                    color: warningColor,
                    type: 'solid',
                  },
                },
                {
                  yAxis: valueAlarm,
                  name: 'Alarm',
                  lineStyle: {
                    color: alarmColor,
                    type: 'solid',
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
  }, [value, chartLabels, maxValue, barColor]);

  return <div className="w-full h-full" ref={chartRef} />;
}
