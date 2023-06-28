import { Box, Typography } from "@mui/material";
import { DashboardIcon } from "components/architectureConfig/dashboard-icons";
import colors from "theme/colors";

export function SliderHeader() {

  return(
    <Box
    display={"flex"}
    flexDirection={"row"}
    flexWrap={"nowrap"}
    justifyContent={"space-between"}
    paddingBottom={"5px"}
    >
      <Box>
        <Typography>
          Parkaus
        </Typography>
      </Box>
      <Box
        display={"flex"}
        flexDirection={"row"}
      >
        <DashboardIcon icon="IconPoint" color={colors.attributeColors[0]}></DashboardIcon>
        <Typography>
          Parkplätze Frei
        </Typography>
      </Box>
      <Box        
        display={"flex"}
        flexDirection={"row"}
      >
        <DashboardIcon icon="IconPoint" color={colors.attributeColors[1]}></DashboardIcon>
        <Typography>
          Parkplätze Gesamt
        </Typography>
      </Box>
    </Box>
  );
}