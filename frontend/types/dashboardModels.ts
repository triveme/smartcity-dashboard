import {
  authDataTypeEnum,
  visibilityEnum,
  reportThresholdTriggerTypeEnum,
  QueryData,
} from '.';

export type Dashboard = {
  id?: string | null;
  name: string | null;
  url: string | null;
  icon: string | null;
  visibility: visibilityEnum;
  readRoles: string[] | null;
  writeRoles: string[] | null;
  type: string | null;
};
export type DashboardWithContent = {
  id?: string | null;
  name: string | null;
  url: string | null;
  icon: string | null;
  visibility: visibilityEnum;
  readRoles: string[] | null;
  writeRoles: string[] | null;
  panels: PanelWithContent[];
  type: string | null;
};

export type Panel = {
  id?: string;
  name: string;
  height: number;
  width: number;
  dashboardId?: string;
  position: number;
  info: string;
  generalInfo: string;
  showGeneralInfo: boolean;
};

export type PanelWithContent = {
  id?: string;
  name: string;
  height: number;
  width: number;
  position: number;
  dashboardId?: string;
  info: string;
  generalInfo: string;
  showGeneralInfo: boolean;
  widgets: WidgetWithContent[];
};

export type Widget = {
  id?: string;
  name: string;
  height: number;
  width: number;
  icon: string;
  visibility: visibilityEnum;
  readRoles: string[];
  writeRoles: string[];
};

export type WidgetWithContent = {
  id?: string;
  name: string;
  height: number;
  width: number;
  icon: string;
  visibility: visibilityEnum;
  readRoles: string[];
  writeRoles: string[];
  tabs: Tab[];
};

type Coordinate = [number, number];

type Position = {
  type: string;
  coordinates: Coordinate;
};

export type MapObject = {
  position: Position;
};

export type MapModalWidget = {
  componentType: string;
  componentSubType?: string;
  attributes: string;
  chartMinimum: number;
  chartMaximum: number;
  chartUnit: string;
  chartStaticValues?: number[];
  chartStaticValuesColors?: string[];
};

export type MapModalLegend = {
  icon: string;
  iconBackgroundColor: string;
  label: string;
};

export type Tab = {
  id?: string;
  componentType?: string;
  componentSubType?: string;
  chartMinimum?: number;
  chartMaximum?: number;
  chartUnit?: string;
  chartData?: ChartData[];
  chartValues?: number[];
  chartLabels?: string[];
  chartXAxisLabel?: string;
  chartYAxisLabel?: string;
  chartStaticValues?: number[];
  chartStaticValuesColors?: string[];
  chartStaticValuesTicks?: number[];
  chartStaticValuesLogos?: string[];
  chartStaticValuesTexts?: string[];
  isStepline?: boolean;
  mapAllowPopups?: boolean;
  mapAllowScroll?: boolean;
  mapAllowZoom?: boolean;
  mapAllowFilter?: boolean;
  mapFilterAttribute?: string;
  mapAllowLegend?: boolean;
  mapLegendValues?: MapModalLegend[];
  mapLegendDisclaimer?: string;
  mapMinZoom?: number;
  mapMaxZoom?: number;
  mapStandardZoom?: number;
  mapMarkerColor?: string;
  mapActiveMarkerColor?: string;
  mapMarkerIcon?: string;
  mapMarkerIconColor?: string;
  mapLongitude?: number;
  mapLatitude?: number;
  showLegend?: boolean;
  textValue?: string;
  decimalPlaces?: number;
  icon?: string;
  iconColor?: string;
  iconText?: string;
  iconUrl?: string;
  labelColor?: string;
  imageUrl?: string;
  imageSrc?: string;
  imageUpdateInterval?: number;
  iFrameUrl?: string;
  widgetId?: string;
  dataModelId?: string;
  queryId?: string;
  mapObject?: MapObject[];
  mapShapeOption?: string;
  mapDisplayMode?: string;
  mapShapeColor?: string;
  mapWidgetValues?: MapModalWidget[];
};

