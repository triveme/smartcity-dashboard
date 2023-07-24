import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { SwimmingUtilizationModel, SwimmingZone } from 'models/data-types'
import { SliderWithoutKnobs } from './charts/slider/slider'

type SwimmingDetailsProps = {
  infos: SwimmingUtilizationModel[]
}

export function SwimmingDetails(props: SwimmingDetailsProps) {
  const { infos } = props

  return (
    <Box sx={{ overflowY: 'scroll' }} height={'100%'} width='100%' padding={'10px'}>
      <Grid container spacing={5} width='100%'>
        {infos.map((info: SwimmingUtilizationModel, index: number) => (
          <Grid key={'SwimmingGrid-' + info.name} item xs={6}>
            <Typography>{info.name}</Typography>
            {info.zones.map((zone: SwimmingZone, index: number) => (
              <Box
                key={'SwimmingBox-' + info.name + '-' + zone.name + '-' + index}
                width='100%'
                display={'flex'}
                flexDirection={'row'}
              >
                <SliderWithoutKnobs name={zone.name} currentValue={zone.occupancyRate * 100} unit={'%'} />
              </Box>
            ))}
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
