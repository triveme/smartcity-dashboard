import * as React from "react";
import Box from "@mui/material/Box";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer, { DrawerProps } from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem, { listItemClasses } from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import { Link, useLocation } from "react-router-dom";

import { DashboardComponent } from "./dashboard";
import { initialDashboard } from "./architectureConfig/initial-components";
import { useAuthContext } from "context/auth-provider";

import { DashboardDialog } from "components/architectureConfig/dashboard-dialog";
import { ArchitectureEditButtons } from "components/architectureConfig/architecture-edit-buttons";
import { DashboardIcon } from "components/architectureConfig/dashboard-icons";

import colors from "theme/colors";
import logoSmall from "assets/logo_small.svg";
import logoTextOnly from "assets/logo.svg";
import borderRadius from "theme/border-radius";
import {
  BUTTON_TEXTS,
  DRAWER_TITLE,
  INFORMATION_PAGE_TITLE,
} from "constants/text";

const drawerWidth = 240;

const styleList = {
  backgroundColor: colors.drawerBackground,
  padding: " 10px 10px 10px 3px",
  [`& .${listItemClasses.root}`]: {
    borderRadius: `${borderRadius.fragmentRadius}px`,
    margin: "4px",
  },
} as const;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 1),
  backgroundColor: colors.menuBarBackground,
  paddingLeft: "24px",
  paddingRight: "12px",
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const MiniVariantDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

type SideMenueProps = {
  dashboards: DashboardComponent[];
  handleDrawerClose: VoidFunction;
  editMode: boolean;
};

