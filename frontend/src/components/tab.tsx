import React from 'react'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { Chart } from 'components/chart'
import { SingleValue, Value } from 'components/value'
import { ApexOptions } from 'apexcharts'
import { PanelComponent } from 'components/panel'

import colors from 'theme/colors'
import { TransitionAlert } from './elements/transition-alert'
import { MeasurementComponent } from './measurement'
import { MapComponent } from './map/map'
import { PARKING_DATA_SLIDER, POI_DATA, SWIMMING_DATA_SLIDER, ZOO_UTILIZATION_DATA } from 'constants/dummy-data'
import { ParkingComponent } from './charts/slider/parking-component'
import { ListView } from './listview/listview'
import { SwimmingDetails } from './swimming-details'
import { Utilization } from './utilization'
import { MapComponentOptions } from 'models/data-types'

export type TabComponent = {
  _id: string
  type: string
  name: string
  uid: string
  donutToTotalLabel?: boolean
  text?: string
  apexType?: string
  apexOptions?: ApexOptions
  apexSeries?: Array<any>
  apexMaxValue?: number
  apexMaxAlias?: string
  apexMaxColor?: string
  apexStepline?: boolean
  componentType: string
  componentData: Array<any>
  componentDataType: string
  componentName: string
  componentDescription: string
  componentIcon: string
  componentMinimum: number
  componentMaximum: number
  componentWarning: number
  componentAlarm: number
  componentUnit: string
  componentValue: number
  componentOptions: MapComponentOptions
  timeframe?: number
  fiwareService?: string
  entityId?: string[]
  filterProperty: string
  filterAttribute: string
  filterValues: string[]
  attribute?: {
    keys: string[]
    aliases: string[]
  }
  values?: number[]
  decimals?: number
  attributeType?: string
  aggrMode?: string
  queryData?: {
    id?: string
  }
  queryUpdateMsg?: String
}

type SingleTabProps = {
  tab: TabComponent
  height: number
  showOnMap?: (index: number, lat: number, lng: number) => void
}

function SingleTab(props: SingleTabProps) {
  const { tab, height, showOnMap } = props

  //init alertText
  let alertText: String = ''
  if (tab.queryUpdateMsg) {
    alertText = tab.queryUpdateMsg
  }

  if (tab.type === 'chart') {
    return (
      <Box
        height='100%'
        sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'stretch' }}
      >
        <Chart key={'chart-' + (tab._id !== '' ? tab._id : tab.uid)} height={height - 50} tab={tab} />
        {!tab.apexSeries || (tab.apexSeries && tab.apexSeries?.length < 1) ? (
          alertText === '' ? (
            <TransitionAlert alertText={alertText} info={true} />
          ) : (
            <TransitionAlert alertText={alertText} />
          )
        ) : null}
      </Box>
    )
  } else if (tab.type === 'description') {
    return (
      <Box
        key={'box-' + (tab._id !== '' ? tab._id : tab.uid)}
        height='100%'
        style={{ padding: 10, overflow: 'hidden' }}
      >
        <Typography overflow='auto' height='100%' component='div' variant='body2' lineHeight={1.75}>
          {tab.text}
        </Typography>
      </Box>
    )
  } else if (tab.type === 'value') {
    return (
      <Box sx={{ position: 'relative', height: 'inherit' }}>
        {tab.attributeType && tab.attributeType === 'old' ? (
          <Value key={'value-' + (tab._id !== '' ? tab._id : tab.uid)} tab={tab} />
        ) : (
          <SingleValue key={'value-' + (tab._id !== '' ? tab._id : tab.uid)} tab={tab} />
        )}
        {!tab.values || (tab.values && tab.values?.length < 1) ? (
          alertText === '' ? (
            <TransitionAlert alertText={alertText} info={true} />
          ) : (
            <TransitionAlert alertText={alertText} />
          )
        ) : null}
      </Box>
    )
  } else if (tab.type === 'component') {
    return (
      <Box key='box-tab-componenttype' height='100%' sx={{ position: 'relative', overflow: 'hidden' }}>
        {tab.componentType === 'map' ? (
          <MapComponent
            key={'map-component-tab-' + tab.componentDataType}
            mapData={tab.componentData}
            iconType={tab.componentDataType}
            mapOptions={tab.componentOptions}
          />
        ) : null}

        {tab.componentType === 'parking' ? (
          <ParkingComponent
            sliders={tab.componentData && tab.componentData.length > 0 ? tab.componentData : PARKING_DATA_SLIDER}
            showOnMap={showOnMap ? showOnMap : () => {}}
          />
        ) : null}

        {tab.componentType === 'measurement' ? <MeasurementComponent tab={tab}></MeasurementComponent> : null}

        {tab.componentType === 'swimming' ? <SwimmingDetails infos={SWIMMING_DATA_SLIDER}></SwimmingDetails> : null}

        {tab.componentType === 'pois' ? (
          <ListView
            key={'list-view-tab-' + tab.componentDataType}
            infos={
              tab.componentData && tab.componentData.length > 0 && tab.componentData[0] ? tab.componentData : POI_DATA
            }
          />
        ) : null}

        {tab.componentType === 'utilization' ? (
          <Utilization
            data={ZOO_UTILIZATION_DATA}
            currentValue={
              tab.componentData && tab.componentData[0] ? Number(tab.componentData[0].currentUtilization) : 0
            }
          />
        ) : null}
      </Box>
    )
  } else {
    return <>Invalid Tab type</>
  }
}

