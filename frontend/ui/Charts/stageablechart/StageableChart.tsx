'use client';

import { ReactElement, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ECharts, EChartsOption } from 'echarts';
import useAutoScaleFont from '@/app/custom-hooks/useAutoScaleFont';

type StageableChartProps = {
  unit: string;
  tiles: number;
  minValue: number;
  maxValue: number;
  staticValues: number[];
  staticValuesColors: string[];
  value: number;
};

type ColorStage = [number, string];

export default function StageableChart(
  props: StageableChartProps,
): ReactElement {
  const {
    tiles,
    minValue,
    maxValue,
    unit,
    staticValues,
    staticValuesColors,
    value,
  } = props;
  const chartRef = useRef<HTMLDivElement>(null);
  const myChartRef = useRef<ECharts | null>(null);
  const autoScaleAxisLabelFont = useAutoScaleFont({
    minSize: 10,
    maxSize: 20,
    divisor: 35,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && chartRef.current) {
      myChartRef.current = echarts.init(chartRef.current);

      const resizeChart = (): void => {
        if (myChartRef.current && chartRef.current) {
          myChartRef.current.resize();
        }
      };

      window.addEventListener('resize', resizeChart);

      return () => {
        window.removeEventListener('resize', resizeChart);
        if (myChartRef.current) {
          myChartRef.current.dispose();
        }
      };
    }
  }, []);

  function convertWholeNumberToDecimals(
    minValue: number,
    maxValue: number,
    staticValues: number[],
  ): number[] {
    return staticValues.map((boundary) => {
      return (boundary - minValue) / (maxValue - minValue);
    });
  }

  const decimalsArray = convertWholeNumberToDecimals(
    minValue,
    maxValue,
    staticValues,
  );

  const colorConfig: ColorStage[] = [];
  for (let i = 0; i < decimalsArray.length; i++) {
    colorConfig.push([decimalsArray[i], staticValuesColors[i]]);
  }
  colorConfig.push([1, staticValuesColors[staticValuesColors.length - 1]]);

  useEffect(() => {
    if (myChartRef.current) {
      const option: EChartsOption = {
        series: [
          {
            type: 'gauge',
            splitNumber: tiles,
            min: minValue,
            max: maxValue,
            axisLine: {
              lineStyle: {
                width: 35,
                color: colorConfig,
              },
            },
            pointer: {
              width: 7,
              length: 80,
              itemStyle: {
                color: 'auto',
              },
            },
            axisTick: {
              distance: -30,
              length: 0,
              lineStyle: {
                color: '#fff',
                width: 0,
              },
            },
            splitLine: {
              distance: -35,
              length: 35,
              lineStyle: {
                color: '#fff',
                width: 4,
              },
            },
            axisLabel: {
              color: 'black',
              distance: 44,
              fontSize: autoScaleAxisLabelFont,
            },
            detail: {
              valueAnimation: true,
              formatter: `{value} ${unit}`,
              color: 'inherit',
              fontSize: 24,
            },
            data: [
              {
                value: value,
              },
            ],
          },
        ],
      };

      myChartRef.current.setOption(option);
    }
  }, [
    minValue,
    maxValue,
    staticValues,
    staticValuesColors,
    unit,
    value,
    autoScaleAxisLabelFont,
  ]);

  return <div className="w-full h-full" id="chartRef" ref={chartRef} />;
}