export function SideMenue(props: DrawerProps & SideMenueProps) {
  const { variant, open, dashboards, handleDrawerClose, editMode } = props;
  const location = useLocation();
  const theme = useTheme();
  const matchesDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  const [dashboardCreatorOpen, setDashboardCreatorOpen] = React.useState(false);
  const { authContext } = useAuthContext();

  const handleDashboardCreatorClickOpen = () => {
    setDashboardCreatorOpen(true);
  };

  const handleDashboardCreatorClose = () => {
    setDashboardCreatorOpen(false);
  };

  return (
    <>
      {matchesDesktop ? (
        <MiniVariantDrawer variant={variant} open={open}>
          <DrawerHeader>
            <Typography noWrap variant="h2">
              {DRAWER_TITLE}
            </Typography>
            <IconButton
              onClick={() => {
                handleDrawerClose();
              }}
            >
              {theme.direction === "rtl" ? (
                <ChevronRightIcon style={{ color: colors.white }} />
              ) : (
                <ChevronLeftIcon style={{ color: colors.white }} />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List sx={styleList}>
            {dashboards.map((dashboard) =>
              !editMode &&
              !dashboard.visible &&
              authContext.authToken ? null : (
                <ListItem
                  button
                  key={"listItem-" + dashboard.url}
                  component={Link}
                  to={dashboard.url}
                  style={
                    "/" + dashboard.url === location.pathname
                      ? {
                          backgroundColor: colors.selectedDashboard,
                        }
                      : {}
                  }
                >
                  <ListItemIcon style={{ minWidth: 50 }}>
                    {dashboard.icon ? (
                      <DashboardIcon
                        icon={dashboard.icon}
                        color={
                          !dashboard.visible && authContext.authToken
                            ? colors.invisibleDashboardColor
                            : colors.white
                        }
                      />
                    ) : (
                      <ChevronRightIcon
                        sx={{
                          color:
                            !dashboard.visible && authContext.authToken
                              ? colors.invisibleDashboardColor
                              : colors.white,
                        }}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={dashboard.name}
                    sx={{
                      color:
                        !dashboard.visible && authContext.authToken
                          ? colors.invisibleDashboardColor
                          : colors.white,
                      marginTop: 0,
                      marginBottom: 0,
                    }}
                  />
                  <Box
                    bgcolor={() => {
                      if ("/" + dashboard.url === location.pathname) {
                        return colors.selectedDashboardTransparent;
                      }
                      if (!dashboard.visible && authContext.authToken) {
                        return colors.drawerBackgroundTransparent;
                      } else {
                        return colors.drawerBackgroundTransparent;
                      }
                    }}
                    borderRadius={3}
                  >
                    <ArchitectureEditButtons
                      type="Dashboard"
                      component={dashboard}
                      parents={[]}
                      editMode={editMode}
                    />
                  </Box>
                </ListItem>
              )
            )}
            {authContext.authToken && editMode ? (
              <>
                <ListItem
                  button
                  onClick={handleDashboardCreatorClickOpen}
                  style={{
                    backgroundColor: colors.edit,
                    marginBottom: 2,
                    margin: 3,
                    marginTop: 5,
                  }}
                >
                  <ListItemIcon style={{ minWidth: 50 }}>
                    <AddIcon
                      style={{ color: colors.white, fontSize: "1.25rem" }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={BUTTON_TEXTS.ADD_DASHBOARD}
                    style={{
                      color: colors.white,
                      marginTop: 0,
                      marginBottom: 0,
                    }}
                  />
                </ListItem>
                <DashboardDialog
                  open={dashboardCreatorOpen}
                  onClose={handleDashboardCreatorClose}
                  editMode={false}
                  dashboard={initialDashboard}
                />
              </>
            ) : null}
          </List>
          <Box
            display="flex"
            justifyContent={open ? "start" : "center"}
            marginLeft={open ? "29px" : 0}
            marginTop="auto"
            marginBottom={2}
          >
            <img
              src={open ? logoTextOnly : logoSmall}
              alt="Smart City Logo"
              width={open ? "80%" : "50%"}
            />
          </Box>

          <Link to="/information" style={{ color: colors.inputFieldOutline }}>
            <Typography
              marginLeft={open ? "26px" : 0}
              marginBottom={3}
              fontSize={14}
              textAlign={open ? "start" : "center"}
            >
              {open ? "Informationen" : "Info"}
            </Typography>
          </Link>
        </MiniVariantDrawer>
      ) : (
        <Drawer
          variant="temporary"
          open={open}
          onClose={handleDrawerClose}
          hideBackdrop={matchesDesktop}
          onClick={handleDrawerClose}
          onKeyDown={handleDrawerClose}
        >
          <Box
            sx={{
              width: drawerWidth,
              display: { xs: "block", sm: "none" },
            }}
            role="presentation"
          >
            <List
              sx={styleList}
              style={{
                paddingTop: "62px",
                padding: " 62px 10px 10px 3px",
                backgroundColor: colors.drawerBackground,
              }}
            >
              {dashboards.map((dashboard) =>
                !editMode &&
                !dashboard.visible &&
                authContext.authToken ? null : (
                  <ListItem
                    button
                    key={"listItem-" + dashboard.url}
                    component={Link}
                    to={dashboard.url}
                    style={
                      "/" + dashboard.url === location.pathname
                        ? {
                            backgroundColor: colors.selectedDashboard,
                          }
                        : {}
                    }
                  >
                    <ListItemIcon>
                      {dashboard.icon ? (
                        <DashboardIcon
                          icon={dashboard.icon}
                          color={
                            !dashboard.visible && authContext.authToken
                              ? colors.invisibleDashboardColor
                              : colors.white
                          }
                        />
                      ) : (
                        <ChevronRightIcon
                          sx={{
                            color:
                              !dashboard.visible && authContext.authToken
                                ? colors.invisibleDashboardColor
                                : colors.white,
                          }}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={dashboard.name}
                      style={{
                        color:
                          !dashboard.visible && authContext.authToken
                            ? colors.invisibleDashboardColor
                            : colors.white,
                        marginTop: 0,
                        marginBottom: 0,
                      }}
                    />
                  </ListItem>
                )
              )}
            </List>
          </Box>
          <Box
            display="flex"
            justifyContent="center"
            margin={3}
            marginTop="auto"
            marginBottom={2}
          >
            <img src={logoTextOnly} alt="Smart City Dashbaord Logo" />
          </Box>

          <Link to="/information" style={{ color: colors.inputFieldOutline }}>
            <Typography marginLeft={3.75} marginBottom={3} fontSize={14}>
              {INFORMATION_PAGE_TITLE}
            </Typography>
          </Link>
        </Drawer>
      )}
    </>
  );
}
