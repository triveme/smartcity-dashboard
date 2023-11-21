import { InferSchemaType, Schema, Types, model } from "mongoose";
import { IQueryData } from "./querydata.model";
import { IInfoLink, infoLinkSchema } from "./link.model";

interface ITab {
  id?: string;
  name?: string;
  type?: string;
  text?: string;
  apexType?: string;
  apexOptions?: any;
  apexSeries?: any[];
  apexMaxValue?: number;
  apexMaxAlias?: string;
  apexMaxColor?: string;
  componentType?: string;
  componentDataType?: string;
  componentData?: any[];
  componentName?: string;
  componentDescription?: string;
  componentIcon?: string;
  componentMinimum?: number;
  componentMaximum?: number;
  componentWarning?: number;
  componentAlarm?: number;
  componentOptions?: any;
  componentUnit?: string;
  componentValue?: number;
  donutToTotalLabel?: boolean;
  timeframe?: number;
  fiwareService?: string;
  fiwareType?: string;
  entityId?: string[];
  queryUpdateMsg?: string;
  attribute?: { keys: string[]; aliases: string[] };
  filterProperty?: string;
  filterAttribute?: string;
  filterValues?: string[];
  values?: number[];
  decimals?: number;
  attributeType?: string;
  aggrMode?: string;
  queryData?: IQueryData;
}

interface IPanel {
  name?: string;
  width?: number;
  height?: number;
  tabs: ITab[];
}

interface IWidget {
  name?: string;
  width?: number;
  height?: number;
  widgetIcon?: string;
  tabIcons?: string[];
  infoHeadline?: string;
  infoText?: string;
  infoLinks?: IInfoLink[];
  panels: IPanel[];
}

interface IDashboard {
  _id?: string;
  index?: number;
  name?: string;
  url?: string;
  icon?: string;
  visible?: boolean;
  roles?: {
    read: { type: [String]; default: [] };
    write: { type: [String]; default: [] };
  };
  widgets?: IWidget[];
}

const tabSchema: Schema<ITab> = new Schema({
  name: String,
  type: String,
  text: String,
  apexType: String,
  apexOptions: {},
  apexSeries: [{}],
  apexMaxValue: Number,
  apexMaxAlias: String,
  apexMaxColor: String,
  componentType: String,
  componentDataType: String,
  componentData: [],
  componentName: String,
  componentDescription: String,
  componentIcon: String,
  componentMinimum: Number,
  componentMaximum: Number,
  componentWarning: Number,
  componentAlarm: Number,
  componentOptions: {},
  componentUnit: String,
  componentValue: Number,
  donutToTotalLabel: Boolean,
  timeframe: Number,
  fiwareService: String,
  fiwareType: String,
  entityId: [String],
  queryUpdateMsg: String,
  attribute: {
    keys: [String],
    aliases: [String],
  },
  filterProperty: String,
  filterAttribute: String,
  filterValues: [String],
  values: [Number],
  decimals: Number,
  attributeType: String,
  aggrMode: String,
  queryData: {
    _id: {
      type: Schema.Types.ObjectId,
      ref: "Querydata",
    },
  },
});

const panelSchema: Schema<IPanel> = new Schema({
  name: String,
  width: Number,
  height: Number,
  tabs: [tabSchema],
});

const widgetSchema: Schema<IWidget> = new Schema({
  name: String,
  width: Number,
  height: Number,
  widgetIcon: String,
  tabIcons: [String],
  infoHeadline: String,
  infoText: String,
  infoLinks: [infoLinkSchema],
  panels: [panelSchema],
});

const dashboardSchema: Schema<IDashboard> = new Schema({
  _id: {
    type: Types.ObjectId,
    required: true,
    auto: true,
  },
  index: Number,
  name: String,
  url: String,
  icon: String,
  visible: { type: Boolean, default: true },
  roles: {
    read: {
      type: [String],
      default: [],
    },
    write: {
      type: [String],
      default: [],
    },
  },
  widgets: [widgetSchema],
});

type Dashboard = InferSchemaType<typeof dashboardSchema>;
type Tab = InferSchemaType<typeof tabSchema>;
type Widget = InferSchemaType<typeof widgetSchema>;
type Panel = InferSchemaType<typeof panelSchema>;

const DashboardModel = model<Dashboard>("Dashboard", dashboardSchema);
const TabModel = model<Tab>("Tab", tabSchema);

export { IDashboard, ITab, Dashboard, DashboardModel, TabModel, Tab, Widget, Panel };
