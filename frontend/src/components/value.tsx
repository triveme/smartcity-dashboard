import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'

import type { TabComponent } from 'components/tab'

import { roundDecimalPlaces } from 'utils/decimal-helper'
import { HeadlineYellow } from './elements/font-types'
// import { IconButton } from "@mui/material";
// import { DashboardIcon } from "./architectureConfig/dashboard-icons";
import colors from 'theme/colors'

type TabProps = {
  tab: TabComponent
}

export function Value(props: TabProps) {
  const { tab } = props

  const renderValues = () => {
    if (tab.values && tab.attribute) {
      let valueArray = []
      for (let i = 0; i < tab.values.length; i++) {
        valueArray.push(
          <Box key={'value-box-' + i} width='50%' padding={1}>
            <Typography fontWeight='bold' fontSize='small' key={'value-typo-title-' + i}>
              {tab.attribute.aliases[i]}
            </Typography>
            <Typography
              fontWeight='bold'
              fontSize={52}
              color={tab.apexOptions!.colors![0]}
              key={'value-typo-value-' + i}
            >
              {roundDecimalPlaces(tab.values[i], tab.decimals)}
            </Typography>
          </Box>,
        )
      }
      return valueArray
    }
  }

  return (
    <>
      <Box display='flex' justifyContent='flex-start' alignItems='center' height='inherit' padding={1}>
        {renderValues()}
      </Box>
      <Box id='valueBottomSpacer' />
    </>
  )
}

export function SingleValue(props: TabProps) {
  const { tab } = props

  return (
    <>
      <Box display='flex' flexDirection='column' justifyContent='flex-start' alignItems='center' height='inherit'>
        <HeadlineYellow text={tab.componentName}></HeadlineYellow>
        <Box display={'flex'} flexDirection={'row'} justifyContent='flex-start'>
          <Typography fontSize={'42px'} color={colors.text}>
            {tab.componentValue}
          </Typography>
          <Typography fontSize={'32px'} color={colors.grey}>
            {tab.componentUnit}
          </Typography>
        </Box>
        {/* <Box
          display="flex"
          flexDirection="column"
          justifyContent="flex-start"
          alignItems="flex-end"
          width="40%"
        >
          <IconButton
            sx={{
              top: "-30px"
            }}
            onClick={() => handleSingleValueClickOpen()}
          >
            <DashboardIcon
              icon='IconArrowNarrowRight'
              color={colors.grey}
            />
          </IconButton>
        </Box> */}
      </Box>
    </>
  )
}
