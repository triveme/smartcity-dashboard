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
          <p>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
            nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam
            erat, sed diam voluptua. At vero eos et accusam et justo duo dolores
            et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est
            Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
            sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore
            et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
            accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren,
            no sea takimata sanctus est Lorem ipsum dolor sit amet.
          </p>
        </Paper>
      </WidgetCard>
    </DashboardWrapper>
  );
}
