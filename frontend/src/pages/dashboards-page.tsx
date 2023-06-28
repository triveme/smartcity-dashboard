import { useState } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

import { Routes, Route, Navigate } from "react-router-dom";

import smartCityLogo from "assets/logos/logo_wuppertal.svg";
// import smartCityLogo from "assets/smartCityLogo.svg";

import { Spinner } from "components/elements/spinner";

import { useArchitectureContext } from "context/architecture-provider";
import { useStateContext } from "../providers/state-provider";

import { SideMenue } from "components/drawer";
import { Dashboard, DashboardComponent } from "components/dashboard";
import { Settings } from "components/settings";
import { ArchitectureActionButtons } from "components/architectureConfig/architecture-action-buttons";
import { Information } from "./information-page";
import { Impressum } from "./legal/impressum";
import { PrivacyPolicy } from "./legal/privacy-policy";
import { TermsOfUse } from "./legal/terms-of-use";
import { AppBar, DrawerHeader } from "./app-bar";

interface DashboardsPageProps {
  loggedIn: boolean;
  editMode: boolean;
  setEditMode: (input: boolean) => void;
  setLoggedIn: (input: boolean) => void;
};

export function DashboardsPage(props: DashboardsPageProps) {
  const { loggedIn, editMode, setEditMode, setLoggedIn } = props;
  const theme = useTheme();
  const matchesDesktop = useMediaQuery(theme.breakpoints.up("sm"));
  const [open, setOpen] = useState(matchesDesktop);
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

  const { stateContext } = useStateContext();

  const { architectureContext } = useArchitectureContext();
  let { currentArchitectureContext } = architectureContext;

  currentArchitectureContext = architectureContext.currentArchitectureContext || [];

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
          <Box sx={{ flexGrow: 1, marginTop: "0px", marginBottom: "2px" }}>
            <img height="42px" src={smartCityLogo} alt="logo smart city" />
          </Box>
          {stateContext.authToken ? (
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
        style={{
          width: matchesDesktop
            ? `calc(100% - ${open ? "240px" : "0px"})`
            : "100%",
          height: "100vh"
        }}
      >
        {matchesDesktop ? <DrawerHeader /> : null}
        <Routes>
          <Route path={"/impressum"} element={
            <Impressum />
          }>
          </Route>
          <Route path={"/datenschutzerklaerung"} element={
            <PrivacyPolicy />
          }></Route>
          <Route path={"/nutzungsbedingungen"} element={
            <TermsOfUse />
          }></Route>
          <Route path={"/information"} element={
            <Information />
          }></Route>
          {currentArchitectureContext.map((dashboard: DashboardComponent) => (
            <Route
              key={"route-" + dashboard.url}
              path={"/" + dashboard.url}
              element={
                <Dashboard
                  dashboardSaved={dashboardSavedToggle}
                  loggedIn={loggedIn}
                  editMode={editMode}
                  dashboard={dashboard}
                />
              }></Route>
          ))}
          <Route path="*" element={
            currentArchitectureContext.length > 0 ? (
              <Navigate to={"/"+currentArchitectureContext[0].url} />
              // <Route render={() => <Redirect to={"/"+currentArchitectureContext[0].url} />} />
            ) : architectureContext.isLoading ? (
              <Spinner />
            ) : (
              <p>Es können keine Dashboards abgerufen werden.</p>
            )
          }></Route>
        </Routes>
      </Box>
    </Box>
  );
}
