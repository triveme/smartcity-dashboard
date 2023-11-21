import { useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Grid, { GridSize } from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { v4 as uuidv4 } from 'uuid'

import { AddButton } from 'components/elements/buttons'
import { Panel, PanelComponent } from 'components/panel'
import { PanelDialog } from 'components/architectureConfig/panel-dialog'
import { ArchitectureEditButtons } from 'components/architectureConfig/architecture-edit-buttons'
import { initialPanel } from './architectureConfig/initial-components'
import { useAuth } from 'react-oidc-context'
import { BUTTON_TEXTS } from 'constants/text'
import { WidgetCard } from './elements/widget-card'
import { DashboardIcon, WidgetTabIcons } from './architectureConfig/dashboard-icons'
import colors from 'theme/colors'
import { HeadlineYellow } from './elements/font-types'
import IconButton from '@mui/material/IconButton'
import { MapComponent } from './map/map'
import Link from '@mui/material/Link'
import { MapData } from 'models/data-types'
import { Menu } from '@mui/material'
import { useArchitectureContext } from 'context/architecture-provider'
import { canWriteCurrentDashboard } from 'utils/auth-helper'

export type WidgetComponent = {
  _id: string
  name: string
  uid: string
  width: number
  height: number
  widgetIcon: string
  tabIcons: string[]
  infoHeadline: string
  infoText: string
  infoLinks: InfoLink[]
  panels: PanelComponent[]
}

interface InfoLink {
  infoLinkTitle: string
  infoLinkUrl: string
  infoLinkDescription: string
}

type WidgetProps = {
  widget: WidgetComponent
  parentName: string
  parentsUid: string
  editMode: boolean
}

enum DisplayStatus {
  LIST = 'listView',
  MAP = 'mapView',
  INFO = 'infoView',
}

export function Widget(props: WidgetProps) {
  const { widget, parentName, parentsUid, editMode } = props
  const auth = useAuth()
  const { architectureContext } = useArchitectureContext()

  const preventReopen = useRef(false)
  const theme = useTheme()
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('lg'))

  const [panelCreationOpen, setPanelCreationOpen] = useState(false)

  const [displayStatus, setDisplayStatus] = useState(DisplayStatus.LIST)
  const [activeTabIcon, setActiveTabIcon] = useState(widget.tabIcons ? widget.tabIcons[0] : null)

  const [threeDotsMenuAnchorEl, setThreeDotsMenuAnchorEl] = useState<null | HTMLElement>(null)
  const threeDotsMenuOpen = Boolean(threeDotsMenuAnchorEl)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handlePanelCreationClickOpen = () => {
    setPanelCreationOpen(true)
  }
  const handlePanelCreationClose = () => {
    setPanelCreationOpen(false)
  }

  const provideInitialPanelWithUid = () => {
    let panel = { ...initialPanel }
    panel.uid = uuidv4()

    return panel
  }

  const handleWidgetTabIconClick = (icon: string) => {
    if (!matchesDesktop) {
      setThreeDotsMenuAnchorEl(null)
    }

    switch (icon) {
      case 'mapView':
        setDisplayStatus(DisplayStatus.MAP)
        setActiveTabIcon('mapView')
        break
      case 'mapCar':
        setDisplayStatus(DisplayStatus.LIST)
        setActiveTabIcon('mapCar')
        break
      case 'mapBike':
        setDisplayStatus(DisplayStatus.LIST)
        setActiveTabIcon('mapBike')
        break
      case 'listView':
        setDisplayStatus(DisplayStatus.LIST)
        setActiveTabIcon('listView')
        break
      case 'infoView':
        setDisplayStatus(DisplayStatus.INFO)
        setActiveTabIcon('infoView')
        break
      default:
        setDisplayStatus(DisplayStatus.LIST)
        break
    }
  }

  const handleThreeDotsMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    if (preventReopen.current) {
      event.preventDefault()
      preventReopen.current = false
      return
    }

    if (threeDotsMenuOpen) {
      setThreeDotsMenuAnchorEl(null)
    } else {
      setThreeDotsMenuAnchorEl(event.currentTarget)
    }
  }
  const handleThreeDotsMenuClose = () => {
    setThreeDotsMenuAnchorEl(null)
    buttonRef.current!.focus()
  }

  const handleFindOnMap = (index: number, lat: number, lng: number) => {
    // Activate corresponding widget tab
    setDisplayStatus(DisplayStatus.MAP)
    if (widget.tabIcons.includes('mapView')) {
      setActiveTabIcon('mapView')
    } else {
      setActiveTabIcon('mapSplit')
    }
  }

  const getIconSymbol = () => {
    let iconType = 'default'
    // Icon for tab panel component
    if (widget.panels[0] && widget.panels[0].tabs[0]) {
      iconType = widget.panels[0].tabs[0].componentDataType
      if (iconType === '') {
        if (widget.panels[0].tabs[0].componentType === 'swimming') {
          iconType = 'swimming'
        } else if (widget.panels[0].tabs[0].componentType === 'utilization') {
          iconType = 'zoo'
        } else if (widget.panels[0].tabs[0].componentType === 'parking') {
          iconType = 'parking'
        }
      }
      // Icon for map widget component
    } else {
      if (activeTabIcon === 'mapCar') {
        iconType = 'cars'
      } else if (activeTabIcon === 'mapBike') {
        iconType = 'bikes'
      }
    }
    return iconType
  }

  function getInfoAsMapData(processData: any): MapData[] {
    let mapData: MapData[] = []
    for (let i = 0; i < processData.length; i++) {
      let element = processData[i]
      let tempElement: MapData = {
        name: element.name,
        location: {
          type: 'point',
          coordinates: [element.location.latitude, element.location.longitude],
        },
      }
      mapData.push(tempElement)
    }
    return mapData
  }

  const createWidgetTabIcons = (tabIcons: string[]) => {
    return tabIcons
      ? tabIcons?.map((icon) => (
          <IconButton
            key={'IconButton-Widget-' + icon}
            onClick={() => {
              handleWidgetTabIconClick(icon)
            }}
          >
            <WidgetTabIcons
              key={'DashboardIcon-Widget-' + icon}
              icon={icon}
              color={activeTabIcon === icon ? colors.iconColor : colors.grey}
            />
          </IconButton>
        ))
      : null
  }

  //Activate the first icon on initial loading
  useEffect(() => {
    if (widget.tabIcons) {
      handleWidgetTabIconClick(widget.tabIcons[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <WidgetCard>
      <Box
        display='flex'
        flexDirection={'row'}
        justifyContent={'space-between'}
        gap='20px'
        height='60px'
        style={{
          backgroundColor: colors.widgetTop,
          paddingLeft: '20px',
          paddingTop: '10px',
        }}
      >
        <Box display='flex' justifyContent={'flex-start'} alignItems={'center'} gap={'10px'}>
          <DashboardIcon icon={widget.widgetIcon ? widget.widgetIcon : ''} color={colors.iconColor}></DashboardIcon>
          <Typography variant='h2' noWrap component='div' className='uppercase-text'>
            {widget.name}
          </Typography>
        </Box>

        {/* Vertical three dots menu */}
        {!matchesDesktop ? (
          widget.tabIcons.length === 0 ? null : widget.tabIcons.length === 1 ? (
            <div style={{ marginRight: '1.2rem' }}>
              <WidgetTabIcons
                key={'DashboardIcon-Widget-' + widget.tabIcons[0]}
                icon={widget.tabIcons[0]}
                color={colors.iconColor}
              />
            </div>
          ) : (
            <>
              <IconButton
                onClick={handleThreeDotsMenuClick}
                ref={buttonRef}
                sx={{
                  border: `2px solid ${colors.grey}`,
                  marginRight: '1.2rem',
                  height: 38,
                  width: 38,
                  '&:hover': {
                    borderColor: colors.iconColor,
                  },
                  '& svg': {
                    margin: '-3px',
                  },
                  '& svg:hover': {
                    color: `${colors.iconColor} !important`,
                  },
                }}
              >
                <WidgetTabIcons color={colors.grey} icon={'verticalThreeDotsMenu'} />
              </IconButton>

              <Menu
                id='widget-three-dots-menu'
                open={threeDotsMenuOpen}
                onClose={handleThreeDotsMenuClose}
                anchorEl={threeDotsMenuAnchorEl}
                style={{
                  zIndex: 9999,
                }}
              >
                {createWidgetTabIcons(widget.tabIcons)}
              </Menu>
            </>
          )
        ) : (
          <Box display='flex' justifyContent={'flex-end'} alignItems={'center'}>
            {createWidgetTabIcons(widget.tabIcons)}
          </Box>
        )}

        {editMode ? (
          <Box>
            <ArchitectureEditButtons
              type='Widget'
              component={widget}
              parents={[parentName]}
              parentsUids={[parentsUid]}
              editMode={editMode}
            />
          </Box>
        ) : null}
      </Box>

      {/* WidgetContent */}
      <Box
        width={'100%'}
        padding={'10px'}
        height={widget.height <= 0 || !matchesDesktop ? 'auto' : widget.height}
        style={{
          backgroundColor: colors.widgetContent,
        }}
      >
        {/* LIST */}
        {displayStatus === DisplayStatus.LIST ? (
          <Grid container spacing={2} height={'100%'}>
            {widget.panels &&
              widget.panels.map((panel: PanelComponent, index: number) => (
                <Panel
                  key={'panel-' + (panel._id !== '' ? panel._id : panel.uid) + index}
                  panel={panel}
                  previewMode={false}
                  parents={[parentName, widget.name]}
                  parentsUids={[parentsUid, widget._id !== '' ? widget._id : widget.uid]}
                  editMode={editMode}
                  showOnMap={handleFindOnMap}
                />
              ))}
          </Grid>
        ) : null}

        {/* MAP - pure map full widget view */}
        {displayStatus === DisplayStatus.MAP ? (
          <Grid container spacing={2} height={'100%'}>
            <Grid item container direction='column' display='block' height='100%'>
              <Box width='100%' height='100%'>
                <MapComponent
                  mapData={
                    widget.panels[0] && widget.panels[0].tabs[0] && widget.panels[0].tabs[0].componentData
                      ? getInfoAsMapData(widget.panels[0].tabs[0].componentData)
                      : []
                  }
                  iconType={getIconSymbol()}
                />
              </Box>
            </Grid>
          </Grid>
        ) : null}

        {/* INFO */}
        {displayStatus === DisplayStatus.INFO ? (
          <Grid container spacing={2} height={'100%'}>
            <Grid item container direction='column' lg={Number(widget.width) as GridSize} display='block'>
              <Box sx={{ px: 2, pt: 1, pb: 2 }}>
                <HeadlineYellow text={widget.infoHeadline} />
              </Box>
              <Typography sx={{ px: 2, py: 2 }}>{widget.infoText}</Typography>
              <Box sx={{ px: 2, py: 1 }}>
                {widget.infoLinks.map((infoLink) => (
                  <Link
                    key={'info-link-' + infoLink.infoLinkTitle}
                    href={infoLink.infoLinkUrl}
                    title={infoLink.infoLinkDescription}
                    underline='hover'
                    target='_blank'
                    rel='noopener'
                  >
                    {infoLink.infoLinkTitle}
                  </Link>
                ))}
              </Box>
            </Grid>
          </Grid>
        ) : null}
      </Box>

      {canWriteCurrentDashboard(auth, architectureContext) && editMode && matchesDesktop ? (
        <>
          <Box style={{ marginTop: 16 }}>
            <AddButton onClick={handlePanelCreationClickOpen} text={BUTTON_TEXTS.ADD_PANEL} />
          </Box>
          <PanelDialog
            open={panelCreationOpen}
            onClose={handlePanelCreationClose}
            editMode={false}
            panel={provideInitialPanelWithUid()}
            parents={[parentName, widget.name]}
            parentsUids={[parentsUid, widget._id !== '' ? widget._id : widget.uid]}
          />
        </>
      ) : null}
    </WidgetCard>
  )
}
