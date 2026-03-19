'use client';

import { ReactElement, useEffect, useRef } from 'react';
import { echarts, ECHARTS_LOCALE } from '@/utils/echartsClient';
import { ECharts, EChartsOption } from 'echarts';
import { applyUserLocaleToNumber } from '@/utils/mathHelper';
import { PieChartDataItem } from '@/types/dashboardModels';

type PieChartProps = {
  labels: string[];
  data: number[];
  unit: string;
  fontSize: string;
  fontColor: string;
  currentValuesColors: string[];
  allowImageDownload?: boolean;
  pieChartRadius?: number;
  playAnimation?: boolean;
  highlightedIndex?: number;
  highlightedColor?: string;
  unhighlightedColor?: string;
  menuHoverColor: string;
};

export default function PieChart(props: PieChartProps): ReactElement {
  const {
    labels,
    data,
    fontSize,
    fontColor,
    unit,
    currentValuesColors,
    allowImageDownload,
    pieChartRadius,
    playAnimation = true,
    highlightedColor,
    unhighlightedColor,
    menuHoverColor,
  } = props;

  const chartRef = useRef<HTMLDivElement>(null);
  const highlightedIndex = useRef<number>(-1);
  let myChart: ECharts | null = null;

  const dataToDisplay: PieChartDataItem[] = data.map((value, index) => ({
    value,
    name: labels[index] || `Sensor ${index + 1}`,
    unit: unit,
    itemStyle: {
      color:
        props.highlightedIndex != undefined && props.highlightedIndex >= 0
          ? index == props.highlightedIndex
            ? highlightedColor!
            : unhighlightedColor!
          : currentValuesColors[index % currentValuesColors.length],
    },
  }));

  const initializeChart = (): void => {
    if (chartRef.current) {
      myChart = echarts.init(chartRef.current, undefined, {
        locale: ECHARTS_LOCALE,
      });

      if (props.highlightedIndex != undefined) {
        highlightedIndex.current = props.highlightedIndex;
      }

      const option: EChartsOption = {
        animation: playAnimation,
        tooltip: {
          trigger: 'item',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: (params: any): string => {
            const value = applyUserLocaleToNumber(
              params.value,
              navigator.language || 'de-DE',
            );
            const percentValue = applyUserLocaleToNumber(
              params.percent,
              navigator.language || 'de-DE',
            );
            return `${params.name}: ${value}${unit} (${percentValue}%)`;
          },
        },
        series: [
          {
            type: 'pie',
            radius: pieChartRadius ? `${pieChartRadius}%` : '70%',
            data: dataToDisplay.length ? dataToDisplay : [],
            label: {
              show: true,
              position: 'outside',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter: (params: any): string => {
                const value = applyUserLocaleToNumber(
                  params.value,
                  navigator.language || 'de-DE',
                );
                const percentValue = applyUserLocaleToNumber(
                  params.percent,
                  navigator.language || 'de-DE',
                );
                return `${params.name}: ${value}${unit} (${percentValue}%)`;
              },
              color: fontColor || '#E95051',
              fontSize: fontSize || 14,
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        ],

        toolbox: {
          show: allowImageDownload,
          feature: {
            saveAsImage: {
              title: 'Als Bild herunterladen...    ',
              icon: 'path://M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z',
              iconStyle: {
                color: fontColor,
                borderColor: 'transparent',
                borderWidth: 0,
              },
              emphasis: {
                iconStyle: {
                  color: menuHoverColor,
                  borderColor: 'transparent',
                  borderWidth: 0,
                },
              },
            },
          },
        },
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
  }, [labels, data, fontColor, fontSize, currentValuesColors]);

  return <div className="w-full h-full" ref={chartRef} />;
}
