import { DashboardComponent } from "components/dashboard";
import { PanelComponent } from "components/panel";
import { TabComponent } from "components/tab";
import { WidgetComponent } from "components/widget";
import { NIL as NIL_UUID } from "uuid";

import colors from "theme/colors";

export const initialTab: TabComponent = {
  _id: "",
  name: "Tab",
  uid: NIL_UUID,
  type: "description",
  text: "",
  apexType: "donut",
  apexSeries: [],
  apexOptions: {
    grid: {
      borderColor: colors.widgetBackground,
    },
    yaxis: {
      forceNiceScale: true,
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      opacity: 1,
    },
    chart: {
      toolbar: {
        show: false,
      },
      background: colors.panelBackground,
    },
    theme: {
      mode: "dark",
    },
    colors: [colors.attributeColors[0]],
  },
  apexMaxValue: 100,
  apexMaxAlias: "",
  apexMaxColor: colors.attributeColors[0],
  timeframe: 0,
  fiwareService: "",
  entityId: [],
  attribute: {
    keys: [],
    aliases: [],
  },
  filterValues: [],
  filterProperty: "keine",
  filterAttribute: "",
  values: [],
  decimals: 0,
  attributeType: "old",
  aggrMode: "single",
  componentType: "",
  componentData: [],
  componentDataType: "",
  componentName: "",
  componentDescription: "",
  componentIcon: "",
  componentMinimum: 0,
  componentMaximum: 0,
  componentWarning: 0,
  componentAlarm: 0,
  componentUnit: "",
  componentValue: 0,
};

export const initialPanel: PanelComponent = {
  _id: "",
  name: "",
  uid: NIL_UUID,
  width: 6,
  height: 300,
  tabs: [{ ...initialTab }],
};

export const initialWidget: WidgetComponent = {
  _id: "",
  name: "",
  uid: NIL_UUID,
  width: 12,
  height: 400,
  widgetIcon: "",
  tabIcons: [],
  infoHeadline: "Info Überschrift",
  infoText: "Infotext",
  infoLinks: [],
  panels: []
};

export const initialDashboard: DashboardComponent = {
  _id: "",
  name: "",
  uid: NIL_UUID,
  url: "",
  icon: "",
  visible: true,
  widgets: [],
};