type TabPanelProps = {
  value: number
  tab: TabComponent
  index: number
  height: number
  showOnMap?: (index: number, lat: number, lng: number) => void
}

function TabPanel(props: TabPanelProps) {
  const { value, tab, height, index, showOnMap } = props

  return (
    <div
      role='tabpanel'
      style={{ height: '100%' }}
      hidden={value !== index}
      id={tab.name + '-' + index}
      aria-labelledby={tab.name + '-' + index}
    >
      {value === index && (
        <SingleTab
          key={'singletab-' + (tab._id !== '' ? tab._id : tab.uid)}
          height={height}
          tab={tab}
          showOnMap={showOnMap ? showOnMap : () => {}}
        />
      )}
    </div>
  )
}

function a11yProps(tab: TabComponent, index: number) {
  return {
    id: tab.name + '-' + index,
    'aria-controls': tab.name + '-' + index,
  }
}

type TabbingProps = {
  panel: PanelComponent
  showOnMap?: (index: number, lat: number, lng: number) => void
}

export function Tabbing(props: TabbingProps) {
  const { panel, showOnMap } = props

  const [tabValue, setTabValue] = React.useState(0)
  const handleTabValueChange = (event: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue)
  }

  if (panel.tabs.length === 1) {
    return (
      <SingleTab
        key={'singletab-' + (panel.tabs[0]._id !== '' ? panel.tabs[0]._id : panel.tabs[0].uid)}
        height={panel.name ? panel.height - 24 : panel.height}
        tab={panel.tabs[0]}
        showOnMap={showOnMap ? showOnMap : () => {}}
      />
    )
  } else if (panel.tabs.length > 1) {
    return (
      <>
        {panel.tabs.map((tab: TabComponent, index: number) => (
          <TabPanel
            key={'tabpanel-' + (tab._id !== '' ? tab._id : tab.uid + index)}
            value={tabValue < panel.tabs.length ? tabValue : 0}
            tab={tab}
            height={panel.name ? panel.height - 24 - 49 : panel.height - 49}
            index={index}
          />
        ))}
        <Box display='flex' justifyContent='center'>
          <Tabs
            value={tabValue < panel.tabs.length ? tabValue : 0}
            sx={{
              minHeight: 38,
              maxHeight: 38,
              '& .Mui-selected css-1q2h7u5': {
                color: colors.edit,
              },
            }}
            onChange={handleTabValueChange}
            aria-label={panel.name + '-tabs'}
          >
            {panel.tabs.map((tab: TabComponent, index: number) => (
              <Tab
                key={'tab-' + (tab._id !== '' ? tab._id : tab.uid + index)}
                style={{
                  fontSize: 'small',
                  padding: 0,
                  fontWeight: 'bold',
                }}
                label={tab.name}
                {...a11yProps(tab, index)}
              />
            ))}
          </Tabs>
        </Box>
      </>
    )
  } else {
    return <p>Kein Inhalt gefunden.</p>
  }
}
