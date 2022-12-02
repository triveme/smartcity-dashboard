import { useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import useMediaQuery from "@mui/material/useMediaQuery";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Switch, Route, Redirect } from "react-router-dom";

import colors from "theme/colors";
import kielRegionDashboardLogo from "assets/kielRegionDashboardLogo.png";

import { Spinner } from "components/elements/spinner";

import { useArchitectureContext } from "context/architecture-provider";
import { useAuthContext } from "context/auth-provider";

import { SideMenue } from "components/drawer";
import { Dashboard, DashboardComponent } from "components/dashboard";
import { Settings } from "components/settings";
import { ArchitectureActionButtons } from "components/architectureConfig/architecture-action-buttons";
import { Information } from "./information-page";
import { Impressum } from "./legal/impressum";
import { PrivacyPolicy } from "./legal/privacy-policy";
import { TermsOfUse } from "./legal/terms-of-use";
import { Stack } from "@mui/material";

const drawerWidth = 240;

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  background: colors.menuBarBackground,
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

type DashboardsPageProps = {
  loggedIn: boolean;
  editMode: boolean;
  setEditMode: (input: boolean) => void;
  setLoggedIn: (input: boolean) => void;
};

export function DashboardsPage(props: DashboardsPageProps) {
  const { loggedIn, editMode, setEditMode, setLoggedIn } = props;
  const theme = useTheme();
  const matchesDesktop = useMediaQuery(theme.breakpoints.up("sm"));
  const [open, setOpen] = useState(window.innerWidth > 768 ? true : false);
  const [dashboardSavedToggle, setDashboardSavedToggle] = useState(false);

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleSwitchChange = () => {
    setEditMode(!editMode);
  };

  const handleDashboardSaved = () => {
    setDashboardSavedToggle(!dashboardSavedToggle);
  };

  const { authContext } = useAuthContext();

  const { architectureContext } = useArchitectureContext();
  let { currentArchitectureContext } = architectureContext;

  if (!currentArchitectureContext) {
    currentArchitectureContext = [];
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar position="fixed" open={open && matchesDesktop} theme={theme}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            edge="start"
            sx={{
              marginRight: "36px",
              ...(open && matchesDesktop && { display: "none" }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Stack
            direction="row"
            spacing={6}
            sx={{ marginTop: "6px", flexGrow: 1 }}
          >
            <Box
              sx={{
                marginTop: "2px",
                marginBottom: "0px",
              }}
            >
              <img
                height="50px"
                src={kielRegionDashboardLogo}
                alt="logo smart city"
              />
            </Box>
          </Stack>

          {authContext.authToken ? (
            <>
              {matchesDesktop ? (
                <ArchitectureActionButtons
                  onSavedDashboard={handleDashboardSaved}
                />
              ) : null}
              <Settings
                setLoggedIn={setLoggedIn}
                setEditMode={setEditMode}
                switchChecked={editMode}
                handleSwitchChange={handleSwitchChange}
              />
            </>
          ) : null}
        </Toolbar>
      </AppBar>
      <SideMenue
        variant="permanent"
        open={open}
        dashboards={currentArchitectureContext}
        handleDrawerClose={handleDrawerClose}
        editMode={editMode}
      />
      <Box
        component="main"
        padding="20px"
        style={{
          width: matchesDesktop
            ? `calc(100% - ${open ? "240px" : "0px"})`
            : "100%",
        }}
      >
        {matchesDesktop ? <DrawerHeader /> : null}
        <Switch>
          <Route exact path={"/impressum"}>
            <Impressum />
          </Route>
          <Route exact path={"/datenschutzerklaerung"}>
            {" "}
            <PrivacyPolicy />
          </Route>
          <Route exact path={"/nutzungsbedingungen"}>
            {" "}
            <TermsOfUse />
          </Route>
          <Route exact path={"/information"}>
            <Information />
          </Route>
          {currentArchitectureContext.map((dashboard: DashboardComponent) => (
            <Route
              key={"route-" + dashboard.url}
              exact
              path={"/" + dashboard.url}
            >
              <Dashboard
                dashboardSaved={dashboardSavedToggle}
                loggedIn={loggedIn}
                editMode={editMode}
                dashboard={dashboard}
              />
            </Route>
          ))}
          <Route path="*">
            {currentArchitectureContext.length > 0 ? (
              <Redirect to={"/" + currentArchitectureContext[0].url} />
            ) : architectureContext.isLoading ? (
              <Spinner />
            ) : (
              <p>Es können keine Dashboards abgerufen werden.</p>
            )}
          </Route>
        </Switch>
      </Box>
    </Box>
  );
}
