import { AuthProvider } from 'react-oidc-context'

if (
  !process.env.REACT_APP_OIDC_AUTHORITY ||
  !process.env.REACT_APP_OIDC_CLIENT_ID ||
  !process.env.REACT_APP_OIDC_REDIRECT_URI
) {
  throw new Error('OIDC environment variable(s) not set')
}

const oidcConfig = {
  authority: process.env.REACT_APP_OIDC_AUTHORITY,
  client_id: process.env.REACT_APP_OIDC_CLIENT_ID,
  redirect_uri: process.env.REACT_APP_OIDC_REDIRECT_URI,
}

export function KeycloakProvider(props: React.PropsWithChildren<{}>) {
  const { children } = props

  const handleSignin = () => {
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  return (
    <AuthProvider {...oidcConfig} onSigninCallback={handleSignin}>
      {children}
    </AuthProvider>
  )
}
