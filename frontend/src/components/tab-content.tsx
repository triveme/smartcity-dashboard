import { TabComponent } from './tab'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { Chart } from 'components/chart'
import { SingleValue, Value } from 'components/value'
import { TransitionAlert } from './elements/transition-alert'
import { MapComponent } from './map/map'
import { PARKING_DATA_SLIDER, SWIMMING_DATA, ZOO_UTILIZATION_DATA } from 'constants/dummy-data'
import { ParkingComponent } from './charts/slider/parking-component'
import { SwimmingDetails } from './swimming-details'
import { Utilization } from './utilization'
import { ListView } from './listview/listview'

type TabProps = {
  tab: TabComponent
  height: number
  value: number
  index: number
  showOnMap?: (index: number, lat: number, lng: number) => void
}

export function TabContent(props: TabProps) {
  const { tab, height, value, index, showOnMap } = props

  //init alertText
  let alertText: String = ''
  if (tab.queryUpdateMsg) {
    alertText = tab.queryUpdateMsg
  }

  const renderTabContent = () => {
    if (tab.type === 'chart') {
      return (
        <Box height='100%' sx={{ position: 'relative' }}>
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
        <Box key={'box-' + (tab._id !== '' ? tab._id : tab.uid)} height={height - 49} style={{ padding: 10 }}>
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
        <Box key='box-tab-componenttype' height='100%' sx={{ position: 'relative' }}>
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

          {tab.componentType === 'swimming' ? <SwimmingDetails infos={SWIMMING_DATA}></SwimmingDetails> : null}

          {tab.componentType === 'pois' ? (
            <ListView
              key={'list-view-tab-' + tab.componentDataType}
              infos={tab.componentData && tab.componentData.length > 0 && tab.componentData[0] ? tab.componentData : []}
              mapOptions={tab.componentOptions}
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

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={tab.name + '-' + index}
      aria-labelledby={tab.name + '-' + index}
      style={{ height: '100%' }}
    >
      {value === index && renderTabContent()}
    </div>
  )
}
