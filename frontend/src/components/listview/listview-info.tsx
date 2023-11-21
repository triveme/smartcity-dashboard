import { Box, Typography, useMediaQuery } from '@mui/material'

import { DashboardIcon } from 'components/architectureConfig/dashboard-icons'
import { HeadlineYellow, HeadlineGray } from 'components/elements/font-types'
import { InterestingPlace } from 'models/data-types'
import colors from 'theme/colors'
import theme from 'theme/theme'

type ListViewInfoProps = {
  info: InterestingPlace
}

export function ListViewInfo(props: ListViewInfoProps) {
  const { info } = props
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  return (
    <Box height='100%' display={'flex'} flexDirection={'column'} flexBasis={'70%'} justifyContent={'space-between'}>
      {/* Textinfo */}
      <Box
        height='100%'
        display={'flex'}
        flexDirection={'column'}
        alignContent={'start'}
        alignItems={'start'}
        justifyContent={'space-around'}
      >
        <Box>
          <HeadlineYellow text={info.name} />
          <Typography variant='body1'>
            {info.types
              ? info.types.map((type) => {
                  return type.toString() + ' '
                })
              : null}
          </Typography>
        </Box>
        {matchesDesktop ? (
          <Box display={'flex'} flexDirection={'row'} alignContent={'center'} alignItems={'center'}>
            <DashboardIcon icon='MapPin' color={colors.iconColor}></DashboardIcon>
            <HeadlineGray text={info.address}></HeadlineGray>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
