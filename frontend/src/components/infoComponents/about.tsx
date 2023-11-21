import { Button, Grid, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Box } from '@mui/system'
import smartCityImage from 'assets/edag_smart_city.jpg'
import fundingImage from 'assets/logos/wup_foerder_logo.svg'
import smartCityImageFullWidth from 'assets/edagSmartCityFullWidth.jpg'
import borderRadius from 'theme/border-radius'
import colors from 'theme/colors'

function Row() {
  const theme = useTheme()
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('xl'))

  return (
    <Grid container direction='row' spacing={1.5}>
      <Grid item xs={12}>
        <Typography variant='h3' marginTop={2} marginBottom={0.75}>
          GEFÖRDERT DURCH
        </Typography>
        <Box
          style={{
            borderRadius: borderRadius.fragmentRadius,
            backgroundColor: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: matchesDesktop ? 120 : 60,
          }}
        >
          <img src={fundingImage} width={'90%'} height={'90%'} alt='Gefördert durch KFW' />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h3' marginTop={2} marginBottom={0.75}>
          IN ZUSAMMENARBEIT MIT
        </Typography>
        <Button
          onClick={() => {}}
          style={{
            border: 0,
            backgroundColor: colors.attributeColors[0],
            color: colors.panelBackground,
            fontWeight: 'bold',
            fontSize: 16,
            width: '100%',
            height: matchesDesktop ? 120 : 60,
            textTransform: 'none',
            textAlign: 'center',
          }}
          href=' https://smartcity.edag.com/referenzen/smart-city-dashboard'
        >
          EDAG Smart City Dashboard
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography variant='h3' marginTop={2} marginBottom={0.75}>
          EDAG ENGINEERING GMBH
        </Typography>
        <Box sx={{ fontSize: '12px', lineHeight: 2, color: colors.textDark }}>
          Reesbergstraße 1 <br />
          36039 Fulda <br />
          Deutschland
        </Box>
      </Grid>
    </Grid>
  )
}

export function About() {
  const theme = useTheme()
  const matchesDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  return (
    <div>
      <Grid container spacing={matchesDesktop ? 7 : 3}>
        <Grid item xs={12} md={12} lg={3}>
          <img
            src={matchesDesktop ? smartCityImage : smartCityImageFullWidth}
            width={'100%'}
            alt='woman in front of smart city bot'
            style={{ borderRadius: borderRadius.fragmentRadius }}
          />
        </Grid>
        <Grid item md={12} lg={9} xl={6}>
          <p>
            Wuppertal ist eine von 73 Modellprojekten für „Smart Cities made in Germany“, ein vom Bundesministerium für
            Wohnen, Stadtentwicklung und Bauwesen gefördertes Digitalisierungsprogramm. Der Startschuss für das Projekt
            fiel im März 2022. Mittlerweile wurde eine umfangreiche Smart City Strategie verfasst und erste Projekte
            daraus umgesetzt. Eines dieser Projekte ist das Dashboard „DigiTal Daten“, welches Bürgerinnen und Bürgern
            individuellen Zugriff auf umfangreiche Daten ihrer Stadt geben soll.
          </p>
          <Typography marginBottom={0} variant='h3'>
            DigiTal Daten - das Dashboard für Informationen rund um Wuppertal
          </Typography>

          <p>
            Auf dem Dashboard können in Echtzeit* Daten und Zahlen aus der Stadt, wie zum Beispiel die aktuelle
            Besucherauslastung der Schwimmbäder oder der Pegelstand der Wupper, übersichtlich auf einer digitalen
            Plattform abgerufen werden. Die Daten werden von verschiedenen städtischen Ressorts und Wuppertaler
            Unternehmen aufgenommen und an dieser Stelle zusammengetragen. Neben verschiedenen Livedaten* gibt es auch
            Informationen zu interessanten Orten und Veranstaltungen in der Stadt sowie einen Überblick über die
            städtischen Mobilitätsangebote wie E-Ladesäulen oder Schwebebahnhaltestellen.
          </p>
          <p>*Daten werden in Abständen von ca. 5 Minuten aktualisiert</p>
          <Typography marginBottom={0} variant='h3'>
            Competence Center Smart City Wuppertal
          </Typography>

          <p>
            Möglichmacher, Unterstützer, Vernetzter – das Competence Center Smart City Wuppertal steuert den
            Gesamtprozess des Modellprojekts. Es ist die Organisationseinheit für alle Themen rund um die Smart City
            Wuppertal. Als Ansprechpartner und Kontaktpunkt koordiniert das Competence Center alle Smart City
            Aktivitäten in der Stadt, bündelt Kompetenzen und baut Brücken zwischen Projekten, Ideen und Akteuren. Mit
            kleinen und großen Projekten setzt es die Idee einer Smart City Wuppertal in die Realität um.
          </p>

          <p>
            Mehr zum Modellprojekt Smart City Wuppertal unter
            <a href='www.smart.wuppertal.de'>www.smart.wuppertal.de</a>
            <br />
            Instagram <a href='https://www.instagram.com/smart.wuppertal/?hl=de'>smart.wuppertal</a>
            <br />
            Facebook <a href='https://www.facebook.com/smart.wuppertal/'>Smart City Wuppertal</a>
          </p>
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={3}>
          <Row />
        </Grid>
      </Grid>
    </div>
  )
}
