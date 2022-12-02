import {
  Button,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Box } from "@mui/system";
import smartCityImage from "assets/SmartCityDashboard_SmallWidth.png";
import smartCityImageFullWidth from "assets/SmartCityDashboard.png";
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
          href=" https://mobility.kielregion.de"
        >
          Zur Themenseite Digitale Mobilität der KielRegion
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h3" marginTop={2} marginBottom={0.75}>
          KielRegion GmbH
        </Typography>
        <Box sx={{ fontSize: "12px", lineHeight: 2, color: colors.textDark }}>
          Neufeldstraße 6 <br />
          24118 Kiel
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
            Inhalte und Ziele des Projektes{" "}
            <strong>KielRegion Dashboard</strong>
          </Typography>
          <p>
            Das KielRegion Dashboard visualisiert die Daten verschiedener
            Sensoren aus den Bereichen Mobilität und Umwelt in der KielRegion.
            Dafür greift das Dashboard auf die FIWARE Datenplattform der
            KielRegion zu und nutzen dessen Context Broker und Quantum Leap
            Datenbank, um etwa Verkehrszählungen oder Schadstoffwerte in
            Echtzeit darzustellen. Das Dashboard gibt somit einen Überblick über
            den aktuellen Sachverhalt und Zustand in der Stadt sowie Region.
          </p>

          <p>
            Das Abfragen und Visualisieren von Daten ist aufgrund einer
            benutzerfreundlichen No-Code-Umgebung ohne zusätzlichen
            Programmieraufwand möglich. Fachplaner und Expert/-innen der
            Themenbereiche haben somit die Möglichkeit eigene Visualisierungen
            zu konfigurieren. Folglich können auch neu in die Datenplattform
            hinzugefügte Datenquellen durch minimale Anpassungen direkt der
            Öffentlichkeit zugänglich gemacht werden. Die Daten liegen also
            nicht nur in der Plattform ab, sondern bieten allen Menschen in der
            KielRegion einen Mehrwert. Zusätzlich können „unsichtbare“
            Menüpunkte/Dashboards erzeugt werden, um Daten nur für interne
            Zwecke aufzubereiten.
          </p>

          <p>
            Die technische Umsetzung wurde durch die EDAG Group realisiert und
            als Public-Money-Public-Code-Projekt gestartet: „Auftraggeber ist
            die KielRegion. Unser Ziel ist es, diese hier dargestellte,
            städteneutrale Ausgangsbasis durch weitere öffentliche Projekte
            weiterzuentwickeln, um so allen nutzenden Städten eine günstige
            Weiterentwicklung und Wartung zu ermöglichen.“
          </p>

          <p>
            Das Projekt wird in einem eigenen Repository (GitLab) veröffentlicht
            und soll kooperativ und von der Community moderiert weiterentwickelt
            werden.
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
