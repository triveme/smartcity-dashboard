import { useArchitectureContext } from 'context/architecture-provider'
import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import cloneDeep from 'lodash/cloneDeep'
import { v4 as uuidv4 } from 'uuid'

import { DIALOG_TITLES } from 'constants/text'
import colors from 'theme/colors'
import borderRadius from 'theme/border-radius'
import { SmallField } from 'components/elements/text-fields'
import { SaveButton, CancelButton } from 'components/elements/buttons'
import { snackActions } from '../../utils/snackbar-utils'
import { DashboardIcon, iconList } from 'components/architectureConfig/dashboard-icons'
import { DashboardComponent } from 'components/dashboard'
import { ToggleVisibilityButton } from 'components/elements/toggle-visibility-button'

type DashboardDialogProps = {
  open: boolean
  onClose: () => void
  dashboard: DashboardComponent
  editMode: boolean
}

export function DashboardDialog(props: DashboardDialogProps) {
  const { open, onClose, dashboard, editMode } = props

  const { architectureContext, setArchitectureContext } = useArchitectureContext()
  const [iconChooserOpen, setIconChooserOpen] = useState(false)
  const handleIconChooserClickOpen = () => {
    setIconChooserOpen(true)
  }

  const handleIconChooserClose = () => {
    setIconChooserOpen(false)
  }

  const [newDashboardName, setNewDashboardName] = useState(editMode ? dashboard.name : '')
  const [newDashboardIcon, setNewDashboardIcon] = useState(editMode ? dashboard.icon : 'right')
  const [newDashboardUrl, setNewDashboardUrl] = useState(editMode ? dashboard.url : '')
  const [newDashboardRoles, setNewDashboardRoles] = useState(
    editMode && dashboard.roles ? dashboard.roles : { read: [], write: [] },
  )

  const [dashboardVisibility, setDashboardVisibility] = useState(() => {
    if (typeof dashboard.visible === 'undefined') {
      dashboard.visible = true
    }
    return editMode ? dashboard.visible : false
  })

  const handleOnVisibleClick = () => {
    setDashboardVisibility(!dashboardVisibility)
  }

  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleType, setNewRoleType] = useState('read')

  const handleAddRole = () => {
    if (newRoleName.length > 0) {
      let newRoles = cloneDeep(newDashboardRoles)
      if (newRoles.read.includes(newRoleName) || newRoles.write.includes(newRoleName)) {
        snackActions.error('Rolle ist bereits berechtigt')
        return
      } else if (newRoleType === 'read') {
        newRoles.read.push(newRoleName)
      } else {
        newRoles.write.push(newRoleName)
      }
      setNewDashboardRoles(newRoles)
      setNewRoleName('')
    }
  }

  const handleDeleteRole = (roleName: string, roleType: string) => {
    let newRoles = cloneDeep(newDashboardRoles)
    if (roleType === 'read') {
      newRoles.read = newRoles.read.filter((r) => r !== roleName)
    } else {
      newRoles.write = newRoles.write.filter((r) => r !== roleName)
    }
    setNewDashboardRoles(newRoles)
  }

  const addDashboard = () => {
    if (newDashboardName.length > 0 && newDashboardIcon.length > 0 && newDashboardUrl.length > 0) {
      if (isNewDashboardUrlUnique()) {
        let newArchitectureContext = cloneDeep(architectureContext)
        let newCurrentArchitectureContext = cloneDeep(newArchitectureContext.currentArchitectureContext)
        newCurrentArchitectureContext.push({
          _id: '',
          name: newDashboardName,
          uid: uuidv4(),
          icon: newDashboardIcon,
          url: newDashboardUrl,
          visible: dashboardVisibility,
          roles: newDashboardRoles,
          widgets: [],
        })
        newArchitectureContext.currentArchitectureContext = newCurrentArchitectureContext
        newArchitectureContext.queryEnabled = false
        setArchitectureContext(newArchitectureContext)
      } else {
        snackActions.error('URL bereits vergeben')
        return
      }
    }
    resetFields()
    onClose()
  }

  const editDashboard = () => {
    if (
      newDashboardName.length > 0 &&
      newDashboardIcon.length > 0 &&
      newDashboardUrl.length > 0 &&
      typeof dashboardVisibility !== 'undefined'
    ) {
      if (isNewDashboardUrlUnique()) {
        let newArchitectureContext = cloneDeep(architectureContext)
        let newCurrentArchitectureContext = cloneDeep(newArchitectureContext.currentArchitectureContext)
        const dashboardIndex = newCurrentArchitectureContext.findIndex(
          (d: DashboardComponent) => d._id === dashboard._id && d.url === dashboard.url,
        )
        if (dashboardIndex !== -1) {
          newCurrentArchitectureContext[dashboardIndex].name = newDashboardName
          newCurrentArchitectureContext[dashboardIndex].icon = newDashboardIcon
          newCurrentArchitectureContext[dashboardIndex].url = newDashboardUrl
          newCurrentArchitectureContext[dashboardIndex].visible = dashboardVisibility
          newCurrentArchitectureContext[dashboardIndex].roles = newDashboardRoles
        }
        newArchitectureContext.currentArchitectureContext = newCurrentArchitectureContext
        newArchitectureContext.queryEnabled = false
        setArchitectureContext(newArchitectureContext)
      } else {
        snackActions.error('URL bereits vergeben')
        return
      }
    }
    onClose()
  }

  const resetFields = (soft?: boolean) => {
    if (soft) {
      const dashboardIndex = architectureContext.currentArchitectureContext.findIndex(
        (d: DashboardComponent) => d._id === dashboard._id && d.url === dashboard.url,
      )
      if (dashboardIndex !== -1) {
        architectureContext.currentArchitectureContext[dashboardIndex].name
          ? setNewDashboardName(architectureContext.currentArchitectureContext[dashboardIndex].name)
          : setNewDashboardName('')
        architectureContext.currentArchitectureContext[dashboardIndex].icon
          ? setNewDashboardIcon(architectureContext.currentArchitectureContext[dashboardIndex].icon)
          : setNewDashboardIcon('right')
        architectureContext.currentArchitectureContext[dashboardIndex].url
          ? setNewDashboardUrl(architectureContext.currentArchitectureContext[dashboardIndex].url)
          : setNewDashboardUrl('')
        architectureContext.currentArchitectureContext[dashboardIndex].visible
          ? setDashboardVisibility(architectureContext.currentArchitectureContext[dashboardIndex].visible)
          : setDashboardVisibility(false)
        architectureContext.currentArchitectureContext[dashboardIndex].roles
          ? setNewDashboardRoles(architectureContext.currentArchitectureContext[dashboardIndex].roles)
          : setNewDashboardRoles({ read: [], write: [] })
      }
    } else {
      setNewDashboardName('')
      setNewDashboardIcon('right')
      setNewDashboardUrl('')
      setDashboardVisibility(false)
      setNewDashboardRoles({ read: [], write: [] })
    }
  }

  const resettingClose = () => {
    resetFields(false)
    onClose()
  }

  const softResettingClose = () => {
    resetFields(true)
    onClose()
  }

  const isNewDashboardUrlUnique = () => {
    if (
      architectureContext.currentArchitectureContext.filter((d: DashboardComponent) => d.url === newDashboardUrl)
        .length < 1
    ) {
      return true
    } else {
      if (dashboard.url === newDashboardUrl) {
        return true
      }
      return false
    }
  }

  const limitInput = (val: string, callback: (val: string) => void) => {
    if (/^[a-zA-Z0-9_-]+$/.test(val) || val === '') {
      callback(val)
    } else {
      snackActions.error(val[val.length - 1] + ' ist ein ungültiges Zeichen')
    }
  }

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          borderRadius: borderRadius.componentRadius,
          backgroundColor: colors.panelBackground,
          backgroundImage: 'none',
        },
      }}
    >
      <DialogTitle>
        {editMode ? (
          <Box display='flex' alignItems='center'>
            <EditIcon
              style={{
                color: colors.grayed,
                marginRight: 6,
              }}
            />
            {DIALOG_TITLES.EDIT_DASHBOARD}
          </Box>
        ) : (
          <Box display='flex' alignItems='center'>
            <AddIcon style={{ color: colors.grayed, marginRight: 6 }} />
            {DIALOG_TITLES.ADD_DASHBOARD}
          </Box>
        )}
      </DialogTitle>
      <DialogContent>
        <SmallField
          placeholder='Geben Sie den Namen des Dashboards ein'
          label='Name'
          type='text'
          value={newDashboardName}
          onChange={(e) => setNewDashboardName(e.target.value)}
        />
        <SmallField
          placeholder='Geben Sie die URL an'
          label='URL'
          type='text'
          value={newDashboardUrl}
          onChange={(e) => limitInput(e.target.value, setNewDashboardUrl)}
        />
        <Box display='flex' alignItems='center'>
          <IconButton onClick={handleIconChooserClickOpen}>
            <DashboardIcon icon={newDashboardIcon} color={colors.text} />
          </IconButton>
          <Button onClick={handleIconChooserClickOpen}>Icon ändern</Button>
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
                  <IconButton key={'box-' + icon} onClick={() => setNewDashboardIcon(icon)}>
                    <DashboardIcon
                      key={'dashboardicon-' + icon}
                      icon={icon}
                      color={newDashboardIcon === icon ? colors.colorDetail : colors.white}
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
        <ToggleVisibilityButton
          onClick={handleOnVisibleClick}
          icon={
            dashboardVisibility ? (
              <VisibilityIcon style={{ color: colors.text, fontSize: '1.25rem' }} />
            ) : (
              <VisibilityOffIcon style={{ color: colors.text, fontSize: '1.25rem' }} />
            )
          }
          text={dashboardVisibility ? 'Sichtbar' : 'Unsichtbar'}
        />
        <Box display='flex' alignItems='center'>
          <SmallField
            placeholder='Geben Sie den Namen der Rolle ein'
            label='Rolle berechtigen'
            type='text'
            value={newRoleName}
            onChange={(e) => limitInput(e.target.value, setNewRoleName)}
          />
          <FormControl sx={{ m: 1, minWidth: 120 }} size='small'>
            <InputLabel id='role-select-small-label'>Berechtigung</InputLabel>
            <Select
              labelId='role-select-small-label'
              id='role-select-small'
              value={newRoleType}
              label='Berechtigung'
              onChange={(e) => setNewRoleType(e.target.value)}
            >
              <MenuItem value={'read'}>Lesen</MenuItem>
              <MenuItem value={'write'}>Schreiben</MenuItem>
            </Select>
          </FormControl>
          <IconButton aria-label='Berechtigung speichern' onClick={handleAddRole}>
            <SaveIcon />
          </IconButton>
        </Box>
        <List
          dense
          subheader={
            <ListSubheader component='div' id='write-list-subheader'>
              Rollen mit Schreibberechtigung
            </ListSubheader>
          }
        >
          {newDashboardRoles.write.length > 0 ? (
            newDashboardRoles.write.map((role: string, index: number) => (
              <ListItem
                key={'write-list-' + index}
                secondaryAction={
                  <IconButton
                    edge='end'
                    aria-label='Berechtigung für Rolle löschen'
                    onClick={() => handleDeleteRole(role, 'write')}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={role} />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary='Keine Rollen mit Schreibberechtigung' />
            </ListItem>
          )}
        </List>
        <List
          dense
          subheader={
            <ListSubheader component='div' id='read-list-subheader'>
              Rollen mit Leseberechtigung
            </ListSubheader>
          }
        >
          {newDashboardRoles.read.length > 0 ? (
            newDashboardRoles.read.map((role: string, index: number) => (
              <ListItem
                key={'read-list-' + index}
                secondaryAction={
                  <IconButton
                    edge='end'
                    aria-label='Berechtigung für Rolle löschen'
                    onClick={() => handleDeleteRole(role, 'read')}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={role} />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary='Keine Rollen mit Leseberechtigung' />
            </ListItem>
          )}
        </List>
      </DialogContent>
      <DialogActions style={{ justifyContent: 'center' }}>
        <SaveButton onClick={editMode ? editDashboard : addDashboard} />
        <CancelButton onClick={editMode ? softResettingClose : resettingClose} />
      </DialogActions>
    </Dialog>
  )
}
