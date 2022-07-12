import {
  Button,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import smartCityImage from "assets/edag_smart_city.jpg";
import smartCityImageFullWidth from "assets/edagSmartCityFullWidth.jpg";
import borderRadius from "theme/border-radius";
import colors from "theme/colors";

function Row() {
  const theme = useTheme();
  const matchesDesktop = useMediaQuery(theme.breakpoints.up("xl"));

  return (
    <Grid container direction="row" spacing={1.5}>
      <Grid item xs={12}>
        <Button
          onClick={() => {}}
          style={{
            border: 0,
            backgroundColor: colors.attributeColors[0],
            color: colors.panelBackground,
            fontWeight: "bold",
            fontSize: 16,
            width: "100%",
            height: matchesDesktop ? 120 : 60,
            textTransform: "none",
            textAlign: "center",
          }}
          href=" https://smartcity.edag.com/referenzen/smart-city-dashboard"
        >
          Zur Webseite EDAG Smart City Dashboard
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h3" marginTop={2} marginBottom={0.75}>
          EDAG ENGINEERING GMBH
        </Typography>
        <Box sx={{ fontSize: "12px", lineHeight: 2, color: colors.textDark }}>
          Reesbergstraße 1 <br />
          36039 Fulda <br />
          Deutschland
        </Box>
      </Grid>
    </Grid>
  );
}

export function About() {
  const theme = useTheme();
  const matchesDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  return (
    <div>
      <Grid container spacing={matchesDesktop ? 7 : 3}>
        <Grid item xs={12} md={12} lg={3}>
          <img
            src={matchesDesktop ? smartCityImage : smartCityImageFullWidth}
            width={"100%"}
            alt="woman in front of smart city bot"
            style={{ borderRadius: borderRadius.fragmentRadius }}
          />
        </Grid>
        <Grid item md={12} lg={9} xl={6}>
          <Typography marginBottom={0} variant="h3">
            Inhalt und Ziele des Open Source Projekts „Smart City Dashboard für
            FIWARE basierte urban data platformen“
          </Typography>
          <p>
            Dieser Prototyp eines Smart City Dashboards dient zur Visualisierung
            von Daten aus einer FIWARE basierten Urban Data Platform. Durch die
            Bereitstellung der Daten, insbesondere in Form von Charts, können
            Bürger:innen und Interessent:innen ein Überblick über den aktuellen
            Sachverhalt in der Stadt gegeben werden.
          </p>

          <p>
            Welche Daten wie visualisiert werden sollen kann dabei von den
            Betreibern im Livebetrieb und ohne zusätzlichen Programmieraufwand
            angepasst werden (no code Umgebung). Das ist möglich, indem Sie sich
            als Administrator anmelden und über einen integrierten Wizard die
            gewünschte Konfiguration vornehmen. Folglich können neu in die Open
            Data Plattform hinzugefügte Daten durch minimale Anpassungen direkt
            der Öffentlichkeit zugänglich gemacht werden. Die Daten liegen also
            nicht nur in der Plattform ab, sondern bieten allen Einwohner:innen
            der Stadt einen direkten Mehrwert. Zusätzlich können „unsichtbare“
            Menüpunkte/Dashboards erzeugt werden, um Daten nur für interne
            Zwecke aufzubereiten.
          </p>

          <p>
            Zudem stellt die entwickelten Lösungen höchste Ansprüche an die
            IT-Sicherheit (z. B. im Vergleich zu Grafana) und Performance (durch
            die vor Verarbeitung der Daten durch zusätzliche Backend-Services).
          </p>

          <p>
            Die technische Umsetzung wurde durch die EDAG Group realisiert und
            als Public-Money-Public-Code-Projekt gestartet. Auftraggeber bisher:
            Stadt Paderborn. Unser Ziel ist es, diese hier dargestellte,
            städteneutrale Ausgangsbasis durch weitere öffentliche Projekte
            weiterzuentwickeln, um so allen nutzenden Städten eine günstige
            Weiterentwicklung und Wartung zu ermöglichen.
          </p>
          <br />
        </Grid>
        <Grid item xs={12} md={12} lg={12} xl={3}>
          <Row />
        </Grid>
      </Grid>
    </div>
  );
}
