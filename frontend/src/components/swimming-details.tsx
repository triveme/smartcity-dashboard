import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { SliderComponent } from 'models/chart-types'
import { SwimmingInfo } from 'models/data-types'
import { SliderWithoutKnobs } from './charts/slider/slider'

type ParkingspaceDetailsProps = {
  infos: SwimmingInfo[]
}

export function SwimmingDetails(props: ParkingspaceDetailsProps) {
  const { infos } = props

  return (
    <Box sx={{ overflowY: 'scroll' }} height={'100%'} width='100%' padding={'10px'}>
      <Grid container spacing={5} width='100%'>
        {infos.map((info: SwimmingInfo, index: number) => (
          <Grid key={'SwimmingGrid-' + info.name} item xs={6}>
            <Typography>{info.name}</Typography>
            {info.sensors.map((sensor: SliderComponent, index: number) => (
              <Box
                key={'SwimmingBox-' + info.name + '-' + sensor.name}
                width='100%'
                display={'flex'}
                flexDirection={'row'}
              >
                <SliderWithoutKnobs name={sensor.name} currentValue={sensor.currentlyUsed} unit={'%'} />
              </Box>
            ))}
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
