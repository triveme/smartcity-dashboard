'use client';

import { ReactElement, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { ECharts, EChartsOption } from 'echarts';

type PieChartDataItem = {
  value: number;
  name: string;
};

const dummyData: PieChartDataItem[] = [
  {
    value: 5,
    name: 'Bsp. 1',
  },
  {
    value: 10,
    name: 'Bsp. 2',
  },
  {
    value: 20,
    name: 'Bsp. 3',
  },
];

type PieChartProps = {
  labels: string[];
  data: number[];
};

export default function PieChart(props: PieChartProps): ReactElement {
  const { labels, data } = props;
  const chartRef = useRef<HTMLDivElement>(null);
  let myChart: ECharts | null = null;
  const dataToDisplay: PieChartDataItem[] = [];
  for (let i = 0; i < data.length; i++) {
    const item: PieChartDataItem = { value: data[i], name: '' };
    if (labels.length > i) {
      item.name = labels[i];
    } else {
      item.name = `Bsp. ${i + 1}`;
    }
    dataToDisplay.push(item);
  }

  const initializeChart = (): void => {
    if (chartRef.current) {
      myChart = echarts.init(chartRef.current);

      const option: EChartsOption = {
        series: [
          {
            type: 'pie',
            radius: '70%',
            data: dataToDisplay.length ? dataToDisplay : dummyData,
            label: {
              show: true,
              position: 'outside',
              formatter: '{b}: {c}',
              color: '#E95051',
              fontSize: 14,
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
  }, [labels, data]);

  return <div className="w-full h-full" ref={chartRef} />;
}