export type TabWithQuery = Tab & {
  query: {
    queryData: QueryData;
  };
};

export type ColorStage = {
  value: number;
  color: string;
};

export type WidgetToPanel = {
  widgetId: string;
  panelId: string;
  position: number;
};

export type DashboardToMenu = {
  dashboardId: string;
  groupingElementId: string;
};

export type Tenant = {
  id?: string;
  abbreviation?: string;
};

export type Logo = {
  id?: string;
  tenantId: string;
  logo: string;
  logoHeight: number;
  logoWidth: number;
  logoName: string;
  format: string;
  size: string;
};

export type SidebarLogo = {
  id?: string;
  tenantId: string;
  logo: string;
  logoHeight: number;
  logoWidth: number;
  order: number;
  logoName: string;
  format: string;
  size: string;
};

export type QueryConfig = {
  id?: string;
  dataSourceId: string;
  interval: number;
  fiwareService: string;
  fiwareServicePath: string;
  fiwareType: string;
  entityIds: string[];
  attributes: string[];
  aggrMode: string;
  hash?: string;
  createdAt?: string;
  updatedAt?: string;
  timeframe: string;
  isReporting?: boolean;
  aggrPeriod: string;
};

export type ReportConfig = {
  id?: string;
  queryId?: string;
  propertyName: string;
  threshold: string;
  trigger: reportThresholdTriggerTypeEnum;
  recipients: string[];
  mailText: string;
};

export type DataSource = {
  id?: string;
  name: string;
  authDataId: string;
  origin: string;
};

export type CorporateInfo = {
  id?: string;
  tenantId?: string;
  dashboardFontColor: string;
  dashboardPrimaryColor: string;
  dashboardSecondaryColor: string;
  fontColor: string;
  headerFontColor: string;
  headerLogo?: Logo;
  headerLogoId?: string;
  headerPrimaryColor: string;
  headerSecondaryColor: string;
  headerTitleAdmin: string;
  headerTitleDashboards: string;
  logo?: string;
  menuActiveColor: string;
  menuActiveFontColor: string;
  menuFontColor: string;
  menuHoverColor: string;
  menuLogo?: Logo;
  menuLogoId?: string;
  menuPrimaryColor: string;
  menuSecondaryColor: string;
  panelBorderColor: string;
  panelBorderRadius: string;
  panelBorderSize: string;
  panelFontColor: string;
  panelPrimaryColor: string;
  panelSecondaryColor: string;
  scrollbarBackground: string;
  scrollbarColor: string;
  saveButtonColor: string;
  saveHoverButtonColor: string;
  cancelButtonColor: string;
  cancelHoverButtonColor: string;
  showHeaderLogo: boolean;
  showMenuLogo: boolean;
  titleBar: string;
  useColorTransitionHeader: boolean;
  useColorTransitionMenu: boolean;
  widgetBorderColor: string;
  widgetBorderRadius: string;
  widgetBorderSize: string;
  widgetFontColor: string;
  widgetPrimaryColor: string;
  widgetSecondaryColor: string;
  sidebarLogos: SidebarLogo[];
};

export type WidgetWithChildren = {
  widget: Widget;
  tab: Tab;
  queryConfig?: QueryConfig;
  reportConfig?: ReportConfig;
};

export type AuthData = {
  id?: string;
  tenantAbbreviation: string;
  name: string;
  type: authDataTypeEnum;
  clientId: string;
  clientSecret: string;
  appUser: string;
  appUserPassword: string;
  apiToken: string;
  authUrl: string;
  liveUrl: string;
  timeSeriesUrl: string;
  apiUrl?: string;
  visibility?: visibilityEnum;
  readRoles?: string[];
  writeRoles?: string[];
};

export type ChartData = {
  name: string;
  values: number[];
  color?: string;
};

export type Mail = {
  to: string;
  subject: string;
  body: string;
};

export type MapModalChartStyle = {
  dashboardSecondaryColor: string;
  dashboardFontColor: string;
};
