'use client';

import { ReactElement, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ECharts, EChartsOption } from 'echarts';

type StageableChartProps = {
  unit: string;
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
  const { minValue, maxValue, unit, staticValues, staticValuesColors, value } =
    props;
  const chartRef = useRef<HTMLDivElement>(null);
  const myChartRef = useRef<ECharts | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && chartRef.current) {
      myChartRef.current = echarts.init(chartRef.current);

      const resizeChart = (): void => {
        if (myChartRef.current) {
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
    // convert static values to decimals based on min and max value
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
  colorConfig.push([1, staticValuesColors[staticValuesColors.length - 1]]); // make the last item to be 1

  useEffect(() => {
    if (myChartRef.current) {
      const option: EChartsOption = {
        series: [
          {
            type: 'gauge',
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
                width: 7,
              },
            },
            axisLabel: {
              color: 'black',
              distance: 44,
              fontSize: 20,
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
  }, [minValue, maxValue, staticValues, staticValuesColors, unit, value]);

  return <div className="w-full h-full" ref={chartRef} />;
}
