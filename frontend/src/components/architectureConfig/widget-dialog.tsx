import { useArchitectureContext } from "context/architecture-provider";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import cloneDeep from "lodash/cloneDeep";
import { WidgetComponent } from "components/widget";
import { DashboardComponent } from "components/dashboard";

import { SmallField } from "components/elements/text-fields";
import { SaveButton, CancelButton } from "components/elements/buttons";
import colors from "theme/colors";
import borderRadius from "theme/border-radius";
import { DIALOG_TITLES } from "constants/text";

type WidgetDialogProps = {
  open: boolean;
  onClose: () => void;
  widget: WidgetComponent;
  editMode: boolean;
  parents: string[];
};

export function WidgetDialog(props: WidgetDialogProps) {
  const { open, onClose, widget, editMode, parents } = props;
  const [parentDashboardName] = parents;

  const { architectureContext, setArchitectureContext } =
    useArchitectureContext();

  const [newWidgetName, setNewWidgetName] = useState(
    editMode ? widget.name : ""
  );

  const addWidget = () => {
    if (
      newWidgetName.length > 0 &&
      architectureContext.currentArchitectureContext
        .find((d: DashboardComponent) => d.name === parentDashboardName)
        .widgets.filter((w: WidgetComponent) => w.name === newWidgetName)
        .length < 1
    ) {
      let newArchitectureContext = cloneDeep(architectureContext);
      let newCurrentArchitectureContext = cloneDeep(
        newArchitectureContext.currentArchitectureContext
      );
      newCurrentArchitectureContext
        .find((d: DashboardComponent) => d.name === parentDashboardName)
        .widgets.push({
          _id: "",
          name: newWidgetName,
          panels: [],
        });
      newArchitectureContext.currentArchitectureContext =
        newCurrentArchitectureContext;
      newArchitectureContext.queryEnabled = false;
      setArchitectureContext(newArchitectureContext);
    }
    setNewWidgetName("");
    onClose();
  };

  const editWidget = () => {
    if (
      newWidgetName.length > 0 &&
      architectureContext.currentArchitectureContext
        .find((d: DashboardComponent) => d.name === parentDashboardName)
        .widgets.filter((w: WidgetComponent) => w.name === widget.name)
        .length === 1
    ) {
      let newArchitectureContext = cloneDeep(architectureContext);
      let newCurrentArchitectureContext = cloneDeep(
        newArchitectureContext.currentArchitectureContext
      );
      newCurrentArchitectureContext
        .find((d: DashboardComponent) => d.name === parentDashboardName)
        .widgets.find((w: WidgetComponent) => w.name === widget.name).name =
        newWidgetName;
      newArchitectureContext.currentArchitectureContext =
        newCurrentArchitectureContext;
      newArchitectureContext.queryEnabled = false;
      setArchitectureContext(newArchitectureContext);
    }
    onClose();
  };

  const resettingClose = () => {
    setNewWidgetName("");
    onClose();
  };

  const softResettingClose = () => {
    if (
      architectureContext.currentArchitectureContext
        .find((d: DashboardComponent) => d.name === parentDashboardName)
        .widgets.filter((w: WidgetComponent) => w.name === widget.name)
        .length === 1
    ) {
      architectureContext.currentArchitectureContext
        .find((d: DashboardComponent) => d.name === parentDashboardName)
        .widgets.find((w: WidgetComponent) => w.name === widget.name).name
        ? setNewWidgetName(
            architectureContext.currentArchitectureContext
              .find((d: DashboardComponent) => d.name === parentDashboardName)
              .widgets.find((w: WidgetComponent) => w.name === widget.name).name
          )
        : setNewWidgetName("");
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          borderRadius: borderRadius.componentRadius,
          backgroundColor: colors.backgroundColor,
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle>
        {editMode ? (
          <Box display="flex" alignItems="center">
            <EditIcon style={{ color: colors.grayed, marginRight: 6 }} />
            {DIALOG_TITLES.EDIT_WIDGET}
          </Box>
        ) : (
          <Box display="flex" alignItems="center">
            <AddIcon style={{ color: colors.grayed, marginRight: 6 }} />
            {DIALOG_TITLES.ADD_WIDGET}
          </Box>
        )}
      </DialogTitle>
      <DialogContent>
        <SmallField
          label="Name"
          type="text"
          placeholder="Geben Sie den Namen des Widgets ein"
          value={newWidgetName}
          onChange={(e) => setNewWidgetName(e.target.value)}
        />
      </DialogContent>
      <DialogActions style={{ justifyContent: "center" }}>
        <SaveButton onClick={editMode ? editWidget : addWidget} />
        <CancelButton
          onClick={editMode ? softResettingClose : resettingClose}
        />
      </DialogActions>
    </Dialog>
  );
}
