import * as React from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DeleteIcon from "@mui/icons-material/Delete";
import { useArchitectureContext } from "context/architecture-provider";
import cloneDeep from "lodash/cloneDeep";
import { DashboardComponent } from "components/dashboard";
import { WidgetComponent } from "components/widget";
import { PanelComponent } from "components/panel";

import { DeleteButton, CancelButton } from "components/elements/buttons";
import colors from "theme/colors";
import borderRadius from "theme/border-radius";

type DeleteDialogProps = {
  type: string;
  component: DashboardComponent | WidgetComponent | PanelComponent;
  open: boolean;
  onClose: () => void;
  parents: string[];
};

export function DeleteDialog(props: DeleteDialogProps) {
  const { type, component, open, onClose, parents } = props;

  const { architectureContext, setArchitectureContext } =
    useArchitectureContext();

  const handleDelete = () => {
    let newArchitectureContext = cloneDeep(architectureContext);
    let newCurrentArchitectureContext = cloneDeep(
      newArchitectureContext.currentArchitectureContext
    );
    if (type === "Dashboard") {
      newCurrentArchitectureContext = newCurrentArchitectureContext.filter(
        (d: DashboardComponent) => d.name !== component.name
      );
    } else if (type === "Widget") {
      const dashboardIndex = newCurrentArchitectureContext.findIndex(
        (d: DashboardComponent) => d.name === parents[0]
      );
      if (dashboardIndex !== -1)
        newCurrentArchitectureContext[dashboardIndex].widgets =
          newCurrentArchitectureContext[dashboardIndex].widgets.filter(
            (w: WidgetComponent) => w.name !== component.name
          );
    } else if (type === "Panel") {
      const dashboardIndex = newCurrentArchitectureContext.findIndex(
        (d: DashboardComponent) => d.name === parents[0]
      );
      const widgetIndex = newCurrentArchitectureContext[
        dashboardIndex
      ].widgets.findIndex((w: WidgetComponent) => w.name === parents[1]);
      if (dashboardIndex !== -1 && widgetIndex !== -1)
        newCurrentArchitectureContext[dashboardIndex].widgets[
          widgetIndex
        ].panels = newCurrentArchitectureContext[dashboardIndex].widgets[
          widgetIndex
        ].panels.filter((p: PanelComponent) => p.name !== component.name);
    }
    newArchitectureContext.currentArchitectureContext =
      newCurrentArchitectureContext;
    newArchitectureContext.queryEnabled = false;
    setArchitectureContext(newArchitectureContext);
    onClose();
  };

  return (
    <div>
      <Dialog
        open={open}
        PaperProps={{
          style: {
            borderRadius: borderRadius.componentRadius,
            backgroundColor: colors.backgroundColor,
            backgroundImage: "none",
          },
        }}
        onClose={onClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          <Box display="flex" alignItems="center">
            <DeleteIcon style={{ color: colors.grayed, marginRight: 6 }} />
            {`${type} löschen`}
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="delete-dialog-description"
            sx={{ color: colors.textDark }}
          >
            Sind Sie sicher, dass Sie das {type} löschen wollen?
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ justifyContent: "center" }}>
          <DeleteButton onClick={handleDelete} />
          <CancelButton onClick={onClose} />
        </DialogActions>
      </Dialog>
    </div>
  );
}
