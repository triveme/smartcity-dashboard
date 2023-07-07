import { useState } from 'react'
import { Box, IconButton } from '@mui/material'

import { DashboardIcon } from 'components/architectureConfig/dashboard-icons'
import { ParkingSpot } from 'models/data-types'
import { SliderWithKnobs } from './slider'
import { SliderHeader } from './slider-header'
import { ParkingspaceDetails } from 'components/parkingspace-details'
import { EMPTY_PARKING_SPOT } from 'constants/dummy-data'
import colors from 'theme/colors'

type ParkingComponentProps = {
  sliders: ParkingSpot[]
  showOnMap: (index: number, lat: number, lng: number) => void
}
export function ParkingComponent(props: ParkingComponentProps) {
  const { sliders, showOnMap } = props
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const [selectedParkingspace, setSelectedParkingspace] = useState<ParkingSpot>(EMPTY_PARKING_SPOT)

  const handleParkingspaceClickOpen = (parkingspace: ParkingSpot, index: number) => {
    setSelectedParkingspace(parkingspace)
    setDetailsOpen(true)
    setSelectedIndex(index)
  }

  const handleParkingspaceClickClose = () => {
    setDetailsOpen(false)
    setSelectedParkingspace(EMPTY_PARKING_SPOT)
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
                <Box key={'SliderWrapper-Box-' + index + obj?.name} display={'flex'} flexDirection={'row'}>
                  <SliderWithKnobs
                    name={obj?.name ? obj?.name : 'Parkplatz'}
                    occupiedSpots={obj?.occupiedSpotNumber !== undefined ? obj?.occupiedSpotNumber : 0}
                    availableSpots={obj?.availableSpotNumber !== undefined ? obj?.availableSpotNumber : 0}
                    totalSpots={obj?.totalSpotNumber !== undefined ? obj?.totalSpotNumber : 1}
                  />
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
