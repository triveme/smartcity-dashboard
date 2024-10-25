import { Dashboard } from '.';

export type GroupingElement = {
  id?: string | null;
  name: string | null;
  backgroundColor: string | null;
  children?: GroupingElement[];
  fontColor: string;
  gradient: boolean | null;
  icon: string | null;
  isDashboard: boolean | null;
  parentGroupingElementId: string | null;
  position: number | null;
  tenantAbbreviation: string | null;
  url: string | null;
};

export type GroupingElementWithDashboards = {
  id?: string | null;
  name: string | null;
  backgroundColor: string | null;
  children: GroupingElement[];
  dashboards: Dashboard[] | null;
  fontColor: string;
  gradient: boolean | null;
  icon: string | null;
  isDashboard: boolean | null;
  parentGroupingElementId: string | null;
  position: number | null;
  tenantAbbreviation: string | null;
  url: string | null;
};
