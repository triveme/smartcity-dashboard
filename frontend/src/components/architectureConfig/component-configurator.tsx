import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import { PanelComponent } from 'components/panel'
import { DataConfigurator } from 'components/architectureConfig/data-configurator'

import colors from 'theme/colors'
import { SmallField } from 'components/elements/text-fields'
import { FormControlLabel, FormGroup, Switch } from '@mui/material'

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
        <MenuItem value='pois'>Liste mit Karte</MenuItem>
        <MenuItem value='parking'>Auslastung Parkplätze</MenuItem>
        <MenuItem value='swimming'>Auslastung Schwimmbad</MenuItem>
        {/* <MenuItem value='utilization'>Auslastung Zoo</MenuItem> */}
      </Select>
      {/* Map and List with Map */}
      {tempPanel.tabs[currentTabIndex].componentType === 'pois' ||
      tempPanel.tabs[currentTabIndex].componentType === 'map' ? (
        <Box>
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
            <MenuItem value='pois'>Pin</MenuItem>
          </Select>
          <Box display={'flex'} flexDirection={'row'}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    value={
                      tempPanel.tabs[currentTabIndex].componentOptions
                        ? tempPanel.tabs[currentTabIndex].componentOptions.allowPopups
                        : false
                    }
                    checked={
                      tempPanel.tabs[currentTabIndex].componentOptions
                        ? tempPanel.tabs[currentTabIndex].componentOptions.allowPopups
                        : false
                    }
                    onChange={(e) => setNewTabValue([{ key: 'allowPopup', tabValue: e.target.checked }])}
                  />
                }
                label='Popups anzeigen'
              />
              <FormControlLabel
                control={
                  <Switch
                    value={
                      tempPanel.tabs[currentTabIndex].componentOptions
                        ? tempPanel.tabs[currentTabIndex].componentOptions.allowScroll
                        : false
                    }
                    checked={
                      tempPanel.tabs[currentTabIndex].componentOptions
                        ? tempPanel.tabs[currentTabIndex].componentOptions.allowScroll
                        : false
                    }
                    onChange={(e) => setNewTabValue([{ key: 'allowScroll', tabValue: e.target.checked }])}
                  />
                }
                label='Scrollen erlauben'
              />
              <FormControlLabel
                control={
                  <Switch
                    value={
                      tempPanel.tabs[currentTabIndex].componentOptions
                        ? tempPanel.tabs[currentTabIndex].componentOptions.allowZoom
                        : false
                    }
                    checked={
                      tempPanel.tabs[currentTabIndex].componentOptions
                        ? tempPanel.tabs[currentTabIndex].componentOptions.allowZoom
                        : false
                    }
                    onChange={(e) => setNewTabValue([{ key: 'allowZoom', tabValue: e.target.checked }])}
                  />
                }
                label='Zoom erlauben'
              />
              {tempPanel.tabs[currentTabIndex].componentDataType === 'parking' && (
                <FormControlLabel
                  control={
                    <Switch
                      value={
                        tempPanel.tabs[currentTabIndex].componentOptions
                          ? tempPanel.tabs[currentTabIndex].componentOptions.occupancyRotate
                          : false
                      }
                      checked={
                        tempPanel.tabs[currentTabIndex].componentOptions
                          ? tempPanel.tabs[currentTabIndex].componentOptions.occupancyRotate
                          : false
                      }
                      onChange={(e) => setNewTabValue([{ key: 'occupancyRotate', tabValue: e.target.checked }])}
                    />
                  }
                  label='Zone drehen'
                />
              )}
            </FormGroup>
            <Box flexBasis={'40%'}>
              <SmallField
                key={'mapOptions-zoom-min'}
                label='Minimaler Zoom'
                type='number'
                value={
                  tempPanel.tabs[currentTabIndex].componentOptions
                    ? tempPanel.tabs[currentTabIndex].componentOptions.minZoom
                    : 10
                }
                onChange={(e) => setNewTabValue([{ key: 'mapMinZoom', tabValue: e.target.value }])}
              />
              <SmallField
                key={'mapOptions-zoom-max'}
                label='Maximaler Zoom'
                type='number'
                value={
                  tempPanel.tabs[currentTabIndex].componentOptions
                    ? tempPanel.tabs[currentTabIndex].componentOptions.maxZoom
                    : 20
                }
                onChange={(e) => setNewTabValue([{ key: 'mapMaxZoom', tabValue: e.target.value }])}
              />
              <SmallField
                key={'mapOptions-zoom-current'}
                label='Standardzoom'
                type='number'
                value={
                  tempPanel.tabs[currentTabIndex].componentOptions
                    ? tempPanel.tabs[currentTabIndex].componentOptions.zoom
                    : 20
                }
                onChange={(e) => setNewTabValue([{ key: 'mapCurZoom', tabValue: e.target.value }])}
              />
            </Box>
          </Box>
        </Box>
      ) : null}
      <DataConfigurator currentTabIndex={currentTabIndex} tempPanel={tempPanel} setNewTabValue={setNewTabValue} />
    </Box>
  )
}
