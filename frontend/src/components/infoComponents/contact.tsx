import { Box, Grid, Typography } from '@mui/material'
import ContactPicture from 'assets/images/infobild.jpg'
import borderRadius from 'theme/border-radius'
import colors from 'theme/colors'

type ContactProps = {
  name: string
}

export function Contact(props: ContactProps) {
  const { name } = props

  return (
    <Grid container direction='row' spacing={1.5}>
      <Grid item xl={3} xs={12}>
        <img src={ContactPicture} width={'100%'} alt='Contact' style={{ borderRadius: borderRadius.componentRadius }} />
      </Grid>
      <Grid item xl={9} xs={12}>
        <Typography variant='h3' marginTop={2} marginBottom={1}>
          {name}
        </Typography>
        <Box sx={{ fontSize: '12px', lineHeight: 2, color: colors.textDark }}>
          Competence Center Smart City <br />
          <table style={{ borderSpacing: 0 }}>
            <tbody>
              <tr>
                <td>Telefon:</td>
                <td>0202/563-5877 </td>
              </tr>
              <tr>
                <td>Email:</td>
                <td>
                  <a href='mailto:smart@stadt.wuppertal.de' style={{ color: colors.iconColor }}>
                    smart@stadt.wuppertal.de
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </Box>
      </Grid>
    </Grid>
  )
}
