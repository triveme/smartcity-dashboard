import React, { useState, createContext, useContext } from "react";
import { cloneDeep, isEqual, omit } from "lodash";

import { useDashboardArchitecture } from "clients/architecture-client";
import { useStateContext } from "../providers/state-provider";

type ArchitectureValue = any;

const initialCombinedArchitectureContext = {
  initialArchitectureContext: [],
  currentArchitectureContext: [],
  dashboardUrl: "",
  queryEnabled: true,
  isLoading: true,
};

export const ArchitectureContext = createContext<ArchitectureValue>(
  initialCombinedArchitectureContext
);

export const useArchitectureContext = () => useContext(ArchitectureContext);

export function ArchitectureContextProvider(
  props: React.PropsWithChildren<{}>
) {
  const { children } = props;

  const { stateContext } = useStateContext();

  const [architectureContext, setArchitectureContext] = useState(
    initialCombinedArchitectureContext
  );

  const queriedArchitectureData = useDashboardArchitecture({
    dashboardUrl: architectureContext.dashboardUrl,
    isAdmin: stateContext.authToken ? true : false,
    queryEnabled: architectureContext.queryEnabled,
  });

  if (
    queriedArchitectureData &&
    queriedArchitectureData.data &&
    architectureContext.queryEnabled
  ) {
    // architecture changed
    if (
      !isEqual(
        omit(queriedArchitectureData.data, ["apexSeries", "values"]),
        omit(architectureContext.initialArchitectureContext, [
          "apexSeries",
          "values",
        ])
      )
    ) {
      setArchitectureContext({
        ...architectureContext,
        initialArchitectureContext: cloneDeep(queriedArchitectureData.data),
        currentArchitectureContext: cloneDeep(queriedArchitectureData.data),
        isLoading: false,
      });
    }
    // only the chart data changed
    else if (
      !isEqual(
        architectureContext.currentArchitectureContext,
        queriedArchitectureData.data
      )
    ) {
      setArchitectureContext({
        ...architectureContext,
        currentArchitectureContext: cloneDeep(queriedArchitectureData.data),
        isLoading: false,
      });
    }
  }

  return (
    <ArchitectureContext.Provider
      value={{ architectureContext, setArchitectureContext }}
    >
      {children}
    </ArchitectureContext.Provider>
  );
}
