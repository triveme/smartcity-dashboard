import { Dashboard } from '.';

export type GroupingElement = {
  id?: string | null;
  name: string | null;
  url: string | null;
  icon: string | null;
  color: string | null;
  gradient: boolean | null;
  isDashboard: boolean | null;
  parentGroupingElementId: string | null;
  children?: GroupingElement[];
  position: number | null;
  tenantAbbreviation: string | null;
};

export type GroupingElementWithDashboards = {
  id?: string | null;
  name: string | null;
  url: string | null;
  icon: string | null;
  color: string | null;
  gradient: boolean | null;
  isDashboard: boolean | null;
  parentGroupingElementId: string | null;
  dashboards: Dashboard[] | null;
  children: GroupingElement[];
  position: number | null;
  tenantAbbreviation: string | null;
};
