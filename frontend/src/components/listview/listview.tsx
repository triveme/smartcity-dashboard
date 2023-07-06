import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'

import theme from 'theme/theme'
import colors from 'theme/colors'
import { MapComponent } from '../map/map'
import { InterestingPlace, MapData } from 'models/data-types'
import { BackButton } from '../elements/buttons'
import { DashboardIcon } from '../architectureConfig/dashboard-icons'
import { EMPTY_POI } from 'constants/dummy-data'
import { ListViewDetails } from 'components/listview/listview-details'
import { ListViewImage } from './listview-image'
import { ListViewInfo } from './listview-info'
import { ListViewMapArrow } from './listview-map-arrow'

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
  const [filteredInfos, setFilteredInfos] = useState<InterestingPlace[]>([])
  const [uniqueInfoTypes, setUniqueInfoTypes] = useState<string[]>([])
  const [pointOfInterestFilterOpen, setPointOfInterestFilterOpen] = useState(false)
  const [filteredInfosCheckbox, setFilteredInfosCheckbox] = useState<string[]>([])
  const [isChecked, setIsChecked] = useState<boolean[]>([])
  const [isListVisible, setListVisibility] = useState(true)

  useEffect(() => {
    // remove duplicates from the info-types
    let uniqueTypes: string[] = []
    if (poiData && poiData.length > 0 && poiData[0]) {
      poiData.forEach((info) => {
        if (info.types && info.types.length > 0) {
          info.types.forEach((type) => {
            if (uniqueTypes.indexOf(type) === -1 && type !== '') uniqueTypes.push(type)
          })
        }
      })
      setUniqueInfoTypes(uniqueTypes)
      // set all checkboxes to unchecked
      setIsChecked(new Array(uniqueTypes.length).fill(false))
      //Set Schwebebahn Haltestelle to default selection
      for (let i = 0; i < uniqueTypes.length; i++) {
        if (uniqueTypes[i] === 'Schwebebahn-Haltestellen') {
          handleFilterCheckboxClick(i, true, uniqueTypes[i])
        }
      }
    } else {
      poiData[0] = EMPTY_POI
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterClick = () => {
    setPointOfInterestFilterOpen(() => !pointOfInterestFilterOpen)
  }
  const handleFilterReset = () => {
    setIsChecked(new Array(uniqueInfoTypes.length).fill(false))
    setFilteredInfosCheckbox([])
  }

  const handleFilterCheckboxClick = (index: number, checked: boolean, type: string) => {
    let typesToFilter: string[] = [...filteredInfosCheckbox]

    setIsChecked((isChecked) => isChecked.map((item, i) => (i === index ? !item : item)))

    if (checked) {
      typesToFilter = [...filteredInfosCheckbox, type]
    } else {
      typesToFilter.splice(filteredInfosCheckbox.indexOf(type), 1)
    }
    setFilteredInfosCheckbox(typesToFilter)
  }

  useEffect(() => {
    // set the infos to be displayed according to the selected filters
    if (filteredInfosCheckbox.length > 0) {
      let filterList = poiData.filter((info) => filteredInfosCheckbox.some((type) => info.types.includes(type)))
      //Avoid duplicates
      let uniqueInfos: InterestingPlace[] = []
      for (let info of filterList) {
        if (!uniqueInfos.some((uniqueInfo) => uniqueInfo.name === info.name)) {
          uniqueInfos.push(info)
        }
      }
      setFilteredInfos(uniqueInfos)
    } else {
      setFilteredInfos(infos)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredInfosCheckbox])

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

  const poiList = useMemo(() => {
    return (
      <Box display={'flex'} flexDirection={'column'} gap={'5px'} padding='5px' paddingTop={0}>
        {filteredInfos.map((info, index) => {
          return (
            // POI-Box
            <Box
              height='125px'
              key={'Interesting-POI-Box-' + info.name}
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
          // Filter Menue
          <Box height='100%' width='100%' flexBasis='33%' display='flex' flexDirection='column' padding='5px'>
            <Typography
              sx={{
                py: 2,
                background: colors.poiBackground,
              }}
              display='flex'
              alignContent='space-between'
            >
              <Box component='span' sx={{ flex: 1 }}>
                Filter
              </Box>
              <IconButton
                onClick={handleFilterClick}
                sx={{
                  mr: 1,
                  border: `2px solid ${colors.grey}`,
                  height: 28,
                  width: 28,
                  '&:hover': {
                    borderColor: colors.iconColor,
                  },
                  '& svg': {
                    margin: '-3px',
                  },
                  '& svg:hover': {
                    color: `${colors.iconColor} !important`,
                  },
                }}
              >
                <DashboardIcon icon='IconClose' color={colors.grey} />
              </IconButton>
            </Typography>
            <Box
              sx={{
                overflowY: 'auto',
                backgroundColor: colors.poiBackground,
              }}
            >
              <FormGroup>
                {uniqueInfoTypes.map((type, index) => (
                  <FormControlLabel
                    key={type}
                    label={<Typography variant='body2'>{type}</Typography>}
                    control={
                      <Checkbox
                        sx={{ color: colors.grey }}
                        size='small'
                        value={type}
                        checked={isChecked[index]}
                        name={type}
                        onChange={(e) => handleFilterCheckboxClick(index, e.target.checked, e.target.value)}
                      />
                    }
                  />
                ))}
              </FormGroup>
            </Box>
            <Box
              sx={{
                py: 2,
                pr: 1,
                background: colors.poiBackground,
              }}
            >
              <Stack direction={{ md: 'column', lg: 'row' }} spacing={2}>
                <BackButton onClick={handleFilterClick} text={'Filter anwenden'}></BackButton>
                <Button onClick={handleFilterReset}>Filter Zurücksetzten</Button>
              </Stack>
            </Box>
          </Box>
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
              {uniqueInfoTypes.length > 0 && (
                <Button size='small' onClick={handleFilterClick} variant='outlined' startIcon={<FilterListIcon />}>
                  Filter
                </Button>
              )}
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
