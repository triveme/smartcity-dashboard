import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import { PanelComponent } from 'components/panel'
import { DataConfigurator } from 'components/architectureConfig/data-configurator'

import colors from 'theme/colors'
import { SmallField } from 'components/elements/text-fields'

type ComponentConfiguratorProps = {
  currentTabIndex: number
  tempPanel: PanelComponent
  setNewTabValue: (newTabValue: Array<{ key: string; tabValue: any }>) => void
}

export function ComponentConfigurator(props: ComponentConfiguratorProps) {
  const { currentTabIndex, tempPanel, setNewTabValue } = props

  return (
    <Box width='inherit' height='inherit' key='box-component-configurator'>
      <Select
        size='small'
        autoWidth
        margin='dense'
        label='Komponententyp'
        labelId='componenttype-component-select-filled-label'
        id='componenttype-select-filled'
        value={tempPanel.tabs[currentTabIndex].componentType}
        onChange={(e) => setNewTabValue([{ key: 'componentType', tabValue: e.target.value }])}
        style={{ backgroundColor: colors.backgroundColor }}
      >
        <MenuItem value='map'>Karte</MenuItem>
        {/* <MenuItem value='measurement'>Messung</MenuItem> */}
        <MenuItem value='pois'>Liste mit Karte</MenuItem>
        <MenuItem value='parking'>Auslastung Parkplätze</MenuItem>
        {/* <MenuItem value='swimming'>Auslastung Schwimmbad</MenuItem> */}
        {/* <MenuItem value='utilization'>Auslastung Zoo</MenuItem> */}
      </Select>
      {/* Map and List with Map */}
      {tempPanel.tabs[currentTabIndex].componentType === 'pois' ||
      tempPanel.tabs[currentTabIndex].componentType === 'map' ? (
        <Select
          size='small'
          autoWidth
          margin='dense'
          label='Komponenten Datentyp'
          labelId='datatype-component-select-filled-label'
          id='datatype-select-filled'
          value={tempPanel.tabs[currentTabIndex].componentDataType}
          onChange={(e) => setNewTabValue([{ key: 'componentDataType', tabValue: e.target.value }])}
          style={{ backgroundColor: colors.backgroundColor }}
        >
          <MenuItem value='cars'>E-Auto-Ladestationen</MenuItem>
          <MenuItem value='bikes'>E-Bike-Ladestationen</MenuItem>
          <MenuItem value='parking'>Parkplätze</MenuItem>
          <MenuItem value='pois'>POIs</MenuItem>
        </Select>
      ) : null}
      {/* Measurement charts */}
      {tempPanel.tabs[currentTabIndex].componentType === 'measurement' ? (
        <Box display='flex' flexDirection='row' gap='5px'>
          <SmallField
            key={'measurement-warning-text-field'}
            label='Warnungslimit'
            type='number'
            value={tempPanel.tabs[currentTabIndex].componentWarning}
            onChange={(e) => setNewTabValue([{ key: 'componentWarning', tabValue: e.target.value }])}
          />
          <SmallField
            key={'measurement-alarm-text-field'}
            label='Alarmlimit'
            type='number'
            value={tempPanel.tabs[currentTabIndex].componentAlarm}
            onChange={(e) => setNewTabValue([{ key: 'componentAlarm', tabValue: e.target.value }])}
          />
          <SmallField
            key={'measurement-maximum-text-field'}
            label='Maximaler Wert'
            type='text'
            value={tempPanel.tabs[currentTabIndex].componentMaximum}
            onChange={(e) => setNewTabValue([{ key: 'componentMaximum', tabValue: e.target.value }])}
          />
        </Box>
      ) : null}
      <DataConfigurator currentTabIndex={currentTabIndex} tempPanel={tempPanel} setNewTabValue={setNewTabValue} />
    </Box>
  )
}
