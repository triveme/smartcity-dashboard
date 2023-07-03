import { useMediaQuery } from '@mui/material'

import theme from 'theme/theme'

type DashboardWrapperProps = {
  children: React.ReactNode
}

// ensures that whole dashboard content is  visible on desktop and mobile
export function DashboardWrapper(props: DashboardWrapperProps) {
  const { children } = props
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('sm'))

  return (
    <div
      style={{
        marginTop: matchesDesktop ? 0 : '70px',
      }}
    >
      {children}
    </div>
  )
}
