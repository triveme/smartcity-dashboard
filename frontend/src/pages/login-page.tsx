import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import jwt_decode, { JwtPayload } from 'jwt-decode'
import { cloneDeep } from 'lodash'

import { signin } from '../clients/auth-client'
import { useStateContext } from '../providers/state-provider'
import { SmallField } from 'components/elements/text-fields'
import smartCityLogo from 'assets/logo_eichenzell.svg'
// import smartCityLogo from 'assets/smartCityLogo.svg'
import loginBackground from 'assets/loginBackground.png'
import colors from 'theme/colors'
import borderRadius from 'theme/border-radius'
import { getDashboardArchitecture } from 'clients/architecture-client'
import { useArchitectureContext } from 'context/architecture-provider'
import { LOGIN_TITLE } from 'constants/text'
import { LoadingButton } from 'components/elements/loading-button'

type LoginPageProps = {
  handleLogin: VoidFunction
  enableEditMode: VoidFunction
}

export function LoginPage(props: LoginPageProps) {
  const { handleLogin, enableEditMode } = props
  const [userName, setUserName] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const { setArchitectureContext } = useArchitectureContext()
  const { stateContext, setStateContext } = useStateContext()

  let navigate = useNavigate()

  const refreshDashboardData = (isAdmin: boolean) => {
    getDashboardArchitecture({
      dashboardUrl: '',
      isAdmin: isAdmin,
      queryEnabled: true,
    })
      .then((architectureData) => {
        setArchitectureContext({
          initialArchitectureContext: cloneDeep(architectureData),
          currentArchitectureContext: cloneDeep(architectureData),
          dashboardUrl: '',
          queryEnabled: true,
          isLoading: true,
        })
        // history.replace("/");
        navigate('/', { replace: true })
      })
      .catch((e) => {
        console.error('Seitenaufbau konnte nicht abgerufen & aktualisiert werden.')
      })
  }

  const handleLoginSubmit = (event: any) => {
    event.preventDefault()
    return signin({
      username: userName,
      password: userPassword,
    })
  }

  const handleLoginSuccess = (res: any) => {
    sessionStorage.setItem('authToken', res.data.accessToken)

    refreshDashboardData(true)

    setStateContext({
      ...stateContext,
      authToken: res.data.accessToken,
      adminId: jwt_decode<JwtPayload>(res.data.accessToken),
    })
    console.log('Logged in as admin')
    handleLogin()
    enableEditMode()

    navigate('/', { replace: true })
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        backgroundImage: `url(${loginBackground})`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <Box
        position='absolute'
        top={0}
        left={0}
        marginLeft={10}
        display={{
          xs: 'none',
          sm: 'none',
          md: 'none',
          lg: 'none',
          xl: 'block',
        }}
      />
      <Paper
        style={{
          minWidth: 360,
          maxWidth: 420,
          minHeight: 420,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: borderRadius.componentRadius,
          backgroundColor: colors.widgetBackground,
        }}
        elevation={0}
      >
        <Box
          component='form'
          noValidate
          style={{
            maxWidth: 320,
            minWidth: 320,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            borderRadius: 0,
          }}
        >
          <Box
            style={{
              backgroundColor: colors.colorDetail,
              paddingTop: 10,
              paddingBottom: 5,
              justifyContent: 'center',
              display: 'flex',
              marginBottom: 16,
              borderRadius: borderRadius.componentRadius,
            }}
          >
            <img height='62px' src={smartCityLogo} alt='logo smart city' />
          </Box>
          <Typography variant='h1' paddingTop={1}>
            {LOGIN_TITLE}
          </Typography>
          <SmallField
            label='Nutzername'
            type='text'
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            customStyle={{ marginBottom: 16 }}
          />
          <SmallField
            label='Passwort'
            type='password'
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            customStyle={{ marginBottom: 16, color: colors.colorDetail }}
          />
          <Box paddingTop={2} width='100%' display='grid'>
            <LoadingButton
              type='submit'
              size='large'
              fullWidth
              style={{
                mt: 10,
                mb: 2,
                backgroundColor: colors.colorDetail,
                color: colors.white,
              }}
              queryFun={handleLoginSubmit}
              queryCompleteFun={handleLoginSuccess}
              queryText='Anmelden'
            />
          </Box>
          <Box paddingTop={2} width='100%' fontSize='10px' display='flex' justifyContent='space-evenly'>
            <Link
              to='//www.eichenzell.de/de/impressum/'
              target={'_blank'}
              style={{ color: colors.text, textDecoration: 'none' }}
            >
              Impressum
            </Link>
            <Link
              to='//www.eichenzell.de/de/datenschutz/'
              target={'_blank'}
              style={{ color: colors.text, textDecoration: 'none' }}
            >
              Datenschutzerklärung
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
