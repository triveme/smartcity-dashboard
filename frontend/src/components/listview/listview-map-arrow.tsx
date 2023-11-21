import { Box, IconButton } from '@mui/material'

import { DashboardIcon } from 'components/architectureConfig/dashboard-icons'
import colors from 'theme/colors'

type ListViewMapArrowProps = {
  index: number
  handlePoiClick: (index: number) => void
}

export function ListViewMapArrow(props: ListViewMapArrowProps) {
  const { index, handlePoiClick } = props

  return (
    <Box marginLeft='auto' marginTop='auto' marginBottom='auto'>
      <IconButton onClick={() => handlePoiClick(index)}>
        <DashboardIcon icon='ArrowNarrowRight' color={colors.iconColor} />
      </IconButton>
    </Box>
  )
}
