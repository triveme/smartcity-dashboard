import { useEffect, useState } from 'react'
import { Box, Typography, useMediaQuery } from '@mui/material'
import { IntervalButton } from './elements/buttons'
import { InfoDisplayComponent } from './elements/info-display'
import colors from 'theme/colors'
import { SingleColumnChart } from './charts/column'
import { AlarmLineChart } from './charts/line'
import { calculateAverage, calculateDeviationPercentage, roundDecimalPlaces } from 'utils/math-helper'
import theme from 'theme/theme'

type UtilizationProps = {
  dataValues: number[]
  timeValues: string[]
  valueWarning: number
  valueAlarm: number
  valueMax: number
  unit: string
}

export function MeasurementComponent(props: UtilizationProps) {
  const { dataValues, timeValues, valueWarning, valueAlarm, valueMax, unit } = props

  const [dayActive, setDayActive] = useState(true)
  const [weekActive, setWeekActive] = useState(false)
  const [monthActive, setMonthActive] = useState(false)
  const [currentValue, setCurrentValue] = useState<number>(0)
  const [averageValue, setAverageValue] = useState<number>(0)
  const [deviationValue, setDeviationValue] = useState<number>(0)
  const [dataWeekValues, setDataWeekValues] = useState<number[]>([])
  const [dataWeekDates, setDataWeekDates] = useState<string[]>([])
  const [dataMonthValues, setDataMonthValues] = useState<number[]>(dataValues)
  const [dataMonthDates, setDataMonthDates] = useState<string[]>(timeValues)
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  const handleIntervalClick = (interval: string) => {
    switch (interval) {
      case 'day':
        setDayActive(true)
        setWeekActive(false)
        setMonthActive(false)
        break
      case 'week':
        setDayActive(false)
        setWeekActive(true)
        setMonthActive(false)
        break
      case 'month':
        setDayActive(false)
        setWeekActive(false)
        setMonthActive(true)
        break
      default:
        break
    }
  }

  useEffect(() => {
    if (dataValues && dataValues.length > 0) {
      //Set current value
      setCurrentValue(roundDecimalPlaces(dataValues[dataValues.length - 1], 2))

      //Set values for last week
      if (dataValues.length < 7) {
        setDataWeekValues([...dataValues])
        setDataWeekDates([...timeValues])
      } else {
        setDataWeekValues(dataValues.slice(-7))
        setDataWeekDates(timeValues.slice(-7))
      }

      //Set values for last month
      setDataMonthValues(dataValues)
      setDataMonthDates(timeValues)

      //Set average value
      setAverageValue(calculateAverage(dataValues))

      if (averageValue !== 0) {
        setDeviationValue(calculateDeviationPercentage(currentValue, averageValue))
      }
    }
  }, [averageValue, currentValue, dataValues, timeValues])

  return (
    <Box display='flex' flexDirection='column' height='100%' width='100%'>
      {/* Filter-Box */}
      <Box
        display={'flex'}
        flexDirection={'row'}
        alignItems={'flex-start'}
        gap={'10px'}
        flexBasis='15%'
        height='100%'
        width='100%'
      >
        <IntervalButton text='HEUTE' active={dayActive} onClick={() => handleIntervalClick('day')}></IntervalButton>
        <IntervalButton text='WOCHE' active={weekActive} onClick={() => handleIntervalClick('week')}></IntervalButton>
        <IntervalButton text='MONAT' active={monthActive} onClick={() => handleIntervalClick('month')}></IntervalButton>
      </Box>
      {/* Handler-Box */}
      <Box display='flex' flexDirection='row' flexBasis={matchesDesktop ? '85%' : '100%'} height='100%' width='100%'>
        {/* Chart-Holder-Box */}
        <Box display='flex' flexDirection='column' flexBasis={matchesDesktop ? '80%' : '100%'}>
          {/* Chart */}
          <Box flexBasis={dayActive ? '90%' : '100%'} height='100%' width='100%'>
            {dayActive ? (
              <Box height='100%' display='flex' flexDirection='row' justifyContent='center' alignItems='center'>
                <Typography
                  variant='h1'
                  color={colors.iconColor}
                  sx={matchesDesktop ? { fontSize: '7.5rem' } : { fontSize: '4.5rem' }}
                >
                  {currentValue}
                </Typography>
                <Typography
                  variant='h1'
                  color={colors.text}
                  sx={matchesDesktop ? { fontSize: '2.5rem' } : { fontSize: '2.0rem' }}
                >
                  {unit}
                </Typography>
              </Box>
            ) : null}
            {weekActive ? (
              <AlarmLineChart
                data={dataWeekValues}
                timeValue={dataWeekDates}
                warningValue={valueWarning}
                alarmValue={valueAlarm}
                maxValue={valueMax}
              />
            ) : null}
            {monthActive ? (
              <AlarmLineChart
                data={dataMonthValues}
                timeValue={dataMonthDates}
                warningValue={valueWarning}
                alarmValue={valueAlarm}
                maxValue={valueMax}
              />
            ) : null}
          </Box>
          {/* Infobox */}
          {dayActive ? (
            <Box
              flexBasis={'10%'}
              display='flex'
              flexDirection='row'
              height='100%'
              justifyContent='space-evenly'
              alignItems='flex-end'
            >
              <InfoDisplayComponent
                headline={'Mittelwert'}
                icon={''}
                iconColor={''}
                value={averageValue.toFixed(2) + ' ' + unit}
              />
              <InfoDisplayComponent
                headline={'Abweichung'}
                icon={'IconArrowWaveRightDown'}
                iconColor={colors.iconColor}
                value={deviationValue.toFixed(2) + '%'}
              />
              <InfoDisplayComponent
                headline={'Warnung'}
                icon={'IconPoint'}
                iconColor={colors.orange}
                value={valueWarning.toString() + ' ' + unit}
              />
              <InfoDisplayComponent
                headline={'Alarm'}
                icon={'IconPoint'}
                iconColor={colors.pink}
                value={valueAlarm.toString() + ' ' + unit}
              />
            </Box>
          ) : null}
        </Box>
        {/* Single-Column-Box */}
        {matchesDesktop ? (
          <Box
            key={'single-column-box'}
            display='flex'
            flexDirection='column'
            flexBasis='15%'
            height='100%'
            width='100%'
            alignItems='center'
            justifyContent='center'
          >
            {/* Column Chart */}
            <Box
              flexBasis={'85%'}
              display='flex'
              flexDirection='column'
              justifyContent='space-evenly'
              alignItems='flex-end'
              height='100%'
              width='100%'
            >
              <SingleColumnChart
                data={currentValue ? [currentValue] : []}
                timeValue={timeValues && timeValues.length > 0 ? [timeValues[timeValues.length - 1]] : []}
                warningValue={valueWarning}
                alarmValue={valueAlarm}
                maxValue={valueMax}
              />
            </Box>
            {/* Description Box */}
            <Box flexBasis={'10%'}>
              <Typography color={colors.white}>Pegelstand aktuell</Typography>
            </Box>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
