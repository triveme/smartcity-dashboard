import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import colors from "theme/colors";

export function Spinner() {
  return (
    <Box
      display="flex"
      width="100%"
      height="100%"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
    >
      <CircularProgress
        size={60}
        style={{ color: colors.edit, marginBottom: 5 }}
      />
      <Typography color={colors.text}>lädt..</Typography>
    </Box>
  );
}
