import { useState } from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { AddButton } from "components/elements/buttons";

import { Panel, PanelComponent } from "components/panel";
import { PanelDialog } from "components/architectureConfig/panel-dialog";

import { ArchitectureEditButtons } from "components/architectureConfig/architecture-edit-buttons";
import { initialPanel } from "./architectureConfig/initial-components";
import { useAuthContext } from "context/auth-provider";
import { BUTTON_TEXTS } from "constants/text";
import { WidgetCard } from "./elements/widget-card";
import { v4 as uuidv4 } from 'uuid';

export type WidgetComponent = {
  _id: string;
  name: string;
  uid: string;
  panels: PanelComponent[];
};

type WidgetProps = {
  widget: WidgetComponent;
  parentName: string;
  parentsUid: string
  editMode: boolean;
};

export function Widget(props: WidgetProps) {
  const { widget, parentName, parentsUid, editMode } = props;
  const { authContext } = useAuthContext();

  const theme = useTheme();
  const matchesDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  const [panelCreationOpen, setPanelCreationOpen] = useState(false);

  const handlePanelCreationClickOpen = () => {
    setPanelCreationOpen(true);
  };

  const handlePanelCreationClose = () => {
    setPanelCreationOpen(false);
  };

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleTooltipClose = () => {
    setTooltipOpen(false);
  };

  const handleTooltipOpen = () => {
    setTooltipOpen(true);
  };

  const provideInitialPanelWithUid = () => {
    let panel = {...initialPanel};
    panel.uid = uuidv4();

    return panel;
  }

  return (
    <WidgetCard>
      <Box>
        {widget.name && (
          <ClickAwayListener onClickAway={handleTooltipClose}>
            <Tooltip
              PopperProps={{
                disablePortal: true,
              }}
              onClose={handleTooltipClose}
              open={tooltipOpen}
              placement="bottom-start"
              disableHoverListener
              title={widget.name}
            >
              <Box display="flex" justifyContent={"space-between"}>
                {" "}
                <Typography
                  variant="h2"
                  noWrap
                  component="div"
                  marginBottom={1}
                  onClick={handleTooltipOpen}
                >
                  {widget.name}
                </Typography>
                <Box>
                  <ArchitectureEditButtons
                    type="Widget"
                    component={widget}
                    parents={[parentName]}
                    parentsUids={[parentsUid]}
                    editMode={editMode}
                  />
                </Box>
              </Box>
            </Tooltip>
          </ClickAwayListener>
        )}
      </Box>
      <Grid container spacing={2}>
        {widget.panels &&
          widget.panels.map((panel: PanelComponent, index: number) => (
            <Panel
              key={"panel-" + (panel._id!=="" ? panel._id : panel.uid) + index}
              panel={panel}
              previewMode={false}
              parents={[parentName, widget.name]}
              parentsUids={[parentsUid, (widget._id!=="" ? widget._id : widget.uid)]}
              editMode={editMode}
            />
          ))}
      </Grid>
      {authContext.authToken && editMode && matchesDesktop ? (
        <>
          <Box style={{ marginTop: 16 }}>
            <AddButton
              onClick={handlePanelCreationClickOpen}
              text={BUTTON_TEXTS.ADD_PANEL}
            />
          </Box>
          <PanelDialog
            open={panelCreationOpen}
            onClose={handlePanelCreationClose}
            editMode={false}
            panel={provideInitialPanelWithUid()}
            parents={[parentName, widget.name]}
            parentsUids={[parentsUid, (widget._id!=="" ? widget._id : widget.uid)]}
          />
        </>
      ) : null}
    </WidgetCard>
  );
}
