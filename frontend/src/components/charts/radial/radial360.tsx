import { Box, Typography } from '@mui/material'
import { default as ApexChart } from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'

import colors from 'theme/colors'

type RadialChartProps = {
  description: string
  currentValue: number
}

export function RadialChart360(props: RadialChartProps) {
  const { description, currentValue } = props

  let radialOption: ApexOptions = {
    chart: {
      type: 'radialBar',
      sparkline: {
        enabled: true,
      },
    },
    series: [currentValue],
    colors: [colors.chartBar],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: '40px',
            color: colors.white,
            show: true,
            offsetY: 13,
            formatter: function (val) {
              return val + '%'
            },
          },
        },
        hollow: {
          size: '70%',
        },
        track: {
          background: colors.chartGrid,
          strokeWidth: '25%',
        },
      },
    },
    stroke: {
      lineCap: 'round',
      width: 2,
    },
  }

  return (
    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
      <ApexChart series={radialOption.series} options={radialOption} type='radialBar' height={'80%'} width={'100%'} />
      <Typography>{description}</Typography>
    </Box>
  )
}
