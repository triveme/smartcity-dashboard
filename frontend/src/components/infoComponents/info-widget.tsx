import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";

import colors from "theme/colors";
import borderRadius from "theme/border-radius";
import { Contact } from "./contact";
import { Grid, useMediaQuery, useTheme } from "@mui/material";
import { About } from "./about";
import { WidgetCard } from "components/elements/widget-card";

type InfoWidgetProps = {
  title: string;
  panelTitle: string;
  contact?: boolean;
};

export function InfoWidget(props: InfoWidgetProps) {
  const theme = useTheme();
  const matchesDesktop = useMediaQuery(theme.breakpoints.up("sm"));
  const { title, contact, panelTitle } = props;
  return (
    <WidgetCard>
      <Box>
        <Typography variant="h2" noWrap marginBottom={2}>
          <Box display="flex" alignItems="center">
            <InfoIcon style={{ color: colors.grayed, marginRight: 10 }} />
            {title}
          </Box>
        </Typography>
      </Box>
      <Paper
        style={{
          height: "100%",
          padding: 20,
          paddingRight: matchesDesktop ? 40 : 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: borderRadius.componentRadius,
          backgroundColor: colors.panelBackground,
        }}
        elevation={0}
      >
        {" "}
        <Typography variant="h3" noWrap component="div" marginBottom={2}>
          {panelTitle}
        </Typography>
        {contact ? (
          <div>
            <Grid container spacing={7}>
              <Grid item xs={12} md={6} lg={4} xl={3}>
                <Contact name="Alexander Süssemilch" />
              </Grid>
            </Grid>
          </div>
        ) : (
          <About />
        )}
      </Paper>
    </WidgetCard>
  );
}
