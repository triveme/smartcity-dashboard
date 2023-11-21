import React, { useState, createContext, useContext } from 'react'
import { cloneDeep, isEqual, omit } from 'lodash'

import { useDashboardArchitecture } from 'clients/architecture-client'
import { useAuth } from 'react-oidc-context'

type ArchitectureValue = any

const initialCombinedArchitectureContext = {
  initialArchitectureContext: [],
  currentArchitectureContext: [],
  dashboardUrl: '',
  queryEnabled: true,
  isLoading: true,
}

export const ArchitectureContext = createContext<ArchitectureValue>(initialCombinedArchitectureContext)

export const useArchitectureContext = () => useContext(ArchitectureContext)

export function ArchitectureContextProvider(props: React.PropsWithChildren<{}>) {
  const { children } = props

  const auth = useAuth()

  const [architectureContext, setArchitectureContext] = useState(initialCombinedArchitectureContext)

  const queriedArchitectureData = useDashboardArchitecture({
    token: auth.isAuthenticated ? auth.user?.access_token : undefined,
    dashboardUrl: architectureContext.dashboardUrl,
    queryEnabled: architectureContext.queryEnabled,
  })

  if (queriedArchitectureData && queriedArchitectureData.data && architectureContext.queryEnabled) {
    // architecture changed
    if (
      !isEqual(
        omit(queriedArchitectureData.data, ['apexSeries', 'values']),
        omit(architectureContext.initialArchitectureContext, ['apexSeries', 'values']),
      )
    ) {
      setArchitectureContext({
        ...architectureContext,
        initialArchitectureContext: cloneDeep(queriedArchitectureData.data),
        currentArchitectureContext: cloneDeep(queriedArchitectureData.data),
        isLoading: false,
      })
    }
    // only the chart data changed
    else if (!isEqual(architectureContext.currentArchitectureContext, queriedArchitectureData.data)) {
      setArchitectureContext({
        ...architectureContext,
        currentArchitectureContext: cloneDeep(queriedArchitectureData.data),
        isLoading: false,
      })
    }
  }

  return (
    <ArchitectureContext.Provider value={{ architectureContext, setArchitectureContext }}>
      {children}
    </ArchitectureContext.Provider>
  )
}
