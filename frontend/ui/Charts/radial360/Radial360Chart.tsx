'use client';

import { ReactElement, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ECharts, EChartsOption } from 'echarts';

type Radial360ChartProps = {
  minValue: number;
  maxValue: number;
  unit: string;
  value: number;
  mainColor: string;

  fontColor: string;
  fontSize: string;
  backgroundColor: string;
  fillColor: string;
  unitFontSize: string;
};

export default function Radial360Chart(
  props: Radial360ChartProps,
): ReactElement {
  const {
    minValue,
    maxValue,
    unit,
    value,
    mainColor,
    fontColor,
    fontSize,
    backgroundColor,
    fillColor,
    unitFontSize,
  } = props;

  const chartRef = useRef<HTMLDivElement | null>(null);
  let myChart: ECharts | null = null;

  const initializeChart = (): void => {
    if (chartRef.current) {
      myChart = echarts.init(chartRef.current);

      const option: EChartsOption = {
        series: [
          {
            type: 'gauge',
            startAngle: 0,
            endAngle: 360,
            min: minValue,
            max: maxValue,
            splitNumber: 1,
            axisLine: {
              lineStyle: {
                width: 12,
                color: [[1, backgroundColor]],
              },
            },
            progress: {
              show: true,
              roundCap: true,
              itemStyle: {
                color: fillColor,
              },
            },
            pointer: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
              length: 15,
              lineStyle: {
                width: 2,
                color: mainColor,
              },
            },
            axisLabel: {
              show: false,
              distance: 0,
              color: fontColor,
              fontSize: 16,
            },
            detail: {
              formatter: function (params): string {
                return `{value|${params}}\n{unit|${unit}}`;
              },
              color: fontColor,
              offsetCenter: [0, '0%'],
              rich: {
                value: {
                  fontSize: fontSize,
                  color: fontColor,
                },
                unit: {
                  color: fontColor,
                  fontSize: unitFontSize,
                },
              },
            },
            radius: '80%',
            center: ['50%', '50%'],
            data: [{ value: value, itemStyle: { color: fontColor } }],
          },
        ],
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
    minValue,
    maxValue,
    unit,
    value,
    mainColor,
    fontColor,
    fontSize,
    backgroundColor,
    fillColor,
    unitFontSize,
  ]); // Added color props as dependencies

  return <div className="w-full h-full" ref={chartRef} />;
}
