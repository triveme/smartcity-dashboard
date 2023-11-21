import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from 'react-oidc-context'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import smartCityLogo from 'assets/logos/logo_untereinander.svg'
import loginBackground from 'assets/images/background.png'
import colors from 'theme/colors'
import borderRadius from 'theme/border-radius'

import { LOGIN_TITLE } from 'constants/text'

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  if (auth.isAuthenticated) {
    navigate('/', { replace: true })
  }

  if (auth.error) {
    console.error('Login fehlgeschlagen: ', auth.error.message)
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
          backgroundColor: colors.backgroundColor,
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
              backgroundColor: colors.backgroundColor,
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
          <Button variant='contained' onClick={() => auth.signinRedirect()} disabled={auth.isLoading}>
            Keycloak
          </Button>
          <Box paddingTop={2} width='100%' fontSize='10px' display='flex' justifyContent='space-evenly'>
            <Link
              to='//www.wuppertal.de/service/impressum.php'
              target={'_blank'}
              style={{ color: colors.text, textDecoration: 'none' }}
            >
              Impressum
            </Link>
            <Link
              to='//www.wuppertal.de/service/datenschutz_dsgvo.php'
              target={'_blank'}
              style={{ color: colors.text, textDecoration: 'none' }}
            >
              Datenschutzerklärung
            </Link>
            <Link to='/information' style={{ color: colors.text, textDecoration: 'none' }}>
              Informationen
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}
