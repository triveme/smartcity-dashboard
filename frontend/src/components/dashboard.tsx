import { useState, useEffect } from 'react'
import cloneDeep from 'lodash/cloneDeep'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Grid, { GridSize } from '@mui/material/Grid'
import Box from '@mui/material/Box'

import { Widget, WidgetComponent } from 'components/widget'
import { WidgetDialog } from 'components/architectureConfig/widget-dialog'
import { AddButton } from 'components/elements/buttons'
import { initialWidget } from './architectureConfig/initial-components'
import { Spinner } from 'components/elements/spinner'
import { getDashboardArchitecture } from 'clients/architecture-client'
import { useArchitectureContext } from 'context/architecture-provider'
import { useStateContext } from '../providers/state-provider'
import { BUTTON_TEXTS, EMPTY_DASHBOARD } from 'constants/text'
import { DashboardWrapper } from './elements/dashboard-wrapper'

export type DashboardComponent = {
  _id: string
  name: string
  uid: string
  url: string
  icon: string
  widgets: WidgetComponent[]
  index?: number
  visible?: boolean
}

type DashboardProps = {
  dashboard: DashboardComponent
  editMode: boolean
  loggedIn: boolean
  dashboardSaved: boolean
}

export function Dashboard(props: DashboardProps) {
  const { dashboard, editMode, loggedIn, dashboardSaved } = props
  const { architectureContext, setArchitectureContext } = useArchitectureContext()
  const { stateContext } = useStateContext()
  const theme = useTheme()
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  const [widgetCreationOpen, setWidgetCreationOpen] = useState(false)

  useEffect(() => {
    if (dashboard && dashboard._id) {
      // edit mode, load data once
      if (dashboard.widgets === undefined && architectureContext.queryEnabled === false) {
        getDashboardArchitecture({
          dashboardUrl: dashboard.url,
          isAdmin: stateContext.authToken ? true : false,
          queryEnabled: false,
        }).then((architectureData) => {
          const dIndex = architectureData.findIndex((d: DashboardComponent) => {
            return d._id === dashboard._id
          })
          if (dIndex > -1) {
            let newCurrentArchitectureContext = cloneDeep(architectureContext.currentArchitectureContext)
            let newInitialArchitectureContext = cloneDeep(architectureContext.initialArchitectureContext)
            newInitialArchitectureContext[dIndex] = architectureData[dIndex]
            const cDIndex = newCurrentArchitectureContext.findIndex((d: DashboardComponent) => {
              return d._id === dashboard._id
            })
            if (cDIndex > -1) {
              newCurrentArchitectureContext[cDIndex] = architectureData[dIndex]
            }
            setArchitectureContext({
              ...architectureContext,
              initialArchitectureContext: newInitialArchitectureContext,
              currentArchitectureContext: newCurrentArchitectureContext,
              dashboardUrl: dashboard.url,
              isLoading: false,
            })
          }
        })
      } else {
        setArchitectureContext({
          ...architectureContext,
          dashboardUrl: dashboard.url,
          isLoading: true,
        })
      }
    }
    // eslint-disable-next-line
  }, [dashboard.url, dashboardSaved, stateContext.authToken, loggedIn])

  const handleWidgetCreationClickOpen = () => {
    setWidgetCreationOpen(true)
  }

  const handleWidgetCreationClose = () => {
    setWidgetCreationOpen(false)
  }

  const displayDashboardContent = () => {
    // Dashboard not loaded
    if (!dashboard.widgets) {
      return <Spinner />
    }
    // No widgets in dashboard
    if (dashboard.widgets.length === 0) {
      return <Typography marginBottom={1}>{EMPTY_DASHBOARD}</Typography>
    }
    // Dashboard with widgets
    else {
      return (
        <Box width={'100%'}>
          <Grid container spacing={2}>
            {dashboard.widgets.map((widget: WidgetComponent) => (
              <Grid
                key={'grid-item-widget-' + widget.name}
                item
                container
                direction='column'
                lg={Number(widget.width) as GridSize}
                display='block'
              >
                <Widget
                  key={'widget-' + (widget._id !== '' ? widget._id : widget.uid)}
                  widget={widget}
                  parentName={dashboard.name}
                  parentsUid={dashboard._id !== '' ? dashboard._id : dashboard.uid}
                  editMode={editMode}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )
    }
  }

  return (
    <DashboardWrapper>
      {displayDashboardContent()}
      {stateContext.authToken && editMode && matchesDesktop ? (
        <>
          <AddButton onClick={handleWidgetCreationClickOpen} text={BUTTON_TEXTS.ADD_WIDGET} />
          <WidgetDialog
            open={widgetCreationOpen}
            onClose={handleWidgetCreationClose}
            editMode={false}
            widget={initialWidget}
            parentsUids={[dashboard._id !== '' ? dashboard._id : dashboard.uid]}
          />
        </>
      ) : null}
    </DashboardWrapper>
  )
}
