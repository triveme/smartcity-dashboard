import { useMemo, useState, useEffect } from 'react'
import { Box, Button, Typography, useMediaQuery } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'

import theme from 'theme/theme'
import colors from 'theme/colors'
import { MapComponent } from '../map/map'
import { InterestingPlace, MapComponentOptions, MapData } from 'models/data-types'
import { EMPTY_POI } from 'constants/dummy-data'
import { ListViewDetails } from 'components/listview/listview-details'
import { ListViewInfo } from './listview-info'
import { ListViewMapArrow } from './listview-map-arrow'
import { ListViewFilter } from './listview-filter'
import { getPois } from 'clients/poi-data-client'

type ListViewProps = {
  mapOptions: MapComponentOptions
  queryDataId: string | undefined
}

export function ListView(props: ListViewProps) {
  const { mapOptions, queryDataId } = props
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('sm'))
  const [mapKey, setMapKey] = useState(Math.random())
  const [poiData, setPoiData] = useState<InterestingPlace[]>([])
  const [pointOfInterestDetailsOpen, setPointOfInterestDetailsOpen] = useState(false)
  const [selectedPointOfInterest, setSelectedPointOfInterest] = useState<InterestingPlace>(EMPTY_POI)
  const [selectedPointOfInterestIndex, setSelectedPointOfInterestIndex] = useState(-1)
  const [filteredInfos, setFilteredInfos] = useState<InterestingPlace[]>(poiData)
  const [pointOfInterestFilterOpen, setPointOfInterestFilterOpen] = useState(false)
  const [isListVisible, setListVisibility] = useState(true)
  const [selectedZoomLocation, setSelectedZoomLocation] = useState<number[]>([])

  useEffect(() => {
    async function fetchData() {
      if (queryDataId !== undefined) {
        const pois = await getPois(queryDataId)
        setPoiData(pois)
        // initialize filteredInfos with all POIs
        setFilteredInfos(pois)
      } else {
        console.error('Error queryData._id is undefined')
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePoiClick = (index: number) => {
    setPointOfInterestDetailsOpen(true)
    setListVisibility(false)
    setSelectedPointOfInterest(poiData[index])
    setSelectedPointOfInterestIndex(index)
    // handleResize()
  }

  const handlePoiClose = () => {
    setPointOfInterestDetailsOpen(false)
    setListVisibility(true)
    setSelectedPointOfInterest(EMPTY_POI)
    setSelectedPointOfInterestIndex(-1)
    // handleResize()
    setSelectedZoomLocation([])
  }

  const handleDisplayOnMapClick = (markerId: string, lat: number, lng: number) => {
    setListVisibility(false)
    if (!matchesDesktop) {
      handleResize()
    }
    handleTargetZoomClick([lat, lng])
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
    setPointOfInterestFilterOpen(!pointOfInterestFilterOpen)
  }

  const handleTargetZoomClick = (location: number[]) => {
    setSelectedZoomLocation(location)
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
              <ListViewInfo key={'Listview-Info-Box-' + index} info={info} />
              <ListViewMapArrow key={'Listview-Map-Arrow-' + index} index={index} handlePoiClick={handlePoiClick} />
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
      ) : (
        <Box height='100%' width='100%' flexBasis={matchesDesktop ? '33%' : '5%'} display='flex' flexDirection='column'>
          {pointOfInterestFilterOpen === true ? (
            <ListViewFilter
              listData={poiData}
              setFilteredData={setFilteredInfos}
              handleFilterClick={handleFilterClick}
              queryDataId={queryDataId}
            />
          ) : (
            // POI List
            <Box height='100%' width='100%' flexBasis='33%' display='flex' flexDirection='column' padding='5px'>
              <Box display='flex' flexDirection='row' width='100%' justifyContent={'space-between'}>
                <Typography>
                  {filteredInfos.length !== poiData.length ? filteredInfos.length + ' / ' : null} {poiData.length} Orte
                  sortiert nach Beliebtheit
                </Typography>
                {!matchesDesktop ? (
                  <Button size='small' onClick={handleListToggleClick} variant='outlined'>
                    {isListVisible ? 'Karte' : 'Liste'}
                  </Button>
                ) : null}
                <Button
                  size='small'
                  onClick={handleFilterClick}
                  variant='outlined'
                  sx={{ borderRadius: '20px' }}
                  startIcon={<FilterListIcon />}
                >
                  Filter
                </Button>
              </Box>
              {isListVisible ? <Box sx={{ overflowY: 'scroll', mt: 1 }}>{poiList}</Box> : null}
            </Box>
          )}
        </Box>
      )}
      {/* Map Display */}
      {(!isListVisible && !pointOfInterestDetailsOpen) || matchesDesktop ? (
        <Box height='100%' width='100%' flexBasis={matchesDesktop ? '85%' : '95%'} padding='5px'>
          <div
            style={{
              height: '100%',
              width: '100%',
            }}
            onResize={handleResize}
          >
            <MapComponent
              key={'map-' + mapKey}
              iconType={'pois'}
              mapData={filteredInfos as MapData[]}
              mapOptions={mapOptions}
              zoomLocation={selectedZoomLocation ? selectedZoomLocation : []}
              handlePoiClick={handlePoiClick}
            />
          </div>
        </Box>
      ) : null}
    </Box>
  )
}
