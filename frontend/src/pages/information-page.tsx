import { Box, Grid } from '@mui/material'
import { DashboardWrapper } from 'components/elements/dashboard-wrapper'
import { InfoWidget } from 'components/infoComponents/info-widget'
import { Link } from 'react-router-dom'
import colors from 'theme/colors'

export function Information() {
  return (
    <DashboardWrapper>
      <InfoWidget title='Smart City Wuppertal' panelTitle='vernetzt.digital.lebenswert.' />
      <InfoWidget contact title='Kontakt' panelTitle='Ihr direkter Smart City Kontakt' />

      <Grid container spacing={1} justifyContent='center'>
        <Grid item xs={12} md={3} margin={0}>
          <Link
            to='/impressum'
            style={{
              color: colors.text,
              textDecoration: 'none',
              fontSize: 12,
            }}
          >
            <Box display='flex' justifyContent={'center'}>
              Impressum
            </Box>
          </Link>
        </Grid>
        <Grid item xs={12} md={3} margin={0}>
          <Link
            to='/datenschutzerklaerung'
            style={{
              color: colors.text,
              textDecoration: 'none',
              fontSize: 12,
            }}
          >
            <Box display='flex' justifyContent={'center'}>
              Datenschutzerklärung
            </Box>
          </Link>
        </Grid>
        <Grid item xs={12} md={3} margin={0}>
          <Link to='/nutzungsbedingungen' style={{ color: colors.text, textDecoration: 'none', fontSize: 12 }}>
            <Box display='flex' justifyContent={'center'}>
              Nutzungsbedingungen
            </Box>
          </Link>
        </Grid>
      </Grid>
    </DashboardWrapper>
  )
}
