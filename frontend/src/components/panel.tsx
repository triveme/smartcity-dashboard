import { useState } from "react";
import Grid, { GridSize } from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";

import { Tabbing, TabComponent } from "components/tab";
import { ArchitectureEditButtons } from "components/architectureConfig/architecture-edit-buttons";

export type PanelComponent = {
  _id: string;
  name: string;
  uid: string;
  width: number;
  height: number;
  tabs: TabComponent[];
};

type PanelProps = {
  panel: PanelComponent;
  previewMode: boolean;
  parents: string[];
  parentsUids: string[];
  editMode: boolean;
  showOnMap?: (index: number, lat: number, lng: number) => void;
};

export function Panel(props: PanelProps) {
  const { panel, previewMode, parents, parentsUids, editMode, showOnMap } = props;

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleTooltipClose = () => { setTooltipOpen(false); };
  const handleTooltipOpen = () => { setTooltipOpen(true); };

  //Set grid size and limit to max of 12 to reduce errors
  let mdGrid = (Number(panel.width) * 2) as GridSize;
  mdGrid = (mdGrid > 12 ? 12 : mdGrid) as GridSize;  
  let smGrid = (Number(panel.width) * 2.5) as GridSize;
  smGrid = (smGrid > 12 ? 12 : smGrid) as GridSize;

  return (
    <Grid
      item
      container
      direction="column"
      lg={Number(panel.width) as GridSize}
      md={mdGrid}
      sm={smGrid}
      height={panel.height}
      display="block"
    >
      <Paper
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
        elevation={0}
      >
        {panel.name && (
          <ClickAwayListener onClickAway={handleTooltipClose}>
            <Tooltip
              PopperProps={{
                disablePortal: true,
              }}
              onClose={handleTooltipClose}
              open={tooltipOpen}
              placement="bottom-start"
              disableHoverListener
              title={panel.name}
            >
              <Box display="flex" justifyContent={"space-between"}>
                <Typography
                  variant="h3"
                  noWrap
                  component="div"
                  paddingLeft={1}
                  onClick={handleTooltipOpen}
                >
                  {panel.name}
                </Typography>
                {previewMode === false && (
                  <Box>
                    <ArchitectureEditButtons
                      type="Panel"
                      component={panel}
                      parents={[...parents, panel.name]}
                      parentsUids={[...parentsUids, (panel._id!=="" ? panel._id : panel.uid)]}
                      editMode={editMode}
                    />
                  </Box>
                )}
              </Box>
            </Tooltip>
          </ClickAwayListener>
        )}
        {!panel.name && previewMode === false && (
          <Box display="flex" justifyContent={"end"}>
            <Box
              position="absolute"
              zIndex={1100}
            >
              <ArchitectureEditButtons
                type="Panel"
                component={panel}
                parents={[...parents, panel.name]}
                parentsUids={[...parentsUids, (panel._id !== "" ? panel._id : panel.uid)]}
                editMode={editMode}
              />
            </Box>
          </Box>
        )}
        <Tabbing
          panel={panel}
          showOnMap={showOnMap ? showOnMap : () => {}}
        />
      </Paper>
    </Grid>
  );
}
