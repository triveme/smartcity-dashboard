import { Box, Typography } from '@mui/material'
import { default as ApexChart } from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'

import { GetRadial360ApexOptions } from './radial3600ApexOptions'

type RadialChartProps = {
  description: string
  currentValue: number
}

export function RadialChart360(props: RadialChartProps) {
  const { description, currentValue } = props

  let radialOption: ApexOptions = GetRadial360ApexOptions(currentValue)

  return (
    <Box display='flex' flexDirection='column' alignItems='center' justifyContent='center'>
      <ApexChart series={radialOption.series} options={radialOption} type='radialBar' height={'80%'} width={'100%'} />
      <Typography>{description}</Typography>
    </Box>
  )
}
