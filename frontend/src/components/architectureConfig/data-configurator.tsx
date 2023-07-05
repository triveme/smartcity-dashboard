import { useState } from 'react'
import { cloneDeep } from 'lodash'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Autocomplete from '@mui/material/Autocomplete'
import Paper from '@mui/material/Paper'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'

import { ColorDialog } from 'components/architectureConfig/color-dialog'
import { PanelComponent } from 'components/panel'
import { SmallField } from 'components/elements/text-fields'
import colors from 'theme/colors'
import { DIALOG_TITLES } from 'constants/text'

type DataConfiguratorProps = {
  currentValueIndex?: number
  currentTabIndex: number
  tempPanel: PanelComponent
  setNewTabValue: (newTabValue: Array<{ key: string; tabValue: any }>) => void
}

export function DataConfigurator(props: DataConfiguratorProps) {
  const { currentValueIndex, currentTabIndex, tempPanel, setNewTabValue } = props
  const currentTab = tempPanel.tabs[currentTabIndex]
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [colorIndex, setColorIndex] = useState(0)
  const aggrMode = currentTab && currentTab.aggrMode ? currentTab.aggrMode : 'single'

  const handleColorPickerClickOpen = (index: number) => {
    setColorIndex(index)
    setColorPickerOpen(true)
  }

  const handleColorPickerClose = () => {
    setColorPickerOpen(false)
  }

  const handleValueAttrChange = (newAttr: string) => {
    if (currentTab.attribute) {
      let newValueKeys = cloneDeep(currentTab.attribute.keys)
      if (currentTab.attribute!.keys.length > currentValueIndex!) {
        newValueKeys[currentValueIndex!] = newAttr
      } else {
        newValueKeys.push(newAttr)
      }
      setNewTabValue([{ key: 'attributeKeys', tabValue: newValueKeys }])
    }
  }

  return (
    <Box key={'Box-Holder-Data-Configurator'}>
      <ColorDialog
        open={colorPickerOpen}
        onClose={handleColorPickerClose}
        setNewTabValue={setNewTabValue}
        currentTab={currentTab}
        attrColorIndex={colorIndex}
      />
      <Divider style={{ marginTop: '8px' }} />
      <Typography
        marginTop={1}
        marginLeft={1}
        marginBottom={1}
        sx={{ fontSize: 14 }}
        color={colors.text}
        fontWeight='bold'
      >
        {DIALOG_TITLES.DATA_CONFIG}
      </Typography>
      <SmallField
        label='Fiware-Service'
        type='text'
        value={currentTab.fiwareService ? currentTab.fiwareService : ''}
        onChange={(e) => setNewTabValue([{ key: 'fiwareService', tabValue: e.target.value }])}
      />
      {aggrMode !== 'single' || currentTab.componentType === 'map' ? (
        <Autocomplete
          multiple
          id='entityIds'
          options={[]}
          value={currentTab.entityId ? currentTab.entityId : []}
          onChange={(e, v) => setNewTabValue([{ key: 'entityIds', tabValue: v }])}
          freeSolo
          renderInput={(params) => (
            <TextField
              {...params}
              key={params.id + '-eIds-text-field'}
              size='small'
              margin='dense'
              variant='outlined'
              style={{ backgroundColor: colors.backgroundColor }}
              label='Entitäts-Ids'
            />
          )}
        />
      ) : (
        <SmallField
          label='Entitäts-ID'
          type='text'
          value={currentTab.entityId && currentTab.entityId.length === 1 ? currentTab.entityId[0] : ''}
          onChange={(e) => setNewTabValue([{ key: 'entityId', tabValue: e.target.value }])}
        />
      )}
      {currentValueIndex === undefined ? (
        <Box>
          <Autocomplete
            multiple
            id='valueKeys'
            options={[]}
            value={currentTab.attribute ? currentTab.attribute?.keys : []}
            onChange={(e, v) => setNewTabValue([{ key: 'attributeKeys', tabValue: v }])}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                key={params.id + '-valKeys-text-field'}
                size='small'
                margin='dense'
                variant='outlined'
                style={{ backgroundColor: colors.backgroundColor }}
                label='Attribute (Chart-Werte)'
              />
            )}
          />
          {currentTab.attribute ? (
            <Box margin={0.5} marginTop={0}>
              {currentTab.attribute!.keys.map((key, index) => {
                let colIndex = index
                if (
                  currentTab.apexMaxAlias &&
                  currentTab.apexMaxAlias !== '' &&
                  currentTab.apexType &&
                  currentTab.apexType === 'donut'
                ) {
                  colIndex = index + 1
                }

                return (
                  <>
                    <Paper
                      key={key + '-alias-paper'}
                      style={{
                        height: '100%',
                        padding: 2,
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: colors.backgroundColor,
                      }}
                      elevation={0}
                    >
                      <Chip key={key + '-chip'} label={key} style={{ marginRight: 15, marginLeft: 10 }} />
                      <SmallField
                        key={key + '-alias-text-field'}
                        label='Alias'
                        type='text'
                        value={currentTab.attribute!.aliases[index]}
                        onChange={(e) =>
                          setNewTabValue([
                            {
                              key: 'attributeAlias',
                              tabValue: {
                                key: key,
                                alias: e.target.value,
                              },
                            },
                          ])
                        }
                      />
                      <Button
                        size='small'
                        key={key + '-alias-color-button'}
                        variant='contained'
                        onClick={() => handleColorPickerClickOpen(colIndex)}
                        style={{
                          marginLeft: 15,
                          marginRight: 10,
                          fontWeight: 'bold',
                          backgroundColor:
                            !currentTab.apexOptions ||
                            !currentTab.apexOptions!.colors ||
                            !currentTab.apexOptions!.colors![colIndex]
                              ? colors.attributeColors[0]
                              : currentTab.apexOptions!.colors![colIndex],
                        }}
                      >
                        Farbe
                      </Button>
                    </Paper>
                    <Divider key={key + '-divider'} />
                  </>
                )
              })}
              {/* <ColorDialog
                open={colorPickerOpen}
                onClose={handleColorPickerClose}
                setNewTabValue={setNewTabValue}
                currentTab={currentTab}
                attrColorIndex={colorIndex}
              /> */}
            </Box>
          ) : null}
        </Box>
      ) : (
        <Paper
          key={'DataConfigurator-alias-paper'}
          style={{
            height: '100%',
            padding: 2,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.backgroundColor,
          }}
          elevation={0}
        >
          <SmallField
            key={'attribute-text-field'}
            label='Attribut'
            type='text'
            value={
              currentTab.attribute && currentTab.attribute?.keys[currentValueIndex]
                ? currentTab.attribute?.keys[currentValueIndex]
                : ''
            }
            onChange={(e) => handleValueAttrChange(e.target.value)}
          />
          <Button
            size='small'
            key={currentTab.attribute?.keys[currentValueIndex] + '-alias-color-button'}
            variant='contained'
            onClick={() => handleColorPickerClickOpen(colorIndex)}
            style={{
              marginLeft: 15,
              marginRight: 10,
              fontWeight: 'bold',
              backgroundColor:
                !currentTab.apexOptions ||
                !currentTab.apexOptions!.colors ||
                !currentTab.apexOptions!.colors![currentValueIndex]
                  ? colors.attributeColors[0]
                  : currentTab.apexOptions!.colors![currentValueIndex],
            }}
          >
            Farbe
          </Button>
        </Paper>
      )}
      <Divider style={{ marginTop: '8px', marginBottom: '8px' }} />
    </Box>
  )
}
