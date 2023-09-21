import { useState } from 'react'
import { Box, IconButton } from '@mui/material'

import { DashboardIcon } from 'components/architectureConfig/dashboard-icons'
import { ParkingInfo } from 'models/data-types'
import { SliderWithKnobs } from './slider'
import { SliderHeader } from './slider-header'
import { ParkingspaceDetails } from 'components/parkingspace-details'
import colors from 'theme/colors'

type ParkingComponentProps = {
  sliders: ParkingInfo[]
  showOnMap: (index: number, lat: number, lng: number) => void
}
export function ParkingComponent(props: ParkingComponentProps) {
  const { sliders, showOnMap } = props
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const emptyParkingInfo: ParkingInfo = {
    name: '',
    maxHeight: 0,
    location: {
      type: 'point',
      coordinates: [7.200007788461502, 51.272065568215524],
    },
    capacity: [],
    currentlyUsed: 0,
    maxValue: 42,
    type: 'Tiefgarage',
  }
  const [selectedParkingspace, setSelectedParkingspace] = useState<ParkingInfo>(emptyParkingInfo)

  const handleParkingspaceClickOpen = (parkingspace: ParkingInfo, index: number) => {
    setSelectedParkingspace(parkingspace)
    setDetailsOpen(true)
    setSelectedIndex(index)
  }

  const handleParkingspaceClickClose = () => {
    setDetailsOpen(false)
    setSelectedParkingspace(emptyParkingInfo)
    setSelectedIndex(-1)
  }

  const handleShowOnMapClick = () => {
    if (selectedIndex >= 0 && sliders[selectedIndex].location) {
      showOnMap(
        selectedIndex,
        sliders[selectedIndex].location.coordinates[0],
        sliders[selectedIndex].location.coordinates[1],
      )
    }
  }

  return (
    <Box sx={{ overflowY: 'scroll' }} height={'100%'} padding={'10px'}>
      {detailsOpen ? (
        <ParkingspaceDetails
          info={selectedParkingspace!}
          handleBackClick={handleParkingspaceClickClose}
          handleShowOnMapClick={handleShowOnMapClick}
        />
      ) : (
        <Box width='100%' display={'flex'} flexDirection={'column'} padding={'10px'}>
          <SliderHeader />
          <Box>
            {sliders.map((obj, index) => {
              return (
                <Box key={'SliderWrapper-Box-' + obj.name} display={'flex'} flexDirection={'row'}>
                  <SliderWithKnobs name={obj.name} currentValue={obj.currentlyUsed} maximumValue={obj.maxValue} />
                  <Box paddingLeft={'5px'} paddingBottom={'6px'} margin='auto'>
                    <IconButton onClick={() => handleParkingspaceClickOpen(obj, index)}>
                      <DashboardIcon icon='IconArrowNarrowRight' color={colors.grey} />
                    </IconButton>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      )}
    </Box>
  )
}
