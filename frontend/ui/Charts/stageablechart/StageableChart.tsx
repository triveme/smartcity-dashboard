'use client';

import { ReactElement, useEffect, useRef, useState } from 'react';
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
  staticValuesTexts: string[];
  value: number;
  fontColor?: string;
  fontSize?: string;
  ticksFontColor?: string;
  ticksFontSize?: string;
  showAxisLabels?: boolean;
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
    staticValuesTexts,
    value,
    fontColor,
    fontSize,
    ticksFontColor,
    ticksFontSize,
    showAxisLabels,
  } = props;

  const [label, setLabel] = useState<string>('');

  const chartRef = useRef<HTMLDivElement>(null);
  const myChartRef = useRef<ECharts | null>(null);

  const parsedTicksFontSize = parseFloat(ticksFontSize || '16px');
  const calculatedMinSize = parsedTicksFontSize * 0.595;
  const autoScaleAxisLabelFont = useAutoScaleFont({
    minSize: calculatedMinSize,
    maxSize: isNaN(parsedTicksFontSize) ? 20 : parsedTicksFontSize,
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

  // Function to get the corresponding label based on the value
  function getLabelForValue(value: number): string {
    for (let i = 0; i < staticValues.length; i++) {
      if (value <= staticValues[i]) {
        return staticValuesTexts[i];
      }
    }
    return staticValuesTexts[staticValuesTexts.length - 1];
  }

  // Set the label whenever the value or staticValues change
  useEffect(() => {
    setLabel(getLabelForValue(value));
  }, [value, staticValues]);

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
            startAngle: 210,
            endAngle: -30,
            radius: '65%',
            axisLine: {
              lineStyle: {
                width: 15,
                color: colorConfig,
              },
            },
            pointer: {
              width: 5,
              length: '70%',
              itemStyle: {
                color: 'auto',
              },
            },
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              show: showAxisLabels !== false,
              color: ticksFontColor,
              distance: -50,
              fontSize: autoScaleAxisLabelFont,
            },
            detail: {
              offsetCenter: [0, '70%'],
              valueAnimation: true,
              formatter: `{value} ${unit}`,
              color: fontColor,
              fontSize: fontSize,
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
    tiles,
    minValue,
    maxValue,
    unit,
    staticValues,
    staticValuesColors,
    staticValuesTexts,
    value,
    fontColor,
    fontSize,
    ticksFontColor,
    showAxisLabels,
    autoScaleAxisLabelFont,
  ]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div
        ref={chartRef}
        className="w-full pt-2"
        style={{ height: !label || label === '' ? '100%' : '75%' }}
      />
      {label && label !== '' && (
        <div className="text-center text-lg">{label}</div>
      )}
    </div>
  );
}
