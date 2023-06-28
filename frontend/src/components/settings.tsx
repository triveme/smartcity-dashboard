import * as React from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import IconButton from "@mui/material/IconButton";
import PowerSettingsNewOutlinedIcon from "@mui/icons-material/PowerSettingsNewOutlined";
import {
  FormControlLabel,
  ListItemIcon,
  ListItemText,
  MenuList,
} from "@mui/material";

import { useStateContext } from "../providers/state-provider";
import { CustomSwitch } from "./elements/switch";
import { useArchitectureContext } from "context/architecture-provider";
import { getDashboardArchitecture } from "clients/architecture-client";
import { cloneDeep } from "lodash";
import borderRadius from "theme/border-radius";
import colors from "theme/colors";

type SettingsProps = {
  switchChecked: boolean;
  handleSwitchChange: VoidFunction;
  setEditMode: (input: boolean) => void;
  setLoggedIn: (input: boolean) => void;
};

export function Settings(props: SettingsProps) {
  const { switchChecked, handleSwitchChange, setEditMode, setLoggedIn } = props;
  const { stateContext, setStateContext } = useStateContext();
  const { setArchitectureContext } = useArchitectureContext();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    setStateContext({
      ...stateContext,
      authToken: null,
    });
    setEditMode(false);
    refreshDashboardData(false);
    handleSettingsClose();
    console.log("logged out");
  };

  const refreshDashboardData = (isAdmin: boolean) => {
    getDashboardArchitecture({
      dashboardUrl: "",
      isAdmin: isAdmin,
      queryEnabled: true,
    })
      .then((architectureData) => {
        setArchitectureContext({
          initialArchitectureContext: cloneDeep(architectureData),
          currentArchitectureContext: cloneDeep(architectureData),
          dashboardUrl: "",
          queryEnabled: true,
          isLoading: false,
        });
        setLoggedIn(false);
      })
      .catch((e) => {
        console.log(
          "Seitenaufbau konnte nicht abgerufen & aktualisiert werden."
        );
      });
  };

  return (
    <>
      <IconButton
        size="large"
        aria-label="settings"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleSettingsOpen}
        color="inherit"
      >
        <SettingsIcon />
      </IconButton>
      <Menu
        PaperProps={{
          style: {
            borderRadius: borderRadius.componentRadius,
          },
        }}
        id="menu-appbar"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleSettingsClose}
        sx={{
          [`& .MuiList-root`]: {
            backgroundColor: colors.menuBarBackground,
          },
        }}
      >
        {stateContext.authToken ? (
        // {authContext.authToken ? (
          <MenuList>
            <MenuItem disableRipple>
              <FormControlLabel
                control={
                  <CustomSwitch
                    disableRipple
                    size="small"
                    checked={switchChecked}
                    onChange={handleSwitchChange}
                  />
                }
                label={<span style={{ paddingLeft: 6 }}>Bearbeiten</span>}
              />
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <PowerSettingsNewOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Abmelden</ListItemText>
            </MenuItem>
          </MenuList>
        ) : null}
      </Menu>
    </>
  );
}
