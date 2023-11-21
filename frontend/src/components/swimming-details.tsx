import { Typography, useMediaQuery } from '@mui/material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { SwimmingUtilizationModel, SwimmingZone } from 'models/data-types'
import { SliderWithoutKnobs } from './charts/slider/slider'
import { roundDecimalPlaces } from 'utils/math-helper'
import theme from 'theme/theme'
import colors from 'theme/colors'

type SwimmingDetailsProps = {
  infos: SwimmingUtilizationModel[]
}

export function SwimmingDetails(props: SwimmingDetailsProps) {
  const { infos } = props
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  return (
    <Box sx={{ overflowY: 'scroll' }} height={'100%'} width='100%' padding={'10px'}>
      <Grid container spacing={5} width='100%'>
        {infos.map((info: SwimmingUtilizationModel, index: number) => (
          <Grid key={'SwimmingGrid-' + info.name} item xs={matchesDesktop ? 6 : 12}>
            <Typography color={colors.white}>{info.name}</Typography>
            {info.zones.map((zone: SwimmingZone, index: number) => (
              <Box
                key={'SwimmingBox-' + info.name + '-' + zone.name + '-' + index}
                width='100%'
                display={'flex'}
                flexDirection={'row'}
              >
                <SliderWithoutKnobs
                  name={zone.name}
                  currentValue={roundDecimalPlaces(zone.occupancyRate * 100, 1)}
                  unit={'%'}
                />
              </Box>
            ))}
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
