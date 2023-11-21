import { Toolbar } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { AppBar } from 'pages/app-bar'
import { ArchitectureActionButtons } from 'components/architectureConfig/architecture-action-buttons'
import { MenuButton } from 'components/fragments/toolbar/menu-button'
import { Settings } from 'components/settings'
import { canWriteCurrentDashboard } from 'utils/auth-helper'
import { MenuIcon } from 'components/fragments/toolbar/menu-icon'
import { useAuth } from 'react-oidc-context'
import { useArchitectureContext } from 'context/architecture-provider'

type TopMenuBarProps = {
  open: boolean
  matchesDesktop: boolean
  toggleDrawer: () => void
  editMode: boolean
  handleSwitchChange: () => void
  handleDashboardSaved: () => void
}

export function TopMenuBar(props: TopMenuBarProps) {
  const { open, matchesDesktop, toggleDrawer, editMode, handleSwitchChange, handleDashboardSaved } = props
  const theme = useTheme()
  const auth = useAuth()

  const { architectureContext } = useArchitectureContext()

  return (
    <AppBar position='fixed' open={open && matchesDesktop} theme={theme}>
      <Toolbar>
        <MenuButton open={open} matchesDesktop={matchesDesktop} toggleDrawer={toggleDrawer} />
        <MenuIcon />
        {auth.isAuthenticated ? (
          <>
            {matchesDesktop && canWriteCurrentDashboard(auth, architectureContext) ? (
              <ArchitectureActionButtons onSavedDashboard={handleDashboardSaved} />
            ) : null}
            <Settings switchChecked={editMode} handleSwitchChange={handleSwitchChange} />
          </>
        ) : null}
      </Toolbar>
    </AppBar>
  )
}
