import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import InfoIcon from '@mui/icons-material/Info'

import colors from 'theme/colors'
import borderRadius from 'theme/border-radius'
import { Contact } from './contact'
import { Grid, useMediaQuery, useTheme } from '@mui/material'
import { About } from './about'
import { WidgetCard } from 'components/elements/widget-card'

type InfoWidgetProps = {
  title: string
  panelTitle: string
  contact?: boolean
}

export function InfoWidget(props: InfoWidgetProps) {
  const theme = useTheme()
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('sm'))
  const { title, contact, panelTitle } = props
  return (
    <WidgetCard>
      <Box sx={{ ml: 1, mt: 2 }}>
        <Typography variant='h2' noWrap>
          <Box display='flex' alignItems='center'>
            <InfoIcon style={{ color: colors.iconColor, marginRight: 10 }} />
            {title}
          </Box>
        </Typography>
      </Box>
      <Paper
        style={{
          height: '100%',
          padding: 20,
          paddingRight: matchesDesktop ? 40 : 20,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: borderRadius.componentRadius,
          backgroundColor: colors.panelBackground,
        }}
        elevation={0}
      >
        {' '}
        <Typography variant='h3' noWrap component='div' marginBottom={2}>
          {panelTitle}
        </Typography>
        {contact ? (
          <div>
            <Grid container spacing={7}>
              <Grid item xs={12} md={12} lg={12} xl={12}>
                <Contact name='Stadt Wuppertal' />
              </Grid>
            </Grid>
          </div>
        ) : (
          <About />
        )}
      </Paper>
    </WidgetCard>
  )
}
