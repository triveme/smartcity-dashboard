import { PaletteMode } from "@mui/material";
import { createTheme } from "@mui/system";
import borderRadius from "./border-radius";
import colors from "./colors";

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? {
          // palette values for light mode
        }
      : {
          // palette values for dark mode
          primary: {
            main: colors.edit,
            light: colors.white,
            dark: colors.textDark,
          },
          secondary: {
            light: colors.white,
            main: colors.white,
          },
          background: {
            default: colors.backgroundColor,
            paper: colors.panelBackground,
          },
          text: {
            primary: colors.white,
            secondary: colors.text,
          },
        }),
  },
  typography: {
    fontFamily: ["Lato", "Helvetica", "Arial", "sans-serif"].join(","),
  },
  shape: {
    borderRadius: borderRadius.fragmentRadius,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        p: {
          ...(mode === "light" ? {} : { color: colors.textDark }),
          fontSize: "0.85em",
          lineHeight: "2.25",
          marginBottom: "25px",
        },
        "& .MuiList-root": {
          ...(mode === "light"
            ? {}
            : {
                backgroundColor: colors.backgroundColor,
              }),
        },
        "& .MuiList-root &$selected": {
          ...(mode === "light"
            ? {}
            : {
                backgroundColor: colors.white,
              }),
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          ...(mode === "light" ? {} : { background: colors.drawerBackground }),
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        //DashboardTitle + LoginPage-Title
        h1: {
          fontSize: "1.5rem",
          fontWeight: 600,
          marginBottom: "1rem",
        },
        //DrawerHeader + WidgetTitle
        h2: {
          fontSize: "1.25rem",
          fontWeight: 600,
          lineHeight: 1.6,
        },
        //PanelTitle
        h3: {
          fontSize: "1rem",
          fontWeight: 700,
          lineHeight: 1.5,
        },
        //Description Text
        body2: {
          color: colors.textDark,
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    ...{ primary: colors.edit },
  },
});

export default darkTheme;
