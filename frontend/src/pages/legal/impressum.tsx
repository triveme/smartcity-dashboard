import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import colors from "theme/colors";
import borderRadius from "theme/border-radius";
import { WidgetCard } from "components/elements/widget-card";
import { DashboardWrapper } from "components/elements/dashboard-wrapper";

export function Impressum() {
  return (
    <DashboardWrapper>
      <WidgetCard>
        <Box>
          <Typography variant="h2" noWrap marginBottom={1}>
            Impressum
          </Typography>
        </Box>
        <Paper
          style={{
            height: "100%",
            padding: 10,
            borderRadius: borderRadius.componentRadius,
            backgroundColor: colors.panelBackground,
          }}
          elevation={0}
        >
          <Typography marginBottom={0} variant="h3">
            KielRegion GmbH
          </Typography>
          <p>
            Neufeldtstraße 6 <br />
            Wissenschaftspark Kiel <br />
            24118 Kiel <br />
          </p>

          <p>
            Telefon: 0431 – 53 03 55 0 <br />
            Fax: 0431 – 53 03 55 29
            <br />
            Mail: info@kielregion.de <br />
          </p>

          <p>
            HRB 10353 KI, Amtsgericht Kiel
            <br />
            Geschäftsführung und inhaltlich verantwortlich:
            <br />
            Ulrike Schrabback-Wielatt
          </p>
          <br />
          <Typography marginBottom={0} variant="h3">
            Bildquellen
          </Typography>
          <p>EDAG</p>
          <br />
          <Typography marginBottom={0} variant="h3">
            Textquellen
          </Typography>
          <p>
            Leon Jamaer
            <br />
            Die KielRegion GmbH übernimmt keine Haftung für die Inhalte externer
            Links. Verantwortlich für den Inhalt verlinkter Seiten sind deren
            Betreiber.
          </p>
        </Paper>
      </WidgetCard>
    </DashboardWrapper>
  );
}
