import { useEffect, useState } from 'react'
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
  const [absoluteValue, setAbsoluteValue] = useState(0)
  const [percentValue, setPercentValue] = useState(0)
  const [radialOption, setRadialOption] = useState<ApexOptions>(GetRadial180ApexOptions(0, 0, 0, 0))

  const getPercentValue = () => {
    let range = maxValue - minValue

    if (range !== 0) {
      let calc = ((absoluteValue - minValue) / range) * 100
      return calc
    }
    return 0
  }

  useEffect(() => {
    if (currentValue !== undefined && currentValue !== null) {
      setAbsoluteValue(currentValue)
      setPercentValue(getPercentValue())
      setRadialOption(GetRadial180ApexOptions(absoluteValue, percentValue, minValue, maxValue))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [absoluteValue, currentValue, maxValue, minValue, percentValue])

  return (
    <Box height='60%' display='flex' flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <Box
        display='flex'
        flexDirection={'row'}
        justifyContent={'space-between'}
        flexGrow={0}
        // flexBasis='25%'
        minHeight={'43px'}
      >
        <DashboardIcon icon={icon} color={colors.iconColor}></DashboardIcon>
        <Typography style={{ color: colors.white }}>{chartName}</Typography>
      </Box>
      <Box width='100%' height='80px' minHeight={'80px'}>
        <ApexChart series={radialOption.series} options={radialOption} type='radialBar' height='200px' />
      </Box>
      <Box
        display='flex'
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
        width='190px'
        // flexBasis='25%'
        paddingLeft={'5px'}
        minHeight={'55px'}
      >
        <Typography flexBasis={'15%'}>{minValue}</Typography>
        <Typography color={colors.iconColor} variant='h2'>
          {unit}
        </Typography>
        <Typography flexBasis={'15%'} paddingLeft={'13px'}>
          {maxValue}
        </Typography>
      </Box>
    </Box>
  )
}
