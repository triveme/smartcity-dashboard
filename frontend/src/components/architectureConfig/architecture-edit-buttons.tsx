import { useState } from 'react'
import { cloneDeep } from 'lodash'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import IconButton from '@mui/material/IconButton'

import { WidgetDialog } from './widget-dialog'
import { PanelDialog } from './panel-dialog'
import { DeleteDialog } from 'components/architectureConfig/delete-dialog'
import { DashboardDialog } from './dashboard-dialog'
import colors from 'theme/colors'
import { useArchitectureContext } from 'context/architecture-provider'
import { DashboardComponent } from 'components/dashboard'
import { WidgetComponent } from 'components/widget'
import { PanelComponent } from 'components/panel'
import { useStateContext } from 'providers/state-provider'
import { UpButton, DownButton, LeftButton, RightButton } from 'components/elements/buttons'

type ArchitectureEditDeleteButtonsProps = {
  type: string
  component: DashboardComponent | WidgetComponent | PanelComponent
  parents: string[]
  parentsUids: string[]
  editMode: boolean
}

export function ArchitectureEditButtons(props: ArchitectureEditDeleteButtonsProps) {
  const { type, component, parents, parentsUids, editMode } = props

  const theme = useTheme()
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('sm'))
  const { architectureContext, setArchitectureContext } = useArchitectureContext()
  const { stateContext } = useStateContext()

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false)
  const handleClickDeleteOpen = () => {
    setDeleteOpen(true)
  }
  const handleClickDeleteClose = () => {
    setDeleteOpen(false)
  }

  // New panel
  const [panelCreationOpen, setPanelCreationOpen] = useState(false)
  const handlePanelDialogOpen = () => {
    setPanelCreationOpen(true)
  }
  const handlePanelCreationClose = () => {
    setPanelCreationOpen(false)
  }

  // New dashboard
  const [dashboardCreationOpen, setDashboardCreationOpen] = useState(false)
  const handleDashboardDialogOpen = () => {
    setDashboardCreationOpen(true)
  }
  const handleDashboardCreationClose = () => {
    setDashboardCreationOpen(false)
  }

  // New widget
  const [widgetCreationOpen, setWidgetCreationOpen] = useState(false)
  const handleWidgetDialogOpen = () => {
    setWidgetCreationOpen(true)
  }
  const handleWidgetCreationClose = () => {
    setWidgetCreationOpen(false)
  }

  const handleEdit = () => {
    if (type === 'Dashboard') {
      handleDashboardDialogOpen()
    } else if (type === 'Widget') {
      handleWidgetDialogOpen()
    } else if (type === 'Panel') {
      handlePanelDialogOpen()
    }
  }

  function swapDashboards(index1: number, index2: number) {
    let newArchitectureContext = cloneDeep(architectureContext)
    let newCurrentArchitectureContext = cloneDeep(newArchitectureContext.currentArchitectureContext)

    // Swap dashboards
    const tmp = newCurrentArchitectureContext[index1]
    newCurrentArchitectureContext[index1] = newCurrentArchitectureContext[index2]
    newCurrentArchitectureContext[index2] = tmp

    // Save new order
    newArchitectureContext.currentArchitectureContext = newCurrentArchitectureContext
    newArchitectureContext.queryEnabled = false
    setArchitectureContext(newArchitectureContext)
  }

  function swapWidgets(dashboardIndex: number, index1: number, index2: number) {
    let newArchitectureContext = cloneDeep(architectureContext)
    let newCurrentArchitectureContext = cloneDeep(newArchitectureContext.currentArchitectureContext)
    let dashboardReference = newCurrentArchitectureContext[dashboardIndex]

    // Swap widgets
    const tmp = dashboardReference.widgets[index1]
    dashboardReference.widgets[index1] = dashboardReference.widgets[index2]
    dashboardReference.widgets[index2] = tmp

    // Save new order
    newArchitectureContext.currentArchitectureContext = newCurrentArchitectureContext
    newArchitectureContext.queryEnabled = false
    setArchitectureContext(newArchitectureContext)
  }

  function swapPanels(dashboardIndex: number, widgetIndex: number, index1: number, index2: number) {
    let newArchitectureContext = cloneDeep(architectureContext)
    let newCurrentArchitectureContext = cloneDeep(newArchitectureContext.currentArchitectureContext)
    let widgetReference = newCurrentArchitectureContext[dashboardIndex].widgets[widgetIndex]

    // Swap panels
    const tmp = widgetReference.panels[index1]
    widgetReference.panels[index1] = widgetReference.panels[index2]
    widgetReference.panels[index2] = tmp

    // Save new order
    newArchitectureContext.currentArchitectureContext = newCurrentArchitectureContext
    newArchitectureContext.queryEnabled = false
    setArchitectureContext(newArchitectureContext)
  }

  const renderPositionAdjustmentButtons = () => {
    if (type === 'Dashboard') {
      const numOfDashboards = architectureContext.currentArchitectureContext.length
      if (numOfDashboards > 1) {
        const dashboardIndex = architectureContext.currentArchitectureContext.findIndex(
          (d: DashboardComponent) =>
            d.name === component.name && (component._id ? d._id === component._id : d.uid === component.uid),
        )
        if (dashboardIndex > 0 && dashboardIndex < numOfDashboards - 1) {
          return (
            <>
              <UpButton swapFunction={() => swapDashboards(dashboardIndex, dashboardIndex - 1)} />
              <DownButton swapFunction={() => swapDashboards(dashboardIndex, dashboardIndex + 1)} />
            </>
          )
        } else if (dashboardIndex > 0) {
          return <UpButton swapFunction={() => swapDashboards(dashboardIndex, dashboardIndex - 1)} />
        } else if (dashboardIndex < numOfDashboards - 1) {
          return <DownButton swapFunction={() => swapDashboards(dashboardIndex, dashboardIndex + 1)} />
        }
      }
    } else if (type === 'Widget') {
      const dashboardIndex = architectureContext.currentArchitectureContext.findIndex(
        (d: DashboardComponent) => (d.uid ? d.uid : d._id) === parentsUids[0],
      )
      if (dashboardIndex !== -1) {
        const numOfWidgets = architectureContext.currentArchitectureContext[dashboardIndex].widgets.length
        if (numOfWidgets > 1) {
          const widgetIndex = architectureContext.currentArchitectureContext[dashboardIndex].widgets.findIndex(
            (w: WidgetComponent) => {
              return component._id ? w._id === component._id : w.uid === component.uid
            },
          )
          if (widgetIndex > 0 && widgetIndex < numOfWidgets - 1) {
            return (
              <>
                <UpButton swapFunction={() => swapWidgets(dashboardIndex, widgetIndex, widgetIndex - 1)} />
                <DownButton swapFunction={() => swapWidgets(dashboardIndex, widgetIndex, widgetIndex + 1)} />
              </>
            )
          } else if (widgetIndex > 0) {
            return <UpButton swapFunction={() => swapWidgets(dashboardIndex, widgetIndex, widgetIndex - 1)} />
          } else if (widgetIndex < numOfWidgets - 1) {
            return <DownButton swapFunction={() => swapWidgets(dashboardIndex, widgetIndex, widgetIndex + 1)} />
          }
        }
      }
    } else if (type === 'Panel') {
      const dashboardIndex = architectureContext.currentArchitectureContext.findIndex(
        (d: DashboardComponent) => (d.uid ? d.uid : d._id) === parentsUids[0],
      )
      if (dashboardIndex !== -1) {
        const widgetIndex = architectureContext.currentArchitectureContext[dashboardIndex].widgets.findIndex(
          (w: WidgetComponent) => (w.uid ? w.uid : w._id) === parentsUids[1],
        )
        if (widgetIndex !== -1) {
          const numOfPanels =
            architectureContext.currentArchitectureContext[dashboardIndex].widgets[widgetIndex].panels.length
          if (numOfPanels > 1) {
            const panelIndex = architectureContext.currentArchitectureContext[dashboardIndex].widgets[
              widgetIndex
            ].panels.findIndex((p: PanelComponent) => {
              return (p.uid ? p.uid : p._id) === parentsUids[2]
            })
            if (panelIndex > 0 && panelIndex < numOfPanels - 1) {
              return (
                <>
                  <LeftButton
                    swapFunction={() => swapPanels(dashboardIndex, widgetIndex, panelIndex, panelIndex - 1)}
                  />
                  <RightButton
                    swapFunction={() => swapPanels(dashboardIndex, widgetIndex, panelIndex, panelIndex + 1)}
                  />
                </>
              )
            } else if (panelIndex > 0) {
              return (
                <LeftButton swapFunction={() => swapPanels(dashboardIndex, widgetIndex, panelIndex, panelIndex - 1)} />
              )
            } else if (panelIndex < numOfPanels - 1) {
              return (
                <RightButton swapFunction={() => swapPanels(dashboardIndex, widgetIndex, panelIndex, panelIndex + 1)} />
              )
            }
          }
        }
      }
    }
    return <></>
  }

  return stateContext.authToken && editMode && matchesDesktop ? (
    <>
      <IconButton size='small' onClick={handleEdit} color='inherit' style={{ padding: 0, color: colors.edit }}>
        <EditIcon style={{ fontSize: '1.25rem' }} />
      </IconButton>
      <IconButton
        size='small'
        onClick={handleClickDeleteOpen}
        color='inherit'
        style={{ padding: 0, color: colors.edit }}
      >
        <DeleteIcon style={{ fontSize: '1.25rem' }} />
      </IconButton>
      {renderPositionAdjustmentButtons()}
      <DeleteDialog
        type={type}
        component={component}
        open={deleteOpen}
        onClose={handleClickDeleteClose}
        parents={parents}
      />
      <DashboardDialog
        open={dashboardCreationOpen}
        onClose={handleDashboardCreationClose}
        dashboard={component as DashboardComponent}
        editMode={true}
      />
      <WidgetDialog
        open={widgetCreationOpen}
        onClose={handleWidgetCreationClose}
        editMode={true}
        widget={component as WidgetComponent}
        parentsUids={parentsUids}
      />
      <PanelDialog
        open={panelCreationOpen}
        onClose={handlePanelCreationClose}
        editMode={true}
        panel={component as PanelComponent}
        parents={parents}
        parentsUids={parentsUids}
      />
    </>
  ) : null
}
