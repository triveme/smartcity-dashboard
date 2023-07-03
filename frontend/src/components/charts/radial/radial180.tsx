import { useState } from 'react'
import { Box } from '@mui/material'
import { default as ApexChart } from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import Typography from '@mui/material/Typography'

import { DashboardIcon } from 'components/architectureConfig/dashboard-icons'
import colors from 'theme/colors'

type RadialChartProps = {
  chartName: string
  minValue: number
  maxValue: number
  currentValue: number | undefined
  unit: string
  icon: string
}

export function RadialChart180(props: RadialChartProps) {
  const { chartName, minValue, maxValue, currentValue, unit, icon } = props

  const getRandomValueBetweenMinAndMax = () => {
    if (!isNaN(maxValue) && !isNaN(minValue)) {
      return Math.random() * (maxValue - minValue) + minValue
    }
    return 0
  }

  const [seriesData] = useState(
    currentValue ? (currentValue * 100) / maxValue : (getRandomValueBetweenMinAndMax() * 100) / maxValue,
  )

  let radialOption: ApexOptions = {
    chart: {
      height: 150,
      type: 'radialBar',
      offsetY: -20,
      sparkline: {
        enabled: true,
      },
    },
    series: [seriesData],
    colors: [colors.chartBar],
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: '80%',
        },
        track: {
          background: colors.chartGrid,
          startAngle: -90,
          endAngle: 90,
          strokeWidth: '50%',
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: '30px',
            color: colors.white,
            show: true,
            offsetY: -3,
            formatter: function (val) {
              try {
                return ((val * maxValue) / 100).toFixed(0) + ' '
              } catch (error) {
                console.warn('PROBLEM: Processing value: ' + val)
                return val + ''
              }
            },
          },
        },
      },
    },
    stroke: {
      lineCap: 'round',
    },
  }

  return (
    <Box height='100%' display='flex' flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <Box display='flex' flexDirection={'row'} justifyContent='center' flexGrow={0} flexBasis='15%'>
        <DashboardIcon icon={icon} color={colors.iconColor}></DashboardIcon>
        <Typography style={{ color: colors.white }}>{chartName}</Typography>
      </Box>
      <Box width='100%' height='80px'>
        <ApexChart series={radialOption.series} options={radialOption} type='radialBar' height='200px' />
      </Box>
      <Box
        display='flex'
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'stretch'}
        width='190px'
        // height="100%"
        flexBasis='15%'
      >
        <Typography>{minValue}</Typography>
        <Typography color={colors.iconColor} variant='h2'>
          {unit}
        </Typography>
        <Typography>{maxValue}</Typography>
      </Box>
    </Box>
  )
}
