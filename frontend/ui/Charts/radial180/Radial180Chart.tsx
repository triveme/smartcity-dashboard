'use client';

import { ReactElement, useEffect, useRef } from 'react';
import { echarts, ECHARTS_LOCALE } from '@/utils/echartsClient';

import { ECharts, EChartsOption } from 'echarts';
import { useSearchParams } from 'next/navigation';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabData?: any;
};

export default function Radial180Chart(
  props: Radial180ChartProps,
): ReactElement {
  const {
    minValue,
    maxValue,
    unit,
    fontColor,
    fontSize,
    backgroundColor,
    fillColor,
    unitFontSize,
    tabData,
  } = props;
  let { value } = props;

  const searchParams = useSearchParams();
  const entityId = searchParams.get('entityId');

  if (entityId && tabData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findValue = (tabData.chartData as any[]).find(
      (x) => x.id === entityId,
    );
    if (findValue && findValue.values && findValue.values.length > 0) {
      value = findValue.values[0];
    }
  }

  const chartRef = useRef(null);
  let myChart: ECharts | null = null;

  const initializeChart = (): void => {
    myChart = echarts.init(chartRef.current, undefined, {
      locale: ECHARTS_LOCALE,
    });

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
