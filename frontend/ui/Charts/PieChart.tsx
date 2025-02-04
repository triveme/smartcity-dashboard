'use client';

import { ReactElement, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ECharts, EChartsOption } from 'echarts';
import { applyUserLocaleToNumber } from '@/utils/mathHelper';

type PieChartDataItem = {
  value: number;
  name: string;
  unit: string;
  itemStyle?: { color: string };
};

const dummyData: PieChartDataItem[] = [
  {
    value: 5,
    name: 'Bsp. 1',
    unit: 'cm',
  },
  {
    value: 10,
    name: 'Bsp. 2',
    unit: 'cm',
  },
  {
    value: 20,
    name: 'Bsp. 3',
    unit: 'cm',
  },
];

type PieChartProps = {
  labels: string[];
  data: number[];
  unit: string;
  fontSize: string;
  fontColor: string;
  currentValuesColors: string[];
};

export default function PieChart(props: PieChartProps): ReactElement {
  const { labels, data, fontSize, fontColor, unit, currentValuesColors } =
    props;
  const chartRef = useRef<HTMLDivElement>(null);
  let myChart: ECharts | null = null;

  const dataToDisplay: PieChartDataItem[] = data.map((value, index) => ({
    value,
    name: labels[index] || `Bsp. ${index + 1}`,
    unit: unit,
    itemStyle: {
      color: currentValuesColors[index % currentValuesColors.length],
    },
  }));

  const initializeChart = (): void => {
    if (chartRef.current) {
      myChart = echarts.init(chartRef.current);

      const option: EChartsOption = {
        tooltip: {
          trigger: 'item',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: (params: any): string => {
            const value = applyUserLocaleToNumber(
              params.value,
              navigator.language || 'de-DE',
            );
            return `${params.name}: ${value} (${params.percent}%)`;
          },
        },
        series: [
          {
            type: 'pie',
            radius: '70%',
            data: dataToDisplay.length ? dataToDisplay : dummyData,
            label: {
              show: true,
              position: 'outside',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter: (params: any): string => {
                const value = applyUserLocaleToNumber(
                  params.value,
                  navigator.language || 'de-DE',
                );
                return `${params.name}: ${value} (${params.percent}%)`;
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
