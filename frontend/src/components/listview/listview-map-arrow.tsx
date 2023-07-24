import { Box, IconButton } from '@mui/material'

import { DashboardIcon } from 'components/architectureConfig/dashboard-icons'
import { InterestingPlace } from 'models/data-types'
import colors from 'theme/colors'

type ListViewMapArrowProps = {
  info: InterestingPlace
  index: number
  handlePoiClick: (info: InterestingPlace, index: number) => void
}

export function ListViewMapArrow(props: ListViewMapArrowProps) {
  const { info, index, handlePoiClick } = props

  return (
    <Box paddingLeft={'2px'} paddingBottom={'6px'} margin='auto' flexBasis={'5%'}>
      <IconButton onClick={() => handlePoiClick(info, index)}>
        <DashboardIcon icon='IconArrowNarrowRight' color={colors.grey} />
      </IconButton>
    </Box>
  )
}
