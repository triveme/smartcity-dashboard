import { Box, Typography } from "@mui/material";
import { DashboardIcon } from "components/architectureConfig/dashboard-icons";
import colors from "theme/colors";

type InfoDisplayProps = {
  headline: string,
  value: string,
  icon?: string,
  iconColor?: string,
}

export function InfoDisplayComponent(props: InfoDisplayProps) {
  const { headline, icon, iconColor, value } = props;

  return(
    <Box
      display="flex"
      flexDirection="column"
    >
      <Typography color={colors.text}>{headline}</Typography>
      <Box
        display="flex"
        flexDirection="row"
      >
        {icon && iconColor ?(
          <DashboardIcon
            icon={icon}
            color={iconColor}
          />
        ) : null}
        <Typography>{value}</Typography>
      </Box>
    </Box>
  );
}