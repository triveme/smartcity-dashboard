import { useEffect, useState } from 'react'
import { Box, Button, Checkbox, FormControlLabel, FormGroup, IconButton, Stack, Typography } from '@mui/material'
import { DashboardIcon } from 'components/architectureConfig/dashboard-icons'
import { BackButton } from 'components/elements/buttons'
import colors from 'theme/colors'
import { InterestingPlace } from 'models/data-types'
import { getAllHauptthemaValues, getFilteredPois } from 'clients/poi-data-client'

type ListViewFilterProps = {
  listData: InterestingPlace[]
  setFilteredData: (data: InterestingPlace[]) => void
  handleFilterClick: () => void
  queryDataId: string | undefined
}

export function ListViewFilter(props: ListViewFilterProps) {
  const { listData, setFilteredData, handleFilterClick, queryDataId } = props
  const [filteredInfosCheckbox, setFilteredInfosCheckbox] = useState<string[]>([])
  const [isChecked, setIsChecked] = useState<boolean[]>([])
  const [uniqueInfoTypes, setUniqueInfoTypes] = useState<string[]>([])

  const handleFilterReset = () => {
    setIsChecked(new Array(uniqueInfoTypes.length).fill(false))
    setFilteredInfosCheckbox([])
    handleFilterClick()
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
    // Define an asynchronous function to fetch uniqueTypes
    const fetchUniqueTypes = async () => {
      try {
        if (queryDataId !== undefined) {
          const uniqueTypes = await getAllHauptthemaValues(queryDataId)

          setUniqueInfoTypes(uniqueTypes)
          setIsChecked(new Array(uniqueTypes.length).fill(false))
        } else {
          console.error('Error queryData._id is undefined')
        }
      } catch (error) {
        console.error('Error fetching uniqueTypes:', error)
      }
    }

    fetchUniqueTypes() // Call the asynchronous function

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // set the infos to be displayed according to the selected filters
    if (filteredInfosCheckbox.length > 0) {
      if (queryDataId !== undefined) {
        getFilteredPois(queryDataId, filteredInfosCheckbox) // Pass the selected filters as an array
          .then((filteredData) => {
            setFilteredData(filteredData)
          })
          .catch((error) => {
            console.error('Error fetching filtered data:', error)
          })
      } else {
        console.error('Error queryData._id is undefined')
      }
    } else {
      setFilteredData(listData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredInfosCheckbox, listData, queryDataId])

  return (
    <Box
      height='100%'
      width='100%'
      flexBasis='33%'
      display='flex'
      flexDirection='column'
      padding='20px'
      borderRadius='20px'
      sx={{
        backgroundColor: colors.poiBackground,
      }}
    >
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
        }}
      >
        {uniqueInfoTypes.length > 0 ? (
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
        ) : (
          <p>Keine Filterkategorie erkannt</p>
        )}
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
          <Button onClick={handleFilterReset} sx={{ borderRadius: '20px' }}>
            Filter Zurücksetzten
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
