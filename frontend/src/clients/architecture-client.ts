import { useQuery } from 'react-query'

import { DashboardComponent } from 'components/dashboard'
import { client } from 'clients/client'

export type ArchitectureRequestData = {
  token?: string
  dashboardUrl: string
  queryEnabled: boolean
}

export async function getDashboardArchitecture(args: ArchitectureRequestData) {
  const headers: HeadersInit = {}
  if (args.token) {
    headers.Authorization = `Bearer ${args.token}`
  }

  return client
    .get('/dashboards' + (args.dashboardUrl.length > 0 ? '/' + args.dashboardUrl : ''), { headers })
    .then((response) => {
      return response.data
    })
    .catch((err) => {
      console.error(err)
      return []
    })
}

export function useDashboardArchitecture(args: ArchitectureRequestData) {
  const result = useQuery({
    queryKey: ['dashboardArchitecture', args],
    queryFn: () => getDashboardArchitecture(args),
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    keepPreviousData: true,
    placeholderData: [],
    enabled: args.queryEnabled,
  })

  return { ...result }
}

export type ArchitecturePostData = {
  token?: string
  dashboards: (DashboardComponent | { _id: string })[]
}

export async function postArchitecture(args: ArchitecturePostData) {
  const headers: HeadersInit = {}
  if (args.token) {
    headers.Authorization = `Bearer ${args.token}`
  }

  return client.post('/dashboards', args.dashboards, {
    headers,
  })
}
