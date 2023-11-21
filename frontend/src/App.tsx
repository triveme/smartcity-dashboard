import React, { useCallback, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { SnackbarProvider } from 'notistack'

import { SnackbarUtilsConfigurator } from './utils/snackbar-utils'
import { KeycloakProvider } from './providers/keycloak-provider'
import { ArchitectureContextProvider } from 'context/architecture-provider'

import { Spinner } from 'components/elements/spinner'

export const queryClient = new QueryClient()

const LoginPage = React.lazy(() =>
  import(/* webpackPrefetch: true */ 'pages/login-page').then((module) => ({
    default: module.LoginPage,
  })),
)
const DashboardsPage = React.lazy(() =>
  import(/* webpackPrefetch: true */ 'pages/dashboards-page').then((module) => ({
    default: module.DashboardsPage,
  })),
)

function App() {
  const [editMode, setEditMode] = useState(false)

  const handleSetEditMode = useCallback(
    (input: boolean) => {
      setEditMode(input)
    },
    [setEditMode],
  )

  return (
    <React.Suspense fallback={<Spinner />}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
        <SnackbarUtilsConfigurator />
        <KeycloakProvider>
          <QueryClientProvider client={queryClient}>
            <ArchitectureContextProvider>
              <BrowserRouter basename={process.env.PUBLIC_URL}>
                <Routes>
                  <Route path='/login' element={<LoginPage />} />
                  <Route path='*' element={<DashboardsPage editMode={editMode} setEditMode={handleSetEditMode} />} />
                </Routes>
              </BrowserRouter>
            </ArchitectureContextProvider>
          </QueryClientProvider>
        </KeycloakProvider>
      </SnackbarProvider>
    </React.Suspense>
  )
}

export default App
