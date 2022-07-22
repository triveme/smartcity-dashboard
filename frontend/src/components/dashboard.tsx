import { useState, useEffect } from "react";
import cloneDeep from "lodash/cloneDeep";

import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { Widget, WidgetComponent } from "components/widget";
import { WidgetDialog } from "components/architectureConfig/widget-dialog";
import { AddButton } from "components/elements/buttons";
import { initialWidget } from "./architectureConfig/initial-components";

import { Spinner } from "components/elements/spinner";

import { getDashboardArchitecture } from "clients/architecture-client";
import { useArchitectureContext } from "context/architecture-provider";
import { useAuthContext } from "context/auth-provider";
import { BUTTON_TEXTS, EMPTY_DASHBOARD } from "constants/text";
import { DashboardWrapper } from "./elements/dashboard-wrapper";

export type DashboardComponent = {
  _id: string;
  name: string;
  url: string;
  icon: string;
  widgets: WidgetComponent[];
  index?: number;
  visible?: boolean;
};

type DashboardProps = {
  dashboard: DashboardComponent;
  editMode: boolean;
  loggedIn: boolean;
  dashboardSaved: boolean;
};

export function Dashboard(props: DashboardProps) {
  const { dashboard, editMode, loggedIn, dashboardSaved } = props;

  const theme = useTheme();
  const matchesDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  const { architectureContext, setArchitectureContext } =
    useArchitectureContext();
  const { authContext } = useAuthContext();

  useEffect(() => {
    if (dashboard && dashboard._id) {
      // edit mode, load data once
      if (
        dashboard.widgets === undefined &&
        architectureContext.queryEnabled === false
      ) {
        getDashboardArchitecture({
          dashboardUrl: dashboard.url,
          isAdmin: authContext.authToken ? true : false,
          queryEnabled: false,
        }).then((architectureData) => {
          const dIndex = architectureData.findIndex((d: DashboardComponent) => {
            return d._id === dashboard._id;
          });
          if (dIndex > -1) {
            let newCurrentArchitectureContext = cloneDeep(
              architectureContext.currentArchitectureContext
            );
            let newInitialArchitectureContext = cloneDeep(
              architectureContext.initialArchitectureContext
            );
            newInitialArchitectureContext[dIndex] = architectureData[dIndex];
            const cDIndex = newCurrentArchitectureContext.findIndex(
              (d: DashboardComponent) => {
                return d._id === dashboard._id;
              }
            );
            if (cDIndex > -1) {
              newCurrentArchitectureContext[cDIndex] = architectureData[dIndex];
            }
            setArchitectureContext({
              ...architectureContext,
              initialArchitectureContext: newInitialArchitectureContext,
              currentArchitectureContext: newCurrentArchitectureContext,
              dashboardUrl: dashboard.url,
              isLoading: false,
            });
          }
        });
      } else {
        setArchitectureContext({
          ...architectureContext,
          dashboardUrl: dashboard.url,
          isLoading: true,
        });
      }
    }
    // eslint-disable-next-line
  }, [dashboard.url, dashboardSaved, authContext.authToken, loggedIn]);

  const [widgetCreationOpen, setWidgetCreationOpen] = useState(false);

  const handleWidgetCreationClickOpen = () => {
    setWidgetCreationOpen(true);
  };

  const handleWidgetCreationClose = () => {
    setWidgetCreationOpen(false);
  };

  return (
    <DashboardWrapper>
      <Typography variant="h1">{dashboard.name}</Typography>
      {!dashboard.widgets ? (
        <Spinner />
      ) : dashboard.widgets.length === 0 ? (
        <Typography marginBottom={1}>{EMPTY_DASHBOARD}</Typography>
      ) : (
        dashboard.widgets.map((widget: WidgetComponent) => (
          <Widget
            key={"widget-" + widget.name}
            widget={widget}
            parentName={dashboard.name}
            editMode={editMode}
          />
        ))
      )}
      {authContext.authToken && editMode && matchesDesktop ? (
        <>
          <AddButton
            onClick={handleWidgetCreationClickOpen}
            text={BUTTON_TEXTS.ADD_WIDGET}
          />
          <WidgetDialog
            open={widgetCreationOpen}
            onClose={handleWidgetCreationClose}
            editMode={false}
            widget={initialWidget}
            parents={[dashboard.name]}
          />
        </>
      ) : null}
    </DashboardWrapper>
  );
}
