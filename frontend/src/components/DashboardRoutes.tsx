import Box from '@mui/material/Box'
import { Routes, Route, Navigate } from 'react-router-dom'

import { Dashboard, DashboardComponent } from 'components/dashboard'
import { DrawerHeader } from 'pages/app-bar'
import { Information } from 'pages/information-page'
import { Impressum } from 'pages/legal/impressum'
import { PrivacyPolicy } from 'pages/legal/privacy-policy'
import { TermsOfUse } from 'pages/legal/terms-of-use'
import { Spinner } from './elements/spinner'
import { useArchitectureContext } from 'context/architecture-provider'

type DashboardRoutesProps = {
  open: boolean
  matchesDesktop: boolean
  editMode: boolean
  dashboardSavedToggle: boolean
}

export function DashboardRoutes(props: DashboardRoutesProps) {
  const { open, matchesDesktop, editMode, dashboardSavedToggle } = props

  const { architectureContext } = useArchitectureContext()
  let { currentArchitectureContext } = architectureContext
  currentArchitectureContext = architectureContext.currentArchitectureContext || []

  return (
    <Box
      component='main'
      style={{
        width: matchesDesktop ? `calc(100% - ${open ? '240px' : '0px'})` : '100%',
        height: '100vh',
      }}
    >
      {matchesDesktop ? <DrawerHeader /> : null}
      <Routes>
        <Route path={'/impressum'} element={<Impressum />}></Route>
        <Route path={'/datenschutzerklaerung'} element={<PrivacyPolicy />}></Route>
        <Route path={'/nutzungsbedingungen'} element={<TermsOfUse />}></Route>
        <Route path={'/information'} element={<Information />}></Route>
        {currentArchitectureContext.map((dashboard: DashboardComponent) => (
          <Route
            key={'route-' + dashboard.url}
            path={'/' + dashboard.url}
            element={<Dashboard dashboardSaved={dashboardSavedToggle} editMode={editMode} dashboard={dashboard} />}
          />
        ))}
        <Route
          path='*'
          element={
            currentArchitectureContext.length > 0 ? (
              <Navigate to={'/' + currentArchitectureContext[0].url} />
            ) : architectureContext.isLoading ? (
              <Spinner />
            ) : (
              <p>Es können keine Dashboards abgerufen werden.</p>
            )
          }
        />
      </Routes>
    </Box>
  )
}
