import { useEffect, useState } from 'react'
import { Box, Button, Checkbox, FormControlLabel, FormGroup, IconButton, Stack, Typography } from '@mui/material'
import { DashboardIcon } from 'components/architectureConfig/dashboard-icons'
import { BackButton } from 'components/elements/buttons'
import colors from 'theme/colors'
import { InterestingPlace } from 'models/data-types'
import { EMPTY_POI } from 'constants/dummy-data'

type ListViewFilterProps = {
  listData: InterestingPlace[]
  setFilteredData: (data: InterestingPlace[]) => void
  handleFilterClick: () => void
}

export function ListViewFilter(props: ListViewFilterProps) {
  const { listData, setFilteredData, handleFilterClick } = props
  const [filteredInfosCheckbox, setFilteredInfosCheckbox] = useState<string[]>([])
  const [isChecked, setIsChecked] = useState<boolean[]>([])
  const [uniqueInfoTypes, setUniqueInfoTypes] = useState<string[]>([])

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
    // remove duplicates from the info-types
    let uniqueTypes: string[] = []
    if (listData && listData.length > 0 && listData[0]) {
      listData.forEach((info) => {
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
      listData[0] = EMPTY_POI
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // set the infos to be displayed according to the selected filters
    if (filteredInfosCheckbox.length > 0) {
      let filterList = listData.filter((info) => filteredInfosCheckbox.some((type) => info.types.includes(type)))
      //Avoid duplicates
      let uniqueInfos: InterestingPlace[] = []
      for (let info of filterList) {
        if (!uniqueInfos.some((uniqueInfo) => uniqueInfo.name === info.name)) {
          uniqueInfos.push(info)
        }
      }
      setFilteredData(uniqueInfos)
    } else {
      setFilteredData(listData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredInfosCheckbox, listData])

  return (
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
          <Button onClick={handleFilterReset}>Filter Zurücksetzten</Button>
        </Stack>
      </Box>
    </Box>
  )
}
