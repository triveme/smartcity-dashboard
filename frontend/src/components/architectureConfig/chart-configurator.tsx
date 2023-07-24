import { useState } from 'react'

import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'

import cloneDeep from 'lodash/cloneDeep'
import set from 'lodash/set'

import { PanelComponent } from 'components/panel'
import { DataConfigurator } from 'components/architectureConfig/data-configurator'
import { SmallField } from 'components/elements/text-fields'
import { MaxColorDialog } from 'components/architectureConfig/color-dialog'

import colors from 'theme/colors'
import { Dialog, DialogContent, IconButton, DialogActions, Switch, FormControlLabel } from '@mui/material'
import { SaveButton } from 'components/elements/buttons'
import { iconList, DashboardIcon } from './dashboard-icons'
import borderRadius from 'theme/border-radius'

type ChartConfiguratorProps = {
  currentTabIndex: number
  tempPanel: PanelComponent
  setNewTabValue: (newTabValue: Array<{ key: string; tabValue: any }>) => void
}

export function ChartConfigurator(props: ChartConfiguratorProps) {
  const { currentTabIndex, tempPanel, setNewTabValue } = props

  const [iconChooserOpen, setIconChooserOpen] = useState(false)
  const [newComponentIcon, setNewComponentIcon] = useState('')
  const handleIconChooserClickOpen = () => {
    setIconChooserOpen(true)
  }

  const handleIconChooserClose = () => {
    setIconChooserOpen(false)
    setNewTabValue([{ key: 'componentIcon', tabValue: newComponentIcon }])
  }

  // create missing tab properties
  if (!tempPanel.tabs[currentTabIndex].apexOptions) {
    tempPanel.tabs[currentTabIndex].apexOptions = {
      chart: {
        toolbar: {
          show: false,
        },
      },
    }
  }
  if (!tempPanel.tabs[currentTabIndex].apexMaxValue) {
    tempPanel.tabs[currentTabIndex].apexMaxValue = 100
  }
  if (!tempPanel.tabs[currentTabIndex].apexMaxAlias) {
    tempPanel.tabs[currentTabIndex].apexMaxAlias = ''
  }

  const [maxManual, setMaxManual] = useState(tempPanel.tabs[currentTabIndex].apexMaxAlias !== '' ? 'manual' : 'auto')

  const [maxColorPickerOpen, setMaxColorPickerOpen] = useState(false)

  const handleMaxColorPickerClickOpen = () => {
    setMaxColorPickerOpen(true)
  }

  const handleMaxColorPickerClose = () => {
    setMaxColorPickerOpen(false)
  }

  // in case of a donut chart, the max color is saved in the colors array in apexOptions
  // thus when switching away from a manual max color it needs to be removed
  const donutCleanup = () => {
    if (
      tempPanel.tabs[currentTabIndex].apexType &&
      tempPanel.tabs[currentTabIndex].apexType === 'donut' &&
      tempPanel.tabs[currentTabIndex].apexOptions?.colors &&
      tempPanel.tabs[currentTabIndex].apexOptions!.colors!.length > 0
    ) {
      let newOptionsForColors = cloneDeep(tempPanel.tabs[currentTabIndex].apexOptions)

      if (newOptionsForColors!.colors! && newOptionsForColors!.colors!.length > 0) {
        newOptionsForColors!.colors!.shift()
      }
      if (newOptionsForColors!.labels! && newOptionsForColors!.labels!.length > 0) {
        newOptionsForColors!.labels!.shift()
      }
      if (newOptionsForColors!.series! && newOptionsForColors!.series!.length > 0) {
        newOptionsForColors!.series!.shift()
      }
      setNewTabValue([
        { key: 'apexOptions', tabValue: newOptionsForColors },
        { key: 'apexMaxValue', tabValue: 100 },
        { key: 'apexMaxAlias', tabValue: '' },
      ])
    }
  }

  return (
    <>
      <FormControl
        variant='outlined'
        fullWidth
        style={{
          marginTop: 8,
          marginBottom: 4,
          backgroundColor: colors.backgroundColor,
        }}
      >
        <InputLabel id='typ-simple-select-filled-label'>Charttyp</InputLabel>
        <Select
          size='small'
          margin='dense'
          label='Charttyp'
          labelId='charttyp-simple-select-filled-label'
          id='charttyp-simple-select-filled'
          value={
            tempPanel.tabs[currentTabIndex] && tempPanel.tabs[currentTabIndex].type === 'chart'
              ? tempPanel.tabs[currentTabIndex].apexType
              : 'donut'
          }
          onChange={(e) => setNewTabValue([{ key: 'apexType', tabValue: e.target.value }])}
          style={{ backgroundColor: colors.backgroundColor }}
        >
          <MenuItem value='donut'>Donut</MenuItem>
          <MenuItem value='bar'>Säulen</MenuItem>
          <MenuItem value='line'>Linien</MenuItem>
          <MenuItem value='radial180'>Radial 180°</MenuItem>
          <MenuItem value='radial360'>Radial 360°</MenuItem>
          <MenuItem value='slider'>Slider</MenuItem>
          <MenuItem value='sliderKnobs'>Slider mit Label</MenuItem>
        </Select>
        {tempPanel.tabs[currentTabIndex].apexType === 'line' && (
          <FormControlLabel
            control={
              <Switch
                value={tempPanel.tabs[currentTabIndex].apexStepline}
                checked={tempPanel.tabs[currentTabIndex].apexStepline}
                onChange={(e) => setNewTabValue([{ key: 'apexStepline', tabValue: e.target.checked }])}
              />
            }
            label='Stepline'
          />
        )}
      </FormControl>
      {tempPanel.tabs[currentTabIndex] &&
        tempPanel.tabs[currentTabIndex].type === 'chart' &&
        (tempPanel.tabs[currentTabIndex].apexType === 'line' || tempPanel.tabs[currentTabIndex].apexType === 'bar') && (
          <>
            {tempPanel.tabs[currentTabIndex].apexOptions ? (
              <>
                <FormControl variant='outlined' fullWidth style={{ marginTop: 8, marginBottom: 4 }}>
                  <InputLabel id='timeframe-select-filled-label'>Zeitraum</InputLabel>
                  <Select
                    size='small'
                    margin='dense'
                    label='Zeitraum'
                    labelId='timeframe-select-filled-label'
                    id='timeframe-select-filled'
                    value={tempPanel.tabs[currentTabIndex].timeframe ? tempPanel.tabs[currentTabIndex].timeframe : 0}
                    onChange={(e) => setNewTabValue([{ key: 'timeframe', tabValue: e.target.value }])}
                    style={{ backgroundColor: colors.backgroundColor }}
                  >
                    <MenuItem value={0}>Letzte 24h</MenuItem>
                    <MenuItem value={1}>Letzte 7 Tage</MenuItem>
                    <MenuItem value={2}>Letzte 30 Tage</MenuItem>
                  </Select>
                </FormControl>
                <SmallField
                  label='Y-Beschriftung'
                  type='text'
                  value={(tempPanel.tabs[currentTabIndex].apexOptions as any).yaxis?.title?.text || ''}
                  onChange={(e) =>
                    setNewTabValue([
                      {
                        key: 'apexOptions',
                        tabValue: set(
                          cloneDeep(tempPanel.tabs[currentTabIndex].apexOptions!),
                          'yaxis.title.text',
                          e.target.value,
                        ),
                      },
                    ])
                  }
                />
                <SmallField
                  label='X-Beschriftung'
                  type='text'
                  value={
                    tempPanel.tabs[currentTabIndex].apexOptions?.xaxis?.title?.text
                      ? tempPanel.tabs[currentTabIndex].apexOptions?.xaxis?.title?.text
                      : ''
                  }
                  onChange={(e) =>
                    setNewTabValue([
                      {
                        key: 'apexOptions',
                        tabValue: set(
                          cloneDeep(tempPanel.tabs[currentTabIndex].apexOptions!),
                          'xaxis.title.text',
                          e.target.value,
                        ),
                      },
                    ])
                  }
                />
              </>
            ) : null}
          </>
        )}
      {tempPanel.tabs[currentTabIndex] && tempPanel.tabs[currentTabIndex].type === 'chart' ? (
        <>
          {tempPanel.tabs[currentTabIndex].apexType === 'line' ||
          tempPanel.tabs[currentTabIndex].apexType === 'bar' ||
          tempPanel.tabs[currentTabIndex].apexType === 'donut' ? (
            <Box display='flex' alignItems='center'>
              <FormControl
                variant='outlined'
                sx={{ minWidth: 150 }}
                style={{
                  marginBottom: 4,
                  marginTop: 8,
                  marginRight: 6,
                }}
              >
                <InputLabel id='maximum-simple-select-filled-label'>Maximum (Art, Wert)</InputLabel>
                <Select
                  size='small'
                  margin='dense'
                  variant='outlined'
                  label='Maximum (Art, Wert)'
                  labelId='maximum-simple-select-filled-label'
                  id='maximum-simple-select-filled'
                  value={maxManual}
                  onChange={(e) =>
                    e.target.value === 'auto'
                      ? (setNewTabValue([
                          { key: 'apexMaxValue', tabValue: 0 },
                          { key: 'apexMaxAlias', tabValue: '' },
                        ]),
                        donutCleanup(),
                        setMaxManual(e.target.value))
                      : (setNewTabValue([{ key: 'apexMaxAlias', tabValue: 'frei' }]), setMaxManual(e.target.value))
                  }
                  style={{
                    backgroundColor: colors.backgroundColor,
                  }}
                >
                  <MenuItem value='auto'>Automatisch</MenuItem>
                  <MenuItem value='manual'>Manuell</MenuItem>
                </Select>
              </FormControl>
              {maxManual === 'manual' ? (
                <SmallField
                  label=''
                  type='number'
                  value={
                    tempPanel.tabs[currentTabIndex].apexMaxValue ? tempPanel.tabs[currentTabIndex].apexMaxValue : 100
                  }
                  onChange={(e) => setNewTabValue([{ key: 'apexMaxValue', tabValue: e.target.value }])}
                />
              ) : null}
            </Box>
          ) : null}
          {maxManual === 'manual' &&
          (tempPanel.tabs[currentTabIndex].apexType === 'line' ||
            tempPanel.tabs[currentTabIndex].apexType === 'bar' ||
            tempPanel.tabs[currentTabIndex].apexType === 'donut') ? (
            <Box margin={0.5} marginTop={0}>
              <Paper
                key={'manual-max-paper'}
                style={{
                  height: '100%',
                  paddingTop: 2,
                  paddingRight: 2,
                  paddingBottom: 2,
                  paddingLeft: 10,
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: colors.backgroundColor,
                }}
                elevation={0}
              >
                <SmallField
                  key={'manual-max-alias-text-field'}
                  label='Alias für Zahl bis Maximum'
                  type='text'
                  value={
                    tempPanel.tabs[currentTabIndex].apexMaxAlias === ''
                      ? 'frei'
                      : tempPanel.tabs[currentTabIndex].apexMaxAlias
                  }
                  onChange={(e) => setNewTabValue([{ key: 'apexMaxAlias', tabValue: e.target.value }])}
                />
                <Button
                  size='small'
                  key={'manual-max-color-button'}
                  variant='contained'
                  onClick={handleMaxColorPickerClickOpen}
                  style={{
                    marginLeft: 15,
                    marginRight: 10,
                    fontWeight: 'bold',
                    backgroundColor: !tempPanel.tabs[currentTabIndex].apexMaxColor
                      ? colors.primary
                      : tempPanel.tabs[currentTabIndex].apexMaxColor,
                  }}
                >
                  Farbe
                </Button>
                <MaxColorDialog
                  open={maxColorPickerOpen}
                  onClose={handleMaxColorPickerClose}
                  setNewTabValue={setNewTabValue}
                  currentTab={tempPanel.tabs[currentTabIndex]}
                />
              </Paper>
            </Box>
          ) : null}
          {tempPanel.tabs[currentTabIndex].apexType === 'radial180' ? (
            <Box>
              <Box display='flex' flexDirection='row' gap='5px'>
                <SmallField
                  key={'component-name-text-field'}
                  label='Name'
                  type='text'
                  value={tempPanel.tabs[currentTabIndex].componentName}
                  onChange={(e) => setNewTabValue([{ key: 'componentName', tabValue: e.target.value }])}
                />
                <Box display='flex' alignItems='center'>
                  <IconButton onClick={handleIconChooserClickOpen}>
                    <DashboardIcon icon={newComponentIcon} color={colors.iconColor} />
                  </IconButton>
                  <Button onClick={handleIconChooserClickOpen}>Icon ändern</Button>
                </Box>
              </Box>
              <Box display='flex' flexDirection='row' gap='5px'>
                <SmallField
                  key={'radial-minimum-text-field'}
                  label='Minimum'
                  type='number'
                  value={tempPanel.tabs[currentTabIndex].componentMinimum}
                  onChange={(e) => setNewTabValue([{ key: 'componentMinimum', tabValue: e.target.value }])}
                />
                <SmallField
                  key={'radial-maximum-text-field'}
                  label='Maximum'
                  type='number'
                  value={tempPanel.tabs[currentTabIndex].componentMaximum}
                  onChange={(e) => setNewTabValue([{ key: 'componentMaximum', tabValue: e.target.value }])}
                />
                <SmallField
                  key={'radial-unit-text-field'}
                  label='Einheit'
                  type='text'
                  value={tempPanel.tabs[currentTabIndex].componentUnit}
                  onChange={(e) => setNewTabValue([{ key: 'componentUnit', tabValue: e.target.value }])}
                />
              </Box>
              <Dialog
                disableEscapeKeyDown
                open={iconChooserOpen}
                onClose={handleIconChooserClose}
                PaperProps={{
                  style: {
                    borderRadius: borderRadius.componentRadius,
                    backgroundColor: colors.backgroundColor,
                    backgroundImage: 'none',
                  },
                }}
              >
                <DialogContent>
                  <Box component='form' sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    {iconList.map((icon) => (
                      <IconButton key={'box-widgetIcon-' + icon} onClick={() => setNewComponentIcon(icon)}>
                        <DashboardIcon
                          key={'dashboardicon-widgetIcon-' + icon}
                          icon={icon}
                          color={newComponentIcon === icon ? colors.iconColor : colors.white}
                        />
                      </IconButton>
                    ))}
                  </Box>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center' }}>
                  <SaveButton text='Schließen' onClick={handleIconChooserClose} />
                </DialogActions>
              </Dialog>
            </Box>
          ) : null}
          {tempPanel.tabs[currentTabIndex].apexType === 'radial360' ? (
            <Box>
              <SmallField
                key={'component-raial360-description-text-field'}
                label='Beschreibung'
                type='text'
                value={tempPanel.tabs[currentTabIndex].componentDescription}
                onChange={(e) => setNewTabValue([{ key: 'componentDescription', tabValue: e.target.value }])}
              />
            </Box>
          ) : null}
          {tempPanel.tabs[currentTabIndex].apexType === 'slider' ? (
            <Box display='flex' flexDirection='row'>
              <SmallField
                key={'component-raial360-name-text-field'}
                label='Name'
                type='text'
                value={tempPanel.tabs[currentTabIndex].componentName}
                onChange={(e) => setNewTabValue([{ key: 'componentName', tabValue: e.target.value }])}
              />
              <SmallField
                key={'component-unit-text-field'}
                label='Einheit'
                type='text'
                value={tempPanel.tabs[currentTabIndex].componentUnit}
                onChange={(e) => setNewTabValue([{ key: 'componentUnit', tabValue: e.target.value }])}
              />
            </Box>
          ) : null}
          {tempPanel.tabs[currentTabIndex].apexType === 'sliderKnobs' ? (
            <Box display='flex' flexDirection='row'>
              <SmallField
                key={'component-raial360-name-text-field'}
                label='Name'
                type='text'
                value={tempPanel.tabs[currentTabIndex].componentName}
                onChange={(e) => setNewTabValue([{ key: 'componentName', tabValue: e.target.value }])}
              />
              <SmallField
                key={'radial-maximum-text-field'}
                label='Maximum'
                type='number'
                value={tempPanel.tabs[currentTabIndex].componentMaximum}
                onChange={(e) => setNewTabValue([{ key: 'componentMaximum', tabValue: e.target.value }])}
              />
            </Box>
          ) : null}
          <SmallField
            label='Nachkommastellen'
            type='number'
            value={!tempPanel.tabs[currentTabIndex].decimals ? 0 : tempPanel.tabs[currentTabIndex].decimals}
            onChange={(e) =>
              setNewTabValue([
                {
                  key: 'attributeDecimals',
                  tabValue: parseInt(e.target.value) ? parseInt(e.target.value) : 0,
                },
              ])
            }
            onBlur={() => {
              if (
                tempPanel.tabs[currentTabIndex].decimals &&
                (tempPanel.tabs[currentTabIndex].decimals! < 0 || tempPanel.tabs[currentTabIndex].decimals! > 5)
              ) {
                setNewTabValue([{ key: 'attributeDecimals', tabValue: 0 }])
              }
            }}
          />
          <DataConfigurator currentTabIndex={currentTabIndex} tempPanel={tempPanel} setNewTabValue={setNewTabValue} />
        </>
      ) : null}
    </>
  )
}
