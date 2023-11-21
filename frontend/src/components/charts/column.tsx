import Box from '@mui/material/Box'

import { default as ApexChart } from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import colors from 'theme/colors'

type ColumnChartProps = {
  data: number[]
  timeValue: string[]
}

export type WarningChartProps = {
  data: number[]
  timeValue: string[]
  warningValue: number
  alarmValue: number
  maxValue: number
}

export function ColumnChart(props: ColumnChartProps) {
  const { data, timeValue } = props

  let lineOptions: ApexOptions = {
    series: [
      {
        data: data,
      },
    ],
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        borderRadiusApplication: 'end',
        columnWidth: '10%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
    },
    xaxis: {
      categories: timeValue,
      tickAmount: 6,
      axisTicks: {
        show: false,
        color: colors.chartGrid,
      },
      labels: {
        style: {
          colors: colors.chartFont,
        },
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      axisTicks: {
        color: colors.chartGrid,
      },
      labels: {
        formatter: (value) => {
          return value + '%'
        },
        style: {
          colors: colors.chartFont,
        },
      },
    },
    grid: {
      borderColor: colors.chartGrid,
    },
    colors: [colors.chartBar],
  }

  return (
    <Box height='100%' width='100%'>
      <ApexChart series={lineOptions.series} options={lineOptions} type='bar' width={'100%'} height={'80%'} />
    </Box>
  )
}

export function SingleColumnChart(props: WarningChartProps) {
  const { data, timeValue, warningValue, alarmValue, maxValue } = props

  let dataSeries: ApexAxisChartSeries = [
    {
      data: data,
      name: 'Pegelstand',
    },
  ]
  let lineOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        borderRadiusApplication: 'end',
        columnWidth: '60%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
    },
    xaxis: {
      categories: timeValue,
      // tickAmount: 6,
      axisTicks: {
        show: false,
        color: colors.chartGrid,
      },
      labels: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      max: maxValue,
      tickAmount: 5,
      axisTicks: {
        color: colors.chartGrid,
      },
      labels: {
        formatter: (value) => {
          return value + ''
        },
        style: {
          colors: colors.chartFont,
        },
      },
    },
    annotations: {
      yaxis: [
        {
          y: alarmValue,
          strokeDashArray: 0,
          borderColor: colors.pink,
          fillColor: 'white',
          label: {
            borderColor: colors.pink,
            style: {
              color: 'white',
              background: colors.pink,
            },
            text: 'Alarm',
          },
        },
        {
          y: warningValue,
          strokeDashArray: 0,
          borderColor: colors.orange,
          fillColor: 'white',
          label: {
            borderColor: colors.orange,
            style: {
              color: 'white',
              background: colors.orange,
            },
            text: 'Warnung',
          },
        },
      ],
    },
    grid: {
      borderColor: colors.chartGrid,
    },
    colors: [colors.chartBar],
  }

  return (
    <Box height='100%' width='100%'>
      <ApexChart series={dataSeries} options={lineOptions} type='bar' width={'100%'} height={'100%'} />
    </Box>
  )
}
