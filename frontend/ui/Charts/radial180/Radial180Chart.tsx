'use client';

import { ReactElement, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ECharts, EChartsOption } from 'echarts';

type Radial180ChartProps = {
  minValue: number;
  maxValue: number;
  unit: string;
  value: number;
  fontColor: string;
  fontSize: string;
  backgroundColor: string;
  fillColor: string;
  unitFontSize: string;
};

export default function Radial180Chart(
  props: Radial180ChartProps,
): ReactElement {
  const {
    minValue,
    maxValue,
    unit,
    value,
    fontColor,
    fontSize,
    backgroundColor,
    fillColor,
    unitFontSize,
  } = props;
  const chartRef = useRef(null);
  let myChart: ECharts | null = null;

  const initializeChart = (): void => {
    myChart = echarts.init(chartRef.current);

    const option: EChartsOption = {
      series: [
        {
          type: 'gauge',
          startAngle: 180,
          endAngle: 0,
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
            width: 12,
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
            },
          },
          axisLabel: {
            distance: 0,
            color: fontColor,
            fontSize: 16,
          },
          detail: {
            formatter: () => `{value|${value}}\n{unitDisplay|${unit}}`,
            offsetCenter: [0, '0%'],
            rich: {
              value: {
                fontSize: fontSize,
                color: fontColor,
              },
              unitDisplay: {
                fontSize: unitFontSize,
                color: fontColor,
              },
            },
          },
          radius: '90%',
          center: ['50%', '70%'],
          data: [{ value: value, itemStyle: { color: fontColor } }],
        },
      ],
    };

    myChart.setOption(option);
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
    fontColor,
    fontSize,
    backgroundColor,
    fillColor,
  ]);

  return <div className="w-full h-full" ref={chartRef} />;
}
