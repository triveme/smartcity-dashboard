import { useState } from 'react'
import { Box } from '@mui/material'
import { default as ApexChart } from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import Typography from '@mui/material/Typography'

import { DashboardIcon } from 'components/architectureConfig/dashboard-icons'
import colors from 'theme/colors'
import { GetRadial180ApexOptions } from './radial180ApexOptions'

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

  let radialOption: ApexOptions = GetRadial180ApexOptions(seriesData, maxValue)

  return (
    <Box height='100%' display='flex' flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <Box display='flex' flexDirection={'row'} justifyContent='center' flexGrow={0} flexBasis='20%'>
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
        alignItems={'start'}
        width='190px'
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
