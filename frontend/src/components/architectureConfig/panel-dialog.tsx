import { useState } from 'react'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Box from '@mui/material/Box'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import cloneDeep from 'lodash/cloneDeep'
import { v4 as uuidv4 } from 'uuid'

import { SaveButton, CancelButton } from 'components/elements/buttons'
import colors from 'theme/colors'
import borderRadius from 'theme/border-radius'
import { useArchitectureContext } from 'context/architecture-provider'
import { PanelPreview } from 'components/architectureConfig/panel-preview'
import { PanelConfigurator } from 'components/architectureConfig/panel-configurator'
import { initialPanel } from 'components/architectureConfig/initial-components'
import { PanelComponent } from 'components/panel'
import { DashboardComponent } from 'components/dashboard'
import { WidgetComponent } from 'components/widget'
import Typography from '@mui/material/Typography'
import { DIALOG_TITLES } from 'constants/text'

type PanelDialogProps = {
  parents: string[]
  parentsUids: string[]
  editMode: boolean
  panel: PanelComponent
  open: boolean
  onClose: () => void
}

export function PanelDialog(props: PanelDialogProps) {
  const { parents, parentsUids, panel, open, editMode, onClose } = props
  const { architectureContext, setArchitectureContext } = useArchitectureContext()

  const addPanel = () => {
    //Setting temppanels uid and initial tabs uid
    let tPanel: PanelComponent = cloneDeep(tempPanel)
    tPanel.uid = uuidv4()
    tPanel.tabs[0].uid = uuidv4()

    let newArchitectureContext = cloneDeep(architectureContext)
    let newCurrentArchitectureContext = cloneDeep(newArchitectureContext.currentArchitectureContext)

    const dashboardIndex = newCurrentArchitectureContext.findIndex(
      (d: DashboardComponent) => (d._id !== '' ? d._id : d.uid) === parentsUids[0],
    )
    if (dashboardIndex > -1) {
      const widgetIndex = newCurrentArchitectureContext[dashboardIndex].widgets.findIndex(
        (w: WidgetComponent) => (w._id !== '' ? w._id : w.uid) === parentsUids[1],
      )
      if (widgetIndex > -1) {
        newCurrentArchitectureContext[dashboardIndex].widgets[widgetIndex].panels.push(cloneDeep(tPanel))
        newArchitectureContext.currentArchitectureContext = newCurrentArchitectureContext
        newArchitectureContext.queryEnabled = false
        setArchitectureContext(newArchitectureContext)
      }
    }
    setTempPanel(cloneDeep(initialPanel))
    onClose()
  }

  const editPanel = () => {
    let newArchitectureContext = cloneDeep(architectureContext)
    let newCurrentArchitectureContext = cloneDeep(newArchitectureContext.currentArchitectureContext)

    const dashboardIndex = newCurrentArchitectureContext.findIndex(
      (d: DashboardComponent) => (d._id !== '' ? d._id : d.uid) === parentsUids[0],
    )
    if (dashboardIndex > -1) {
      const widgetIndex = newCurrentArchitectureContext[dashboardIndex].widgets.findIndex(
        (w: WidgetComponent) => (w._id !== '' ? w._id : w.uid) === parentsUids[1],
      )
      if (widgetIndex > -1) {
        const panelIndex = newCurrentArchitectureContext[dashboardIndex].widgets[widgetIndex].panels.findIndex(
          (p: PanelComponent) => (p._id !== '' ? p._id : p.uid) === parentsUids[2],
        )
        if (panelIndex > -1) {
          newCurrentArchitectureContext[dashboardIndex].widgets[widgetIndex].panels[panelIndex] = cloneDeep(tempPanel)
          newArchitectureContext.currentArchitectureContext = newCurrentArchitectureContext
          newArchitectureContext.queryEnabled = false
          setArchitectureContext(newArchitectureContext)
        }
      }
    }
    onClose()
  }

  const [tempPanel, setTempPanel] = useState(editMode ? cloneDeep(panel) : cloneDeep(initialPanel))

  const resettingClose = () => {
    setTempPanel(cloneDeep(initialPanel))
    onClose()
  }

  const softResettingClose = () => {
    const dashboardIndex = architectureContext.currentArchitectureContext.findIndex(
      (d: DashboardComponent) => (d._id !== '' ? d._id : d.uid) === parentsUids[0],
    )
    if (dashboardIndex > -1) {
      const widgetIndex = architectureContext.currentArchitectureContext[dashboardIndex].widgets.findIndex(
        (w: WidgetComponent) => (w._id !== '' ? w._id : w.uid) === parentsUids[1],
      )
      if (widgetIndex > -1) {
        const panelIndex = architectureContext.currentArchitectureContext[dashboardIndex].widgets[
          widgetIndex
        ].panels.findIndex((p: PanelComponent) => (p._id !== '' ? p._id : p.uid) === parentsUids[2])
        if (panelIndex > -1) {
          architectureContext.currentArchitectureContext[dashboardIndex].widgets[widgetIndex].panels[panelIndex]
            ? setTempPanel(
                architectureContext.currentArchitectureContext[dashboardIndex].widgets[widgetIndex].panels[panelIndex],
              )
            : setTempPanel(cloneDeep(initialPanel))
        }
      }
    }
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xl'
      fullWidth={true}
      PaperProps={{
        style: {
          borderRadius: borderRadius.componentRadius,
          backgroundColor: colors.backgroundColor,
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle>
        {editMode ? (
          <Box display='flex' alignItems='center' fontWeight='bold'>
            <EditIcon
              style={{
                color: colors.grayed,
                marginRight: 6,
              }}
            />
            {DIALOG_TITLES.EDIT_PANEL}
          </Box>
        ) : (
          <Box display='flex' alignItems='center' fontWeight='bold'>
            <AddIcon
              style={{
                color: colors.grayed,
                marginRight: 6,
              }}
            />{' '}
            {DIALOG_TITLES.ADD_PANEL}
          </Box>
        )}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item container direction='column' xs={12} sm={8} height='100%' display='block'>
            <Typography variant='h3' marginBottom={1}>
              {DIALOG_TITLES.PANEL_PREVIEW}
            </Typography>
            <PanelPreview parents={parents} parentsUids={parentsUids} panelToPreview={tempPanel} />
          </Grid>
          <Grid item container direction='column' xs={12} sm={4} height='100%' display='block'>
            <Typography variant='h3' marginBottom={1}>
              {DIALOG_TITLES.PANEL_CONFIG}
            </Typography>
            <PanelConfigurator tempPanel={tempPanel} setTempPanel={setTempPanel} />
            <Box marginTop={2}>
              <SaveButton
                onClick={editMode ? editPanel : addPanel}
                customStyle={{
                  backgroundColor: colors.colorDetail,
                  color: colors.white,
                  fontWeight: 'bold',
                  marginRight: 15,
                }}
              />
              <CancelButton onClick={editMode ? softResettingClose : resettingClose} />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  )
}
