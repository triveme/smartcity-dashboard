import { useQuery } from "react-query";

import { DashboardComponent } from "components/dashboard";

import { client } from "clients/client";

export type ArchitectureRequestData = {
  dashboardUrl: string;
  isAdmin: boolean;
  queryEnabled: boolean;
};

export async function getDashboardArchitecture(args: ArchitectureRequestData) {
  return client
    .get(
      "/dashboards" +
        (args.dashboardUrl.length > 0 ? "/" + args.dashboardUrl : ""),
      {
        headers: {
          "Is-Admin": args.isAdmin,
        },
      }
    )
    .then((response) => {
      console.log(response.data);
      return response.data;
    })
    .catch((err) => {
      console.log(err);
      return [];
    });
}

export function useDashboardArchitecture(args: ArchitectureRequestData) {
  const result = useQuery({
    queryKey: ["dashboardArchitecture", args],
    queryFn: () => getDashboardArchitecture(args),
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    keepPreviousData: true,
    placeholderData: [],
    enabled: args.queryEnabled,
  });

  return { ...result };
}

export type ArchitecturePostData = {
  token: string;
  dashboards: (DashboardComponent | { _id: string })[];
};

export async function postArchitecture(args: ArchitecturePostData) {
  return client
    .post("/dashboards", args.dashboards, {
      headers: {
        "x-access-token": args.token,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      console.log(err);
    });
}
