import { useState } from 'react'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import CssBaseline from '@mui/material/CssBaseline'

import { useArchitectureContext } from 'context/architecture-provider'
import { SideMenue } from 'components/drawer'
import { TopMenuBar } from 'components/menu/TopMenuBar'
import { DashboardRoutes } from 'components/DashboardRoutes'

interface DashboardsPageProps {
  editMode: boolean
  setEditMode: (input: boolean) => void
}

export function DashboardsPage(props: DashboardsPageProps) {
  const { editMode, setEditMode } = props
  const theme = useTheme()
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('sm'))
  const [open, setOpen] = useState(matchesDesktop)
  const [dashboardSavedToggle, setDashboardSavedToggle] = useState(false)

  const { architectureContext } = useArchitectureContext()
  let { currentArchitectureContext } = architectureContext
  currentArchitectureContext = architectureContext.currentArchitectureContext || []

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const toggleDrawer = () => {
    setOpen(!open)
  }

  const handleSwitchChange = () => {
    setEditMode(!editMode)
  }

  const handleDashboardSaved = () => {
    setDashboardSavedToggle(!dashboardSavedToggle)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <TopMenuBar
        editMode={editMode}
        open={open}
        handleDashboardSaved={handleDashboardSaved}
        handleSwitchChange={handleSwitchChange}
        matchesDesktop={matchesDesktop}
        toggleDrawer={toggleDrawer}
      />
      <SideMenue
        variant='permanent'
        open={open}
        dashboards={currentArchitectureContext}
        handleDrawerClose={handleDrawerClose}
        editMode={editMode}
      />
      <DashboardRoutes
        open={open}
        editMode={editMode}
        matchesDesktop={matchesDesktop}
        dashboardSavedToggle={dashboardSavedToggle}
      />
    </Box>
  )
}
