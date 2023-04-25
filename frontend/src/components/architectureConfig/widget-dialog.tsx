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
import { v4 as uuidv4 } from 'uuid';

type WidgetDialogProps = {
  open: boolean;
  onClose: () => void;
  widget: WidgetComponent;
  editMode: boolean;
  parentsUids: string[];
};

export function WidgetDialog(props: WidgetDialogProps) {
  const { open, onClose, widget, editMode, parentsUids } = props;
  const [parentDashboardUid] = parentsUids;

  const { architectureContext, setArchitectureContext } = useArchitectureContext();

  const [newWidgetName, setNewWidgetName] = useState(editMode ? widget.name : "");

  const addWidget = () => {
    if (newWidgetName.length > 0) {
      let newArchitectureContext = cloneDeep(architectureContext);
      let newCurrentArchitectureContext = cloneDeep(newArchitectureContext.currentArchitectureContext);
      newCurrentArchitectureContext
      .find((d: DashboardComponent) => (d._id !== "" ? d._id : d.uid) === parentDashboardUid)
        .widgets.push({
          _id: "",
          name: newWidgetName,
          uid: uuidv4(),
          panels: [],
        });
      newArchitectureContext.currentArchitectureContext = newCurrentArchitectureContext;
      newArchitectureContext.queryEnabled = false;
      setArchitectureContext(newArchitectureContext);
    }
    setNewWidgetName("");
    onClose();
  };

  const editWidget = () => {
    if (newWidgetName.length > 0) {
      let newArchitectureContext = cloneDeep(architectureContext);
      let newCurrentArchitectureContext = cloneDeep(newArchitectureContext.currentArchitectureContext);
      newCurrentArchitectureContext
        .find((d: DashboardComponent) => (d._id !== "" ? d._id : d.uid) === parentDashboardUid)
        .widgets.find((w: WidgetComponent) => (widget.uid ? (w.uid === widget.uid) : (w._id === widget._id))).name = newWidgetName;
      newArchitectureContext.currentArchitectureContext = newCurrentArchitectureContext;
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
      .find((d: DashboardComponent) => (d._id!=="" ? d._id : d.uid) === parentDashboardUid)
        .widgets.filter((w: WidgetComponent) => (widget.uid ? (w.uid === widget.uid) : (w._id === widget._id)))
        .length === 1
    ) {
      architectureContext.currentArchitectureContext
      .find((d: DashboardComponent) => (d._id!=="" ? d._id : d.uid) === parentDashboardUid)
        .widgets.find((w: WidgetComponent) => (widget.uid ? (w.uid === widget.uid) : (w._id === widget._id))).name
        ? setNewWidgetName(
            architectureContext.currentArchitectureContext
            .find((d: DashboardComponent) => (d._id!=="" ? d._id : d.uid) === parentDashboardUid)
              .widgets.find((w: WidgetComponent) => (widget.uid ? (w.uid === widget.uid) : (w._id === widget._id))).name
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
