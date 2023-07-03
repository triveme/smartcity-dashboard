import Box from '@mui/material/Box'

import { default as ApexChart } from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { cloneDeep } from 'lodash'

import type { TabComponent } from 'components/tab'

import { roundDecimalPlaces } from 'utils/decimal-helper'
import colors from 'theme/colors'

type DonutChartProps = {
  tab: TabComponent
  height: number
}

export function DonutChart(props: DonutChartProps) {
  const { tab, height } = props

  function setApexOptionsLegendTop() {
    if (tab.apexOptions && !tab.apexOptions.legend) {
      tab.apexOptions = {
        ...tab.apexOptions,
        legend: {
          position: 'top',
          markers: {
            radius: 5,
          },
        },
      }
    }
  }

  function getDonutApexOptionsWithMax() {
    const twoValuesInSeries = tab.apexSeries && tab.apexSeries.length === 2
    let totalLabel = 'Gesamt'
    if (twoValuesInSeries && tab.attribute) {
      if (tab.apexMaxAlias && tab.apexMaxAlias !== '') {
        totalLabel = tab.apexMaxAlias
      } else if (tab.attribute.aliases && tab.attribute.aliases.length > 0) {
        totalLabel = tab.attribute.aliases[0]
      }
    }
    let newApexOptions: ApexOptions = tab.apexOptions ? cloneDeep(tab.apexOptions) : {}
    if (tab.apexMaxValue) {
      newApexOptions = {
        ...newApexOptions,
        stroke: {
          show: true,
          colors: [colors.panelBackground],
        },
        plotOptions: {
          pie: {
            customScale: 1,
            expandOnClick: true,
            donut: {
              labels: {
                show: true,
                total: {
                  show: true,
                  label: totalLabel,
                  color: colors.white,
                  formatter: twoValuesInSeries
                    ? function (w: any) {
                        const sum = w.globals.seriesTotals.reduce((a: number, b: number) => {
                          return a + b
                        }, 0)
                        return `${w.globals.seriesTotals[0]}/${sum}`
                      }
                    : function (w: any) {
                        return w.globals.seriesTotals.reduce((a: any, b: any) => {
                          return a + b
                        }, 0)
                      },
                },
              },
            },
          },
        },
      }
    }
    return newApexOptions
  }

  if (
    tab.apexMaxColor &&
    tab.apexSeries &&
    tab.apexOptions &&
    tab.apexOptions.colors &&
    tab.apexMaxAlias &&
    tab.apexMaxAlias !== ''
  ) {
    if (tab.apexSeries.length > tab.apexOptions.colors.length) {
      tab.apexOptions.colors.unshift(tab.apexMaxColor)
    } else {
      tab.apexOptions.colors[0] = tab.apexMaxColor
    }
  }
  setApexOptionsLegendTop()

  if (tab.apexSeries) {
    tab.apexSeries = tab.apexSeries.map((val) => {
      return roundDecimalPlaces(val, tab.decimals)
    })
  }

  return (
    <Box className='background-box' height='100%' display='flex' alignItems='center' justifyContent='center'>
      <Box key={'box-' + (tab._id !== '' ? tab._id : tab.uid)} style={{ padding: 5, marginBottom: -15, width: '100%' }}>
        <ApexChart
          key={'apexchart-' + (tab._id !== '' ? tab._id : tab.uid)}
          height={height}
          series={tab.apexSeries}
          options={tab.apexOptions ? getDonutApexOptionsWithMax() : {}}
          type='donut'
        />
      </Box>
    </Box>
  )
}
