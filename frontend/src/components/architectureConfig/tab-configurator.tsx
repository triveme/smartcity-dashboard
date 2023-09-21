import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import cloneDeep from 'lodash/cloneDeep'
import set from 'lodash/set'

import { initialTab } from 'components/architectureConfig/initial-components'
import { PanelComponent } from 'components/panel'
import { ChartConfigurator } from 'components/architectureConfig/chart-configurator'
import { ValueConfigurator } from 'components/architectureConfig/value-configurator'
import { SmallField } from 'components/elements/text-fields'

import colors from 'theme/colors'
import { ComponentConfigurator } from './component-configurator'

const re = new RegExp('^[A-Za-z0-9:_,-]+$')
function isValidDataConfigString(str: string) {
  return re.test(str)
}

type TabConfiguratorProps = {
  currentTabIndex: number
  tempPanel: PanelComponent
  setNewPanelValue: (key: string, value: any) => void
}

type newTabValue = {
  key: string
  tabValue: any
}

export function TabConfigurator(props: TabConfiguratorProps) {
  const { currentTabIndex, tempPanel, setNewPanelValue } = props

  const setNewTabValue = (newTabValues: newTabValue[]) => {
    let newTempTabs = cloneDeep(tempPanel.tabs)
    newTabValues.forEach((newTabValue) => {
      //Necessary check and addition for older components
      if (!newTempTabs[currentTabIndex].componentOptions) {
        newTempTabs[currentTabIndex].componentOptions = {
          allowPopups: false,
          allowScroll: false,
          allowZoom: false,
          iconType: '',
          maxZoom: 20,
          minZoom: 10,
          zoom: 20,
          occupancyRotate: false,
        }
      }

      switch (newTabValue.key) {
        case 'name':
          newTempTabs[currentTabIndex].name = newTabValue.tabValue
          break
        case 'type':
          newTempTabs[currentTabIndex] = cloneDeep(initialTab)
          newTempTabs[currentTabIndex].type = newTabValue.tabValue
          // conveniently set the height to the smallest possible one
          // if (value === "value") {
          //   setNewPanelValue("height", 150);
          // }
          break
        case 'text':
          newTempTabs[currentTabIndex].text = newTabValue.tabValue
          break
        case 'aggrMode':
          newTempTabs[currentTabIndex].aggrMode = newTabValue.tabValue
          break
        case 'apexType':
          if (
            newTempTabs[currentTabIndex].apexType !== newTabValue.tabValue &&
            (newTabValue.tabValue === 'donut' || newTempTabs[currentTabIndex].apexType === 'donut')
          ) {
            // reset apexSeries + labels on change from/ to donut chart
            newTempTabs[currentTabIndex].apexSeries = []
            if (newTempTabs[currentTabIndex].apexOptions) {
              delete newTempTabs[currentTabIndex].apexOptions!.labels
            }
          }
          newTempTabs[currentTabIndex].apexType = newTabValue.tabValue
          break
        case 'apexOptions':
          newTempTabs[currentTabIndex].apexOptions = newTabValue.tabValue
          break
        case 'apexMaxValue':
          newTempTabs[currentTabIndex].apexMaxValue = newTabValue.tabValue
          break
        case 'apexMaxAlias':
          newTempTabs[currentTabIndex].apexMaxAlias = newTabValue.tabValue
          break
        case 'apexMaxColor':
          newTempTabs[currentTabIndex].apexMaxColor = newTabValue.tabValue
          break
        case 'apexStepline':
          newTempTabs[currentTabIndex].apexStepline = newTabValue.tabValue
          break
        case 'timeframe':
          newTempTabs[currentTabIndex].timeframe = newTabValue.tabValue
          break
        case 'fiwareService':
          if (isValidDataConfigString(newTabValue.tabValue)) {
            newTempTabs[currentTabIndex].fiwareService = newTabValue.tabValue
          }
          break
        case 'fiwareType':
          if (isValidDataConfigString(newTabValue.tabValue)) {
            newTempTabs[currentTabIndex].fiwareType = newTabValue.tabValue
          }
          break
        case 'entityId':
          if (isValidDataConfigString(newTabValue.tabValue)) {
            newTempTabs[currentTabIndex].entityId = [newTabValue.tabValue]
          }
          break
        case 'entityIds':
          let idsAreValid = true
          newTabValue.tabValue.forEach((val: string) => {
            if (!isValidDataConfigString(val)) {
              idsAreValid = false
            }
          })
          if (idsAreValid) {
            newTempTabs[currentTabIndex].entityId = newTabValue.tabValue
          }
          break
        case 'attributeKeys':
          let newAttributeForKeys = newTempTabs[currentTabIndex].attribute
            ? cloneDeep(newTempTabs[currentTabIndex].attribute)
            : { keys: [], aliases: [] }
          let allStringsValid = true
          newTabValue.tabValue.forEach((key: string) => {
            if (!isValidDataConfigString(key)) {
              allStringsValid = false
            }
          })
          if (allStringsValid) {
            newAttributeForKeys!.keys = cloneDeep(newTabValue.tabValue)
            const keyAliasLenDiff = newTabValue.tabValue.length - newAttributeForKeys!.aliases.length
            // missing aliases and colors, fill them
            if (keyAliasLenDiff > 0) {
              for (let i = newAttributeForKeys!.aliases.length; i < newTabValue.tabValue.length; i++) {
                if (newTempTabs[currentTabIndex].filterValues && newTempTabs[currentTabIndex].filterValues.length > 0) {
                  newAttributeForKeys!.aliases[i] = newTempTabs[currentTabIndex].filterValues[i]
                } else {
                  newAttributeForKeys!.aliases[i] = newTabValue.tabValue[i]
                }
                if (newTempTabs[currentTabIndex].apexOptions?.colors) {
                  newTempTabs[currentTabIndex].apexOptions?.colors!.push(colors.attributeColors[0])
                } else {
                  set(newTempTabs[currentTabIndex], 'apexOptions.colors', [colors.attributeColors[0]])
                }
              }
            }
            // too many aliases and colors, pop them
            if (keyAliasLenDiff < 0) {
              for (let i = keyAliasLenDiff; i < 0; i++) {
                newAttributeForKeys!.aliases.pop()
                if (newTempTabs[currentTabIndex].apexOptions?.colors) {
                  newTempTabs[currentTabIndex].apexOptions?.colors!.pop()
                }
              }
            }
            newTempTabs[currentTabIndex].attribute = newAttributeForKeys
            newTempTabs[currentTabIndex].apexMaxColor = newTempTabs[currentTabIndex].apexMaxColor
              ? newTempTabs[currentTabIndex].apexMaxColor
              : colors.attributeColors[0]
          }
          break
        case 'attributeAlias':
          let newAttributeForAliases = newTempTabs[currentTabIndex].attribute
            ? cloneDeep(newTempTabs[currentTabIndex].attribute)
            : { keys: [], aliases: [] }
          const keyIndexForAlias = newAttributeForAliases!.keys.indexOf(newTabValue.tabValue.key)
          console.log('Setting attributeAlias: ' + keyIndexForAlias + ' / ' + newAttributeForAliases)
          console.log(newAttributeForAliases)
          if (keyIndexForAlias !== -1) {
            newAttributeForAliases!.aliases[keyIndexForAlias] = newTabValue.tabValue.alias
            newTempTabs[currentTabIndex].attribute = newAttributeForAliases
          }
          break
        case 'attributeDecimals':
          newTempTabs[currentTabIndex].decimals = newTabValue.tabValue
          break
        case 'attributeType':
          newTempTabs[currentTabIndex].attributeType = newTabValue.tabValue
          break
        case 'apexSeries':
          console.log('Setting ApexSeries')
          console.log(newTabValue.tabValue)
          newTempTabs[currentTabIndex].apexSeries = newTabValue.tabValue
          break
        case 'filterProperty':
          console.log('filterProperty: ' + newTabValue.tabValue)
          newTempTabs[currentTabIndex].filterProperty = newTabValue.tabValue
          break
        case 'filterValues':
          console.log('filterValues: ')
          newTempTabs[currentTabIndex].filterValues = cloneDeep(newTabValue.tabValue)
          console.log(newTempTabs[currentTabIndex].filterValues)
          console.log(newTempTabs)
          break
        case 'filterAttribute':
          console.log('filterAttribute: ' + newTabValue.tabValue)
          newTempTabs[currentTabIndex].filterAttribute = newTabValue.tabValue
          break
        case 'componentType':
          newTempTabs[currentTabIndex].componentType = newTabValue.tabValue
          break
        case 'componentDataType':
          newTempTabs[currentTabIndex].componentDataType = newTabValue.tabValue
          break
        case 'componentName':
          newTempTabs[currentTabIndex].componentName = newTabValue.tabValue
          break
        case 'componentDescription':
          newTempTabs[currentTabIndex].componentDescription = newTabValue.tabValue
          break
        case 'componentIcon':
          newTempTabs[currentTabIndex].componentIcon = newTabValue.tabValue
          break
        case 'componentMinimum':
          newTempTabs[currentTabIndex].componentMinimum = newTabValue.tabValue
          break
        case 'componentMaximum':
          newTempTabs[currentTabIndex].componentMaximum = newTabValue.tabValue
          break
        case 'componentWarning':
          newTempTabs[currentTabIndex].componentWarning = newTabValue.tabValue
          break
        case 'componentAlarm':
          newTempTabs[currentTabIndex].componentAlarm = newTabValue.tabValue
          break
        case 'componentUnit':
          newTempTabs[currentTabIndex].componentUnit = newTabValue.tabValue
          break
        case 'componentValue':
          newTempTabs[currentTabIndex].componentValue = newTabValue.tabValue
          break
        // Map Component Options
        case 'allowPopup':
          console.log('allowPopup: ' + newTabValue.tabValue)
          newTempTabs[currentTabIndex].componentOptions.allowPopups = newTabValue.tabValue
          break
        case 'allowScroll':
          console.log('allowScroll: ' + newTabValue.tabValue)
          newTempTabs[currentTabIndex].componentOptions.allowScroll = newTabValue.tabValue
          break
        case 'allowZoom':
          console.log('allowZoom: ' + newTabValue.tabValue)
          newTempTabs[currentTabIndex].componentOptions.allowZoom = newTabValue.tabValue
          break
        case 'mapMinZoom':
          console.log('mapMinZoom: ' + newTabValue.tabValue)
          newTempTabs[currentTabIndex].componentOptions.minZoom = newTabValue.tabValue
          break
        case 'mapMaxZoom':
          console.log('mapMaxZoom: ' + newTabValue.tabValue)
          newTempTabs[currentTabIndex].componentOptions.maxZoom = newTabValue.tabValue
          break
        case 'mapCurZoom':
          console.log('mapCurZoom: ' + newTabValue.tabValue)
          newTempTabs[currentTabIndex].componentOptions.zoom = newTabValue.tabValue
          break
        case 'occupancyRotate':
          console.log('occupancyRotate: ' + newTabValue.tabValue)
          newTempTabs[currentTabIndex].componentOptions.occupancyRotate = newTabValue.tabValue
          break
      }
    })
    setNewPanelValue('tabs', newTempTabs)
  }

  return (
    <>
      <Box display='flex' alignItems='center'>
        <FormControl
          variant='outlined'
          sx={{ minWidth: 150 }}
          style={{
            marginBottom: 4,
            marginTop: 4,
          }}
        >
          <InputLabel id='typ-simple-select-filled-label'>Typ</InputLabel>
          <Select
            size='small'
            margin='dense'
            variant='outlined'
            label='Typ'
            labelId='typ-simple-select-filled-label'
            id='typ-simple-select-filled'
            value={tempPanel.tabs[currentTabIndex] ? tempPanel.tabs[currentTabIndex].type : tempPanel.tabs[0].type}
            onChange={(e) => setNewTabValue([{ key: 'type', tabValue: e.target.value }])}
          >
            <MenuItem value='description'>Beschreibung</MenuItem>
            <MenuItem value='chart'>Chart</MenuItem>
            <MenuItem value='value'>Wert</MenuItem>
            <MenuItem value='component'>Komponente</MenuItem>
          </Select>
        </FormControl>
        {tempPanel.tabs.length > 1 && (
          <SmallField
            label='Tabname'
            type='text'
            customStyle={{
              marginTop: 4,
              marginLeft: 6,
            }}
            value={tempPanel.tabs[currentTabIndex] ? tempPanel.tabs[currentTabIndex].name : ''}
            onChange={(e) => setNewTabValue([{ key: 'name', tabValue: e.target.value }])}
          />
        )}
      </Box>
      {tempPanel.tabs[currentTabIndex] ? (
        tempPanel.tabs[currentTabIndex].type === 'description' ? (
          <SmallField
            customStyle={{
              marginTop: 10,
            }}
            label='Beschreibungstext'
            type='text'
            multiline
            value={tempPanel.tabs[currentTabIndex].text ? tempPanel.tabs[currentTabIndex].text : ''}
            onChange={(e) => setNewTabValue([{ key: 'text', tabValue: e.target.value }])}
          />
        ) : tempPanel.tabs[currentTabIndex].type === 'chart' ? (
          <ChartConfigurator currentTabIndex={currentTabIndex} tempPanel={tempPanel} setNewTabValue={setNewTabValue} />
        ) : tempPanel.tabs[currentTabIndex].type === 'value' ? (
          <ValueConfigurator currentTabIndex={currentTabIndex} tempPanel={tempPanel} setNewTabValue={setNewTabValue} />
        ) : tempPanel.tabs[currentTabIndex].type === 'component' ? (
          <ComponentConfigurator
            currentTabIndex={currentTabIndex}
            tempPanel={tempPanel}
            setNewTabValue={setNewTabValue}
          />
        ) : null
      ) : null}
    </>
  )
}
