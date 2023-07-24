import { useMemo, useState } from 'react'
import { Box, Button, Typography, useMediaQuery } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'

import theme from 'theme/theme'
import colors from 'theme/colors'
import { MapComponent } from '../map/map'
import { InterestingPlace, MapData } from 'models/data-types'
import { EMPTY_POI } from 'constants/dummy-data'
import { ListViewDetails } from 'components/listview/listview-details'
import { ListViewImage } from './listview-image'
import { ListViewInfo } from './listview-info'
import { ListViewMapArrow } from './listview-map-arrow'
import { ListViewFilter } from './listview-filter'

type ListViewProps = {
  infos: InterestingPlace[]
}

export function ListView(props: ListViewProps) {
  const { infos } = props
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('sm'))
  const [mapKey, setMapKey] = useState(Math.random())
  const [poiData] = useState(infos && infos.length > 0 ? infos : [EMPTY_POI])
  const [pointOfInterestDetailsOpen, setPointOfInterestDetailsOpen] = useState(false)
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<InterestingPlace>(EMPTY_POI)
  const [selectedPointOfInterestIndex, setSelectedPointOfInterestIndex] = useState(-1)
  const [filteredInfos, setFilteredInfos] = useState<InterestingPlace[]>(infos)
  const [pointOfInterestFilterOpen, setPointOfInterestFilterOpen] = useState(false)
  const [isListVisible, setListVisibility] = useState(true)

  const handlePoiClick = (pointOfInterest: InterestingPlace, index: number) => {
    setPointOfInterestDetailsOpen(true)
    setSelectedPointOfInterest(pointOfInterest)
    setSelectedPointOfInterestIndex(index)
    handleResize()
  }

  const handlePoiClose = () => {
    setPointOfInterestDetailsOpen(false)
    setListVisibility(true)
    setSelectedPointOfInterest(EMPTY_POI)
    setSelectedPointOfInterestIndex(-1)
    handleResize()
  }

  const handleDisplayOnMapClick = (markerId: string, lat: number, lng: number) => {
    setListVisibility(false)
    if (!matchesDesktop) {
      handleResize()
    }
  }

  /**
   * On mobile view a button is visible to trigger between map and list view
   * On each change a map re-render needs to happen
   */
  const handleListToggleClick = () => {
    setListVisibility(!isListVisible)
    handleResize()
  }

  /**
   * The POI Map needs to rerender to account for height/width changes
   * To achieve this, the key is changed to force a re-render
   */
  const handleResize = () => {
    setMapKey(Math.random())
  }

  const handleFilterClick = () => {
    setPointOfInterestFilterOpen(() => !pointOfInterestFilterOpen)
  }

  const poiList = useMemo(() => {
    return (
      <Box display={'flex'} flexDirection={'column'} gap={'5px'} padding='5px' paddingTop={0}>
        {filteredInfos.map((info, index) => {
          return (
            // POI-Box
            <Box
              height='125px'
              key={'Interesting-POI-Box-' + index + info.name}
              display={'flex'}
              flexDirection={'row'}
              sx={{
                backgroundColor: colors.poiBackground,
              }}
              padding='10px'
            >
              <ListViewImage key={'Poi-Image-Box-' + index} info={info} />
              <ListViewInfo key={'Listview-Info-Box-' + index} info={info} />
              <ListViewMapArrow
                key={'Listview-Map-Arrow-' + index}
                index={index}
                info={info}
                handlePoiClick={handlePoiClick}
              />
            </Box>
          )
        })}
      </Box>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredInfos])

  return (
    <Box
      width='100%'
      height='100%'
      display='flex'
      flexDirection={matchesDesktop ? 'row' : 'column'}
      paddingBottom='8px'
    >
      <Box height='100%' width='100%' flexBasis={matchesDesktop ? '33%' : '5%'} display='flex' flexDirection='column'>
        {pointOfInterestDetailsOpen ? (
          // POI details
          <Box height='100%' width='100%' flexBasis='33%' display='flex' flexDirection='column' padding='5px'>
            <ListViewDetails
              info={selectedPointOfInterest!}
              handleBackClick={handlePoiClose}
              handleDisplayOnMapClick={handleDisplayOnMapClick}
              index={selectedPointOfInterestIndex}
            />
          </Box>
        ) : pointOfInterestFilterOpen ? (
          <ListViewFilter listData={infos} setFilteredData={setFilteredInfos} handleFilterClick={handleFilterClick} />
        ) : (
          // POI List
          <Box height='100%' width='100%' flexBasis='33%' display='flex' flexDirection='column' padding='5px'>
            <Box display='flex' flexDirection='row' width='100%' justifyContent={'space-between'}>
              <Typography>
                {filteredInfos.length !== infos.length ? filteredInfos.length + ' / ' : null} {poiData.length} Orte
                sortiert nach Beliebtheit
              </Typography>
              {!matchesDesktop ? (
                <Button size='small' onClick={handleListToggleClick} variant='outlined'>
                  {isListVisible ? 'Karte' : 'Liste'}
                </Button>
              ) : null}
              <Button size='small' onClick={handleFilterClick} variant='outlined' startIcon={<FilterListIcon />}>
                Filter
              </Button>
            </Box>
            {isListVisible && <Box sx={{ overflowY: 'scroll', mt: 1 }}>{poiList}</Box>}
          </Box>
        )}
      </Box>
      {/* Map Display */}
      <Box height='100%' width='100%' flexBasis={matchesDesktop ? '66%' : '95%'} padding='5px'>
        <div
          style={{
            height: '100%',
            width: '100%',
          }}
          onResize={handleResize}
        >
          <MapComponent key={'map-' + mapKey} iconType={'pois'} mapData={filteredInfos as MapData[]} />
        </div>
      </Box>
    </Box>
  )
}
