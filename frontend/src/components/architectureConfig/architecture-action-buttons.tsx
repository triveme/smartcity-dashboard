import * as React from "react";
import Box from "@mui/material/Box";
import isEqual from "lodash/isEqual";
import { cloneDeep, omit } from "lodash";

import { SaveButton, CancelButton } from "components/elements/buttons";

import { useAuthContext } from "context/auth-provider";
import { useArchitectureContext } from "context/architecture-provider";
import { postArchitecture } from "clients/architecture-client";
import { DashboardComponent } from "components/dashboard";

type ArchitectureActionButtonsProps = {
  onSavedDashboard: VoidFunction;
};

export function ArchitectureActionButtons(
  props: ArchitectureActionButtonsProps
) {
  const { onSavedDashboard } = props;
  const { authContext } = useAuthContext();

  const { architectureContext, setArchitectureContext } =
    useArchitectureContext();

  const { initialArchitectureContext, currentArchitectureContext } =
    architectureContext;

  const saveArchitecture = () => {
    let contextToSend: (DashboardComponent | { _id: string })[] = [];
    currentArchitectureContext.forEach(
      (d: DashboardComponent, index: number) => {
        // new dashboard
        if (d._id === "") {
          let newDashboard = d;
          newDashboard.index = index;
          contextToSend.push(newDashboard);
        }
        // edited dashboard
        else {
          const initialDashboard = initialArchitectureContext.filter(
            (db: DashboardComponent) => {
              return db._id === d._id;
            }
          )[0];
          if (
            !isEqual(initialDashboard, d) ||
            // additional check for positional changes.
            // Necessary because the index is not explicitly sent by the backend
            initialArchitectureContext.findIndex(
              (dashboard: DashboardComponent) =>
                d.name === dashboard.name && d._id === dashboard._id
            ) !== index
          ) {
            let editedDashboard = d;
            editedDashboard.index = index;
            contextToSend.push(editedDashboard);
          }
        }
      }
    );
    initialArchitectureContext.forEach((d: DashboardComponent) => {
      // deleted dashboard
      if (d._id !== "") {
        if (
          currentArchitectureContext.filter((db: DashboardComponent) => {
            return db._id === d._id;
          }).length === 0
        ) {
          contextToSend.push({ _id: d._id });
        }
      }
    });
    postArchitecture({
      token: authContext.authToken,
      dashboards: contextToSend,
    })
      .then((architectureData) => {
        setArchitectureContext({
          ...architectureContext,
          initialArchitectureContext: cloneDeep(architectureData),
          currentArchitectureContext: cloneDeep(architectureData),
          queryEnabled: true,
          isLoading: false,
        });
        onSavedDashboard();
      })
      .catch((e) => {
        console.log("Seitenaufbau konnte nicht aktualisiert werden.");
      });
  };

  const resetArchitecture = () => {
    setArchitectureContext({
      ...architectureContext,
      initialArchitectureContext: cloneDeep(initialArchitectureContext),
      currentArchitectureContext: cloneDeep(initialArchitectureContext),
      queryEnabled: true,
      isLoading: false,
    });
  };

  if (
    !isEqual(
      omit(initialArchitectureContext, ["apexSeries", "values"]),
      omit(currentArchitectureContext, ["apexSeries", "values"])
    )
  ) {
    return (
      <Box sx={{ "& > :not(style)": { marginRight: 1 }, display: "flex" }}>
        <SaveButton onClick={saveArchitecture} />
        <CancelButton onClick={resetArchitecture} />
      </Box>
    );
  } else {
    return <></>;
  }
}
