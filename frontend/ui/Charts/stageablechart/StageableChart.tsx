'use client';

import { ReactElement, useEffect, useRef, useState } from 'react';
import { echarts, ECHARTS_LOCALE } from '@/utils/Charts/echartsClient';
import { ECharts, EChartsOption } from 'echarts';
import useAutoScaleFont from '@/app/custom-hooks/useAutoScaleFont';
import { useSearchParams } from 'next/navigation';
import { roundToDecimal } from '@/utils/mathHelper';
import {
  getAxisLabelRich,
  getAxisLabelStyleName,
  getStageLabel,
} from '@/utils/stageableChartHelper';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabData?: any;
  decimalPlaces?: number;
  usesQueryParameter?: boolean;
  useDashboardFontColor?: boolean;
  usePreviousStageColorOnBoundary?: boolean;
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
    fontColor,
    fontSize,
    ticksFontColor,
    ticksFontSize,
    showAxisLabels,
    tabData,
    decimalPlaces,
    usesQueryParameter = false,
    useDashboardFontColor = false,
    usePreviousStageColorOnBoundary = false,
  } = props;
  let { value } = props;

  const searchParams = useSearchParams();
  const entityId = usesQueryParameter ? searchParams.get('entityId') : null;

  if (entityId && tabData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findValue = (tabData.chartData as any[]).find(
      (x) => x.id === entityId,
    );
    if (findValue && findValue.values && findValue.values.length > 0) {
      value = findValue.values[0];
    }
  }

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
      myChartRef.current = echarts.init(chartRef.current, undefined, {
        locale: ECHARTS_LOCALE,
      });

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

  useEffect(() => {
    setLabel(getStageLabel(value, staticValuesTexts, staticValues));
  }, [value, staticValues, staticValuesTexts]);

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

  function getAxisLabelPrecision(): number {
    if (!tiles || maxValue === minValue) {
      return decimalPlaces ?? 0;
    }

    const step = (maxValue - minValue) / tiles;

    if (Number.isInteger(step)) {
      return 0;
    }

    if (decimalPlaces !== undefined) {
      return decimalPlaces;
    }

    return 1;
  }

  function formatAxisLabel(rawValue: number): string {
    const roundedValue = roundToDecimal(rawValue, getAxisLabelPrecision());
    return `${roundedValue}`;
  }

  const axisLabelRich = getAxisLabelRich(
    staticValuesColors,
    ticksFontColor,
    autoScaleAxisLabelFont,
  );

  function formatAxisLabelWithStageColor(rawValue: number): string {
    const formattedValue = formatAxisLabel(rawValue);

    if (!usePreviousStageColorOnBoundary) {
      return formattedValue;
    }

    const styleName = getAxisLabelStyleName(
      rawValue,
      staticValues,
      axisLabelRich,
    );

    return `{${styleName}|${formattedValue}}`;
  }

  useEffect(() => {
    if (myChartRef.current) {
      const option: EChartsOption = {
        series: [
          {
            type: 'gauge',
            splitNumber: tiles,
            min: minValue,
            max: maxValue,
            color: fontColor,
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
              color: usePreviousStageColorOnBoundary
                ? undefined
                : useDashboardFontColor
                  ? ticksFontColor
                  : undefined,
              distance: -50,
              fontSize: autoScaleAxisLabelFont,
              formatter: (rawValue: number) =>
                formatAxisLabelWithStageColor(rawValue),
              rich: usePreviousStageColorOnBoundary ? axisLabelRich : undefined,
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
                value: roundToDecimal(value, decimalPlaces),
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
    decimalPlaces,
    usePreviousStageColorOnBoundary,
    axisLabelRich,
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
