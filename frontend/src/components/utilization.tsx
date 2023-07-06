import { useState } from 'react'
import Box from '@mui/material/Box'

import { UtilizationComponent } from 'models/chart-types'
import { ColumnChart } from './charts/column'
import { RadialChart360 } from './charts/radial/radial360/radial360'
import { IntervalButton } from './elements/buttons'

type UtilizationProps = {
  data: UtilizationComponent
  currentValue: number
}

export function Utilization(props: UtilizationProps) {
  const { data, currentValue } = props
  const [dayActive, setDayActive] = useState(true)
  const [weekActive, setWeekActive] = useState(false)
  const [monthActive, setMonthActive] = useState(false)
  const [dataValues, setDataValues] = useState(data.valuesDay)
  const [dataDates, setDataDates] = useState(data.dateDay)

  const handleIntervalClick = (interval: string) => {
    switch (interval) {
      case 'day':
        setDayActive(true)
        setWeekActive(false)
        setMonthActive(false)
        setDataValues(data.valuesDay)
        setDataDates(data.dateDay)
        break
      case 'week':
        setDayActive(false)
        setWeekActive(true)
        setMonthActive(false)
        setDataValues(data.valuesWeek)
        setDataDates(data.dateWeek)
        break
      case 'month':
        setDayActive(false)
        setWeekActive(false)
        setMonthActive(true)
        setDataValues(data.valuesMonth)
        setDataDates(data.dateMonth)
        break
      default:
        break
    }
  }

  return (
    <Box height={'100%'} display={'flex'} flexDirection={'column'} padding={'10px'}>
      {/* Intervalselection */}
      <Box display={'flex'} flexDirection={'row'} alignItems={'flex-start'} gap={'10px'}>
        <IntervalButton text='HEUTE' active={dayActive} onClick={() => handleIntervalClick('day')}></IntervalButton>
        <IntervalButton text='WOCHE' active={weekActive} onClick={() => handleIntervalClick('week')}></IntervalButton>
        <IntervalButton text='MONAT' active={monthActive} onClick={() => handleIntervalClick('month')}></IntervalButton>
      </Box>
      {/* Graphs */}
      <Box display={'flex'} flexDirection={'row'} height={'100%'} alignItems='center' justifyContent='center'>
        {/* Linechart */}
        <Box height={'100%'} flexBasis={'80%'}>
          <ColumnChart data={dataValues} timeValue={dataDates} />
        </Box>
        {/* Radialchart */}
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} flexBasis={'20%'}>
          <RadialChart360 description={'Aktuelle Auslastung'} currentValue={currentValue}></RadialChart360>
        </Box>
      </Box>
    </Box>
  )
}
