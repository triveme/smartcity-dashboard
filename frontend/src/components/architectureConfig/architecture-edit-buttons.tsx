import { useState } from "react";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { WidgetDialog } from "./widget-dialog";
import { PanelDialog } from "./panel-dialog";
import { DeleteDialog } from "components/architectureConfig/delete-dialog";
import { DashboardDialog } from "./dashboard-dialog";

import colors from "theme/colors";

import { useArchitectureContext } from "context/architecture-provider";
import { cloneDeep } from "lodash";
import { DashboardComponent } from "components/dashboard";
import { WidgetComponent } from "components/widget";
import { PanelComponent } from "components/panel";
import { useAuthContext } from "context/auth-provider";

type ArchitectureEditDeleteButtonsProps = {
  type: string;
  component: DashboardComponent | WidgetComponent | PanelComponent;
  parents: string[];
  parentsUids: string[];
  editMode: boolean;
};

export function ArchitectureEditButtons(
  props: ArchitectureEditDeleteButtonsProps
) {
  const { type, component, parents, parentsUids, editMode } = props;

  const theme = useTheme();
  const matchesDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  const { architectureContext, setArchitectureContext } =
    useArchitectureContext();
  const { authContext } = useAuthContext();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleClickDeleteOpen = () => {
    setDeleteOpen(true);
  };

  const handleClickDeleteClose = () => {
    setDeleteOpen(false);
  };

  // new panel
  const [panelCreationOpen, setPanelCreationOpen] = useState(false);

  const handlePanelDialogOpen = () => {
    setPanelCreationOpen(true);
  };

  const handlePanelCreationClose = () => {
    setPanelCreationOpen(false);
  };

  const [dashboardCreationOpen, setDashboardCreationOpen] = useState(false);

  const handleDashboardDialogOpen = () => {
    setDashboardCreationOpen(true);
  };

  const handleDashboardCreationClose = () => {
    setDashboardCreationOpen(false);
  };

  const [widgetCreationOpen, setWidgetCreationOpen] = useState(false);

  const handleWidgetDialogOpen = () => {
    setWidgetCreationOpen(true);
  };

  const handleWidgetCreationClose = () => {
    setWidgetCreationOpen(false);
  };

  const handleEdit = () => {
    if (type === "Dashboard") {
      handleDashboardDialogOpen();
    } else if (type === "Widget") {
      handleWidgetDialogOpen();
    } else if (type === "Panel") {
      handlePanelDialogOpen();
    }
  };

  type SwapButtonProps = {
    swapFunction: () => void;
  };

  const UpButton = (props: SwapButtonProps) => {
    return (
      <IconButton
        size="small"
        onClick={() => props.swapFunction()}
        style={{ padding: 0, color: colors.edit }}
      >
        <KeyboardArrowUpIcon style={{ fontSize: "1.25rem" }} />
      </IconButton>
    );
  };

  const DownButton = (props: SwapButtonProps) => {
    return (
      <IconButton
        size="small"
        onClick={() => props.swapFunction()}
        style={{ padding: 0, color: colors.edit }}
      >
        <KeyboardArrowDownIcon style={{ fontSize: "1.25rem" }} />
      </IconButton>
    );
  };

  const LeftButton = (props: SwapButtonProps) => {
    return (
      <IconButton
        size="small"
        onClick={() => props.swapFunction()}
        style={{ padding: 0, color: colors.edit }}
      >
        <KeyboardArrowLeftIcon style={{ fontSize: "1.25rem" }} />
      </IconButton>
    );
  };

  const RightButton = (props: SwapButtonProps) => {
    return (
      <IconButton
        size="small"
        onClick={() => props.swapFunction()}
        style={{ padding: 0, color: colors.edit }}
      >
        <KeyboardArrowRightIcon style={{ fontSize: "1.25rem" }} />
      </IconButton>
    );
  };

  function swapDashboards(index1: number, index2: number) {
    let newArchitectureContext = cloneDeep(architectureContext);
    let newCurrentArchitectureContext = cloneDeep(
      newArchitectureContext.currentArchitectureContext
    );
    const tmp = newCurrentArchitectureContext[index1];
    newCurrentArchitectureContext[index1] =
      newCurrentArchitectureContext[index2];
    newCurrentArchitectureContext[index2] = tmp;
    newArchitectureContext.currentArchitectureContext =
      newCurrentArchitectureContext;
    newArchitectureContext.queryEnabled = false;
    setArchitectureContext(newArchitectureContext);
  }

  function swapWidgets(dashboardIndex: number, index1: number, index2: number) {
    let newArchitectureContext = cloneDeep(architectureContext);
    let newCurrentArchitectureContext = cloneDeep(
      newArchitectureContext.currentArchitectureContext
    );
    const tmp = newCurrentArchitectureContext[dashboardIndex].widgets[index1];
    newCurrentArchitectureContext[dashboardIndex].widgets[index1] =
      newCurrentArchitectureContext[dashboardIndex].widgets[index2];
    newCurrentArchitectureContext[dashboardIndex].widgets[index2] = tmp;
    newArchitectureContext.currentArchitectureContext =
      newCurrentArchitectureContext;
    newArchitectureContext.queryEnabled = false;
    setArchitectureContext(newArchitectureContext);
  }

  function swapPanels(
    dashboardIndex: number,
    widgetIndex: number,
    index1: number,
    index2: number
  ) {
    let newArchitectureContext = cloneDeep(architectureContext);
    let newCurrentArchitectureContext = cloneDeep(
      newArchitectureContext.currentArchitectureContext
    );
    const tmp =
      newCurrentArchitectureContext[dashboardIndex].widgets[widgetIndex].panels[
        index1
      ];
    newCurrentArchitectureContext[dashboardIndex].widgets[widgetIndex].panels[
      index1
    ] =
      newCurrentArchitectureContext[dashboardIndex].widgets[widgetIndex].panels[
        index2
      ];
    newCurrentArchitectureContext[dashboardIndex].widgets[widgetIndex].panels[
      index2
    ] = tmp;
    newArchitectureContext.currentArchitectureContext =
      newCurrentArchitectureContext;
    newArchitectureContext.queryEnabled = false;
    setArchitectureContext(newArchitectureContext);
  }

  const renderPositionAdjustmentButtons = () => {
    if (type === "Dashboard") {
      const numOfDashboards =
        architectureContext.currentArchitectureContext.length;
      if (numOfDashboards > 1) {
        const dashboardIndex =
          architectureContext.currentArchitectureContext.findIndex(
            (d: DashboardComponent) =>
              d.name === component.name && d._id === component._id
          );
        if (dashboardIndex > 0 && dashboardIndex < numOfDashboards - 1) {
          return (
            <>
              <UpButton
                swapFunction={() =>
                  swapDashboards(dashboardIndex, dashboardIndex - 1)
                }
              />
              <DownButton
                swapFunction={() =>
                  swapDashboards(dashboardIndex, dashboardIndex + 1)
                }
              />
            </>
          );
        } else if (dashboardIndex > 0) {
          return (
            <UpButton
              swapFunction={() =>
                swapDashboards(dashboardIndex, dashboardIndex - 1)
              }
            />
          );
        } else if (dashboardIndex < numOfDashboards - 1) {
          return (
            <DownButton
              swapFunction={() =>
                swapDashboards(dashboardIndex, dashboardIndex + 1)
              }
            />
          );
        }
      }
    } else if (type === "Widget") {
      const dashboardIndex =
        architectureContext.currentArchitectureContext.findIndex(
          (d: DashboardComponent) => d.name === parents[0]
        );
      if (dashboardIndex !== -1) {
        const numOfWidgets =
          architectureContext.currentArchitectureContext[dashboardIndex].widgets
            .length;
        if (numOfWidgets > 1) {
          const widgetIndex = architectureContext.currentArchitectureContext[
            dashboardIndex
          ].widgets.findIndex((w: WidgetComponent) => {
            return w._id === component._id && w.name === component.name;
          });
          if (widgetIndex > 0 && widgetIndex < numOfWidgets - 1) {
            return (
              <>
                <UpButton
                  swapFunction={() =>
                    swapWidgets(dashboardIndex, widgetIndex, widgetIndex - 1)
                  }
                />
                <DownButton
                  swapFunction={() =>
                    swapWidgets(dashboardIndex, widgetIndex, widgetIndex + 1)
                  }
                />
              </>
            );
          } else if (widgetIndex > 0) {
            return (
              <UpButton
                swapFunction={() =>
                  swapWidgets(dashboardIndex, widgetIndex, widgetIndex - 1)
                }
              />
            );
          } else if (widgetIndex < numOfWidgets - 1) {
            return (
              <DownButton
                swapFunction={() =>
                  swapWidgets(dashboardIndex, widgetIndex, widgetIndex + 1)
                }
              />
            );
          }
        }
      }
    } else if (type === "Panel") {
      const dashboardIndex =
        architectureContext.currentArchitectureContext.findIndex(
          (d: DashboardComponent) => d.name === parents[0]
        );
      const widgetIndex = architectureContext.currentArchitectureContext[
        dashboardIndex
      ].widgets.findIndex((w: WidgetComponent) => w.name === parents[1]);
      if (widgetIndex !== -1) {
        const numOfPanels =
          architectureContext.currentArchitectureContext[dashboardIndex]
            .widgets[widgetIndex].panels.length;
        if (numOfPanels > 1) {
          const panelIndex = architectureContext.currentArchitectureContext[
            dashboardIndex
          ].widgets[widgetIndex].panels.findIndex((p: PanelComponent) => {
            return p._id === component._id && p.name === component.name;
          });
          if (panelIndex > 0 && panelIndex < numOfPanels - 1) {
            return (
              <>
                <LeftButton
                  swapFunction={() =>
                    swapPanels(
                      dashboardIndex,
                      widgetIndex,
                      panelIndex,
                      panelIndex - 1
                    )
                  }
                />
                <RightButton
                  swapFunction={() =>
                    swapPanels(
                      dashboardIndex,
                      widgetIndex,
                      panelIndex,
                      panelIndex + 1
                    )
                  }
                />
              </>
            );
          } else if (panelIndex > 0) {
            return (
              <LeftButton
                swapFunction={() =>
                  swapPanels(
                    dashboardIndex,
                    widgetIndex,
                    panelIndex,
                    panelIndex - 1
                  )
                }
              />
            );
          } else if (panelIndex < numOfPanels - 1) {
            return (
              <RightButton
                swapFunction={() =>
                  swapPanels(
                    dashboardIndex,
                    widgetIndex,
                    panelIndex,
                    panelIndex + 1
                  )
                }
              />
            );
          }
        }
      }
    }
    return <></>;
  };

  return authContext.authToken && editMode && matchesDesktop ? (
    <>
      <IconButton
        size="small"
        onClick={handleEdit}
        color="inherit"
        style={{ padding: 0, color: colors.edit }}
      >
        <EditIcon style={{ fontSize: "1.25rem" }} />
      </IconButton>
      <IconButton
        size="small"
        onClick={handleClickDeleteOpen}
        color="inherit"
        style={{ padding: 0, color: colors.edit }}
      >
        <DeleteIcon style={{ fontSize: "1.25rem" }} />
      </IconButton>
      {renderPositionAdjustmentButtons()}
      <DeleteDialog
        type={type}
        component={component}
        open={deleteOpen}
        onClose={handleClickDeleteClose}
        parents={parents}
      />
      <DashboardDialog
        open={dashboardCreationOpen}
        onClose={handleDashboardCreationClose}
        dashboard={component as DashboardComponent}
        editMode={true}
      />
      <WidgetDialog
        open={widgetCreationOpen}
        onClose={handleWidgetCreationClose}
        editMode={true}
        widget={component as WidgetComponent}
        parents={parents}
        parentsUids={parentsUids}
      />
      <PanelDialog
        open={panelCreationOpen}
        onClose={handlePanelCreationClose}
        editMode={true}
        panel={component as PanelComponent}
        parents={parents}
        parentsUids={parentsUids}
      />
    </>
  ) : null;
}
