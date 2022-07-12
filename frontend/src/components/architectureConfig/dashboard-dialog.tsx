import { useArchitectureContext } from "context/architecture-provider";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import cloneDeep from "lodash/cloneDeep";

import { DIALOG_TITLES } from "constants/text";

import { SmallField } from "components/elements/text-fields";
import { SaveButton, CancelButton } from "components/elements/buttons";
import colors from "theme/colors";
import borderRadius from "theme/border-radius";

import {
  DashboardIcon,
  iconList,
} from "components/architectureConfig/dashboard-icons";
import { DashboardComponent } from "components/dashboard";
import { ToggleIconButton } from "components/elements/toggle-icon-button";

type DashboardDialogProps = {
  open: boolean;
  onClose: () => void;
  dashboard: DashboardComponent;
  editMode: boolean;
};

export function DashboardDialog(props: DashboardDialogProps) {
  const { open, onClose, dashboard, editMode } = props;

  const { architectureContext, setArchitectureContext } =
    useArchitectureContext();

  const [iconChooserOpen, setIconChooserOpen] = useState(false);

  const handleIconChooserClickOpen = () => {
    setIconChooserOpen(true);
  };

  const handleIconChooserClose = () => {
    setIconChooserOpen(false);
  };

  const [newDashboardName, setNewDashboardName] = useState(
    editMode ? dashboard.name : ""
  );
  const [newDashboardIcon, setNewDashboardIcon] = useState(
    editMode ? dashboard.icon : "right"
  );
  const [newDashboardUrl, setNewDashboardUrl] = useState(
    editMode ? dashboard.url : ""
  );

  const [dashboardVisibility, setDashboardVisibility] = useState(() => {
    if (typeof dashboard.visible === "undefined") {
      dashboard.visible = true;
    }
    return editMode ? dashboard.visible : false;
  });

  const handleOnVisibleClick = () => {
    setDashboardVisibility(!dashboardVisibility);
  };

  const addDashboard = () => {
    if (
      newDashboardName.length > 0 &&
      newDashboardIcon.length > 0 &&
      newDashboardUrl.length > 0 &&
      architectureContext.currentArchitectureContext.filter(
        (d: DashboardComponent) => d.url === newDashboardUrl
      ).length < 1
    ) {
      let newArchitectureContext = cloneDeep(architectureContext);
      let newCurrentArchitectureContext = cloneDeep(
        newArchitectureContext.currentArchitectureContext
      );
      newCurrentArchitectureContext.push({
        _id: "",
        name: newDashboardName,
        icon: newDashboardIcon,
        url: newDashboardUrl,
        visible: dashboardVisibility,
        widgets: [],
      });
      newArchitectureContext.currentArchitectureContext =
        newCurrentArchitectureContext;
      newArchitectureContext.queryEnabled = false;
      setArchitectureContext(newArchitectureContext);
    }
    resetFields();
    onClose();
  };

  const editDashboard = () => {
    if (
      newDashboardName.length > 0 &&
      newDashboardIcon.length > 0 &&
      newDashboardUrl.length > 0 &&
      typeof dashboardVisibility !== "undefined"
    ) {
      let newArchitectureContext = cloneDeep(architectureContext);
      let newCurrentArchitectureContext = cloneDeep(
        newArchitectureContext.currentArchitectureContext
      );
      const dashboardIndex = newCurrentArchitectureContext.findIndex(
        (d: DashboardComponent) =>
          d._id === dashboard._id && d.url === dashboard.url
      );
      if (dashboardIndex !== -1) {
        newCurrentArchitectureContext[dashboardIndex].name = newDashboardName;
        newCurrentArchitectureContext[dashboardIndex].icon = newDashboardIcon;
        newCurrentArchitectureContext[dashboardIndex].url = newDashboardUrl;
        newCurrentArchitectureContext[dashboardIndex].visible =
          dashboardVisibility;
      }
      newArchitectureContext.currentArchitectureContext =
        newCurrentArchitectureContext;
      newArchitectureContext.queryEnabled = false;
      setArchitectureContext(newArchitectureContext);
    }
    onClose();
  };

  const resetFields = (soft?: boolean) => {
    if (soft) {
      const dashboardIndex =
        architectureContext.currentArchitectureContext.findIndex(
          (d: DashboardComponent) =>
            d._id === dashboard._id && d.url === dashboard.url
        );
      if (dashboardIndex !== -1) {
        architectureContext.currentArchitectureContext[dashboardIndex].name
          ? setNewDashboardName(
              architectureContext.currentArchitectureContext[dashboardIndex]
                .name
            )
          : setNewDashboardName("");
        architectureContext.currentArchitectureContext[dashboardIndex].icon
          ? setNewDashboardIcon(
              architectureContext.currentArchitectureContext[dashboardIndex]
                .icon
            )
          : setNewDashboardIcon("right");
        architectureContext.currentArchitectureContext[dashboardIndex].url
          ? setNewDashboardUrl(
              architectureContext.currentArchitectureContext[dashboardIndex].url
            )
          : setNewDashboardUrl("");
        architectureContext.currentArchitectureContext[dashboardIndex].visible
          ? setDashboardVisibility(
              architectureContext.currentArchitectureContext[dashboardIndex]
                .visible
            )
          : setDashboardVisibility(false);
      }
    } else {
      setNewDashboardName("");
      setNewDashboardIcon("right");
      setNewDashboardUrl("");
      setDashboardVisibility(false);
    }
  };

  const resettingClose = () => {
    resetFields(false);
    onClose();
  };

  const softResettingClose = () => {
    resetFields(true);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          borderRadius: borderRadius.componentRadius,
          backgroundColor: colors.panelBackground,
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle>
        {editMode ? (
          <Box display="flex" alignItems="center">
            <EditIcon
              style={{
                color: colors.grayed,
                marginRight: 6,
              }}
            />
            {DIALOG_TITLES.EDIT_DASHBOARD}
          </Box>
        ) : (
          <Box display="flex" alignItems="center">
            <AddIcon style={{ color: colors.grayed, marginRight: 6 }} />
            {DIALOG_TITLES.ADD_DASHBOARD}
          </Box>
        )}
      </DialogTitle>
      <DialogContent>
        <SmallField
          placeholder="Geben Sie den Namen des Dashboards ein"
          label="Name"
          type="text"
          value={newDashboardName}
          onChange={(e) => setNewDashboardName(e.target.value)}
        />
        <SmallField
          placeholder="Geben Sie die URL an"
          label="URL"
          type="text"
          value={newDashboardUrl}
          onChange={(e) => setNewDashboardUrl(e.target.value)}
        />
        <Box display="flex" alignItems="center">
          <IconButton onClick={handleIconChooserClickOpen}>
            <DashboardIcon icon={newDashboardIcon} color={colors.text} />
          </IconButton>
          <Button onClick={handleIconChooserClickOpen}>Icon ändern</Button>
        </Box>
        <ToggleIconButton
          onClick={handleOnVisibleClick}
          toggleIcon={dashboardVisibility}
          icon1={
            <VisibilityIcon
              style={{ color: colors.text, fontSize: "1.25rem" }}
            />
          }
          icon2={
            <VisibilityOffIcon
              style={{ color: colors.text, fontSize: "1.25rem" }}
            />
          }
          text1="Sichtbar"
          text2="Unsichtbar"
        />
        <Dialog
          disableEscapeKeyDown
          open={iconChooserOpen}
          onClose={handleIconChooserClose}
          PaperProps={{
            style: {
              borderRadius: borderRadius.componentRadius,
              backgroundColor: colors.backgroundColor,
              backgroundImage: "none",
            },
          }}
        >
          <DialogContent>
            <Box component="form" sx={{ display: "flex", flexWrap: "wrap" }}>
              {iconList.map((icon) => (
                <IconButton
                  key={"box-" + icon}
                  onClick={() => setNewDashboardIcon(icon)}
                >
                  <DashboardIcon
                    key={"dashboardicon-" + icon}
                    icon={icon}
                    color={
                      newDashboardIcon === icon ? colors.edit : colors.grayed
                    }
                  />
                </IconButton>
              ))}
            </Box>
          </DialogContent>
          <DialogActions style={{ justifyContent: "center" }}>
            <SaveButton text="Schließen" onClick={handleIconChooserClose} />
          </DialogActions>
        </Dialog>
      </DialogContent>
      <DialogActions style={{ justifyContent: "center" }}>
        <SaveButton onClick={editMode ? editDashboard : addDashboard} />
        <CancelButton
          onClick={editMode ? softResettingClose : resettingClose}
        />
      </DialogActions>
    </Dialog>
  );
}
