'use client';

import { ReactElement, useEffect, useRef } from 'react';
import { echarts, ECHARTS_LOCALE } from '@/utils/Charts/echartsClient';
import {
  resolveSingleValueChartNumber,
  SingleValueChartTabData,
} from '@/utils/Charts/chartHelper';
import { ECharts, EChartsOption } from 'echarts';
import { useSearchParams } from 'next/navigation';

type Radial180ChartProps = {
  minValue: number;
  maxValue: number;
  unit: string;
  value: number | string;
  fontColor: string;
  fontSize: string;
  backgroundColor: string;
  fillColor: string;
  unitFontSize: string;
  tabData?: SingleValueChartTabData;
  usesQueryParameter?: boolean;
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
    usesQueryParameter = false,
  } = props;
  const { value } = props;

  const searchParams = useSearchParams();
  const entityId = usesQueryParameter ? searchParams.get('entityId') : null;
  const resolvedValue = resolveSingleValueChartNumber(value, tabData, entityId);

  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !chartRef.current) {
      return;
    }

    chartInstanceRef.current = echarts.init(chartRef.current, undefined, {
      locale: ECHARTS_LOCALE,
    });

    const resizeChart = (): void => {
      chartInstanceRef.current?.resize();
    };

    window.addEventListener('resize', resizeChart);

    return () => {
      window.removeEventListener('resize', resizeChart);
      chartInstanceRef.current?.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartInstanceRef.current) {
      return;
    }

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
            formatter: () => `{value|${resolvedValue}}\n{unitDisplay|${unit}}`,
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
          data: [{ value: resolvedValue, itemStyle: { color: fontColor } }],
        },
      ],
    };

    chartInstanceRef.current.setOption(option, true);
  }, [
    minValue,
    maxValue,
    unit,
    resolvedValue,
    fontColor,
    fontSize,
    backgroundColor,
    fillColor,
    unitFontSize,
  ]);

  return <div className="w-full h-full" ref={chartRef} />;
}
