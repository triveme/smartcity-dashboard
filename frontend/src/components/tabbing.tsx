import React from 'react'
import { PanelComponent } from './panel'
import { TabContent } from './tab-content'
import { TabComponent } from './tab'
import Box from '@mui/material/Box'
import colors from 'theme/colors'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

type TabbingProps = {
  panel: PanelComponent
  showOnMap?: (index: number, lat: number, lng: number) => void
}

function a11yProps(tab: TabComponent, index: number) {
  return {
    id: tab.name + '-' + index,
    'aria-controls': tab.name + '-' + index,
  }
}

export function Tabbing(props: TabbingProps) {
  const { panel, showOnMap } = props

  const [tabValue, setTabValue] = React.useState(0)
  const handleTabValueChange = (event: React.SyntheticEvent, newTabValue: number) => {
    setTabValue(newTabValue)
  }

  if (panel.tabs.length === 1) {
    return <>{renderTabContent(panel.tabs[0], 0)}</>
  } else if (panel.tabs.length > 1) {
    return (
      <>
        {panel.tabs.map((tab: TabComponent, index: number) => (
          <div
            role='tabpanel'
            hidden={tabValue !== index}
            id={tab.name + '-' + index}
            aria-labelledby={tab.name + '-' + index}
            key={'tabpanel-' + (tab._id !== '' ? tab._id : tab.uid + index)}
            style={{ height: '100%' }}
          >
            {tabValue === index && renderTabContent(tab, index)}
          </div>
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

  function renderTabContent(tab: TabComponent, index: number) {
    return (
      <TabContent
        key={'singletab-' + (tab._id !== '' ? tab._id : tab.uid)}
        height={panel.name ? panel.height - 24 - (panel.tabs.length > 1 ? 49 : 0) : panel.height}
        tab={tab}
        showOnMap={showOnMap ? showOnMap : () => {}}
        value={tabValue}
        index={index}
      />
    )
  }
}
