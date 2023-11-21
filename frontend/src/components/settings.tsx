import * as React from 'react'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuItem from '@mui/material/MenuItem'
import Menu from '@mui/material/Menu'
import IconButton from '@mui/material/IconButton'
import PowerSettingsNewOutlinedIcon from '@mui/icons-material/PowerSettingsNewOutlined'
import { FormControlLabel, ListItemIcon, ListItemText, MenuList } from '@mui/material'
import { useAuth } from 'react-oidc-context'

import {
  CustomSwitch,
  // SmileySwitch
} from './elements/switch'
import borderRadius from 'theme/border-radius'
import colors from 'theme/colors'
import { canWriteCurrentDashboard } from 'utils/auth-helper'
import { useArchitectureContext } from 'context/architecture-provider'

type SettingsProps = {
  switchChecked: boolean
  handleSwitchChange: VoidFunction
}

export function Settings(props: SettingsProps) {
  const auth = useAuth()
  const { architectureContext } = useArchitectureContext()

  const { switchChecked, handleSwitchChange } = props
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleSettingsClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton
        size='large'
        aria-label='settings'
        aria-controls='menu-appbar'
        aria-haspopup='true'
        onClick={handleSettingsOpen}
        color='inherit'
      >
        <SettingsIcon />
      </IconButton>
      <Menu
        PaperProps={{
          style: {
            borderRadius: borderRadius.componentRadius,
          },
        }}
        id='menu-appbar'
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleSettingsClose}
        sx={{
          [`& .MuiList-root`]: {
            backgroundColor: colors.menuBarBackground,
          },
        }}
      >
        {auth.isAuthenticated ? (
          <MenuList>
            {canWriteCurrentDashboard(auth, architectureContext) ? (
              <MenuItem disableRipple>
                <FormControlLabel
                  control={
                    <CustomSwitch disableRipple size='small' checked={switchChecked} onChange={handleSwitchChange} />
                  }
                  label={<span style={{ paddingLeft: 6 }}>Bearbeiten</span>}
                />
              </MenuItem>
            ) : null}
            <MenuItem onClick={() => auth.removeUser()}>
              <ListItemIcon>
                <PowerSettingsNewOutlinedIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>Abmelden</ListItemText>
            </MenuItem>
          </MenuList>
        ) : null}
      </Menu>
    </>
  )
}
