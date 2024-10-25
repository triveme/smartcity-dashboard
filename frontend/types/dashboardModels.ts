import {
  authDataTypeEnum,
  visibilityEnum,
  reportThresholdTriggerTypeEnum,
  QueryData,
} from '.';

export type Dashboard = {
  id?: string | null;
  name: string | null;
  allowDataExport?: boolean;
  headlineColor?: string;
  icon: string | null;
  readRoles: string[] | null;
  type: string | null;
  url: string | null;
  visibility: visibilityEnum;
  writeRoles: string[] | null;
};
export type DashboardWithContent = {
  id?: string | null;
  name: string | null;
  allowDataExport: boolean;
  headlineColor?: string;
  icon: string | null;
  panels: PanelWithContent[];
  readRoles: string[] | null;
  type: string | null;
  url: string | null;
  visibility: visibilityEnum;
  writeRoles: string[] | null;
};

export type Panel = {
  id?: string;
  name: string;
  dashboardId?: string;
  generalInfo: string;
  headlineColor: string;
  height: number;
  info: string;
  jumpoffIcon?: string;
  jumpoffLabel?: string;
  jumpoffUrl?: string;
  position: number;
  showGeneralInfo: boolean;
  showJumpoffButton: boolean;
  width: number;
};

export type PanelWithContent = {
  id?: string;
  name: string;
  dashboardId?: string;
  generalInfo: string;
  headlineColor: string;
  height: number;
  info: string;
  jumpoffIcon?: string;
  jumpoffLabel?: string;
  jumpoffUrl?: string;
  position: number;
  showGeneralInfo: boolean;
  showJumpoffButton: boolean;
  widgets: WidgetWithContent[];
  width: number;
};

export type Widget = {
  id?: string;
  name: string;
  allowDataExport: boolean;
  allowShare: boolean;
  headlineColor: string;
  height: number;
  icon: string;
  readRoles: string[];
  showName?: boolean;
  visibility: visibilityEnum;
  width: number;
  writeRoles: string[];
};

export type WidgetWithContent = {
  id?: string;
  name: string;
  allowShare: boolean;
  headlineColor: string;
  height: number;
  icon: string;
  readRoles: string[];
  showName?: boolean;
  visibility: visibilityEnum;
  width: number;
  writeRoles: string[];
  allowDataExport: boolean;
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
  tiles: number;
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
  chartData?: ChartData[];
  chartLabels?: string[];
  chartMaximum?: number;
  chartMinimum?: number;
  chartStaticValues?: number[];
  chartStaticValuesColors?: string[];
  chartStaticValuesLogos?: string[];
  chartStaticValuesTexts?: string[];
  chartStaticValuesTicks?: number[];
  chartUnit?: string;
  chartValues?: number[];
  chartXAxisLabel?: string;
  chartYAxisLabel?: string;
  childWidgets?: string[];
  componentSubType?: string;
  componentType?: string;
  dataModelId?: string;
  decimalPlaces?: number;
  icon?: string;
  iconColor?: string;
  iconText?: string;
  iconUrl?: string;
  iFrameUrl?: string;
  imageSrc?: string;
  imageUpdateInterval?: number;
  imageUrl?: string;
  isStepline?: boolean;
  labelColor?: string;
  mapActiveMarkerColor?: string;
  mapAllowFilter?: boolean;
  mapAllowLegend?: boolean;
  mapAllowPopups?: boolean;
  mapAllowScroll?: boolean;
  mapAllowZoom?: boolean;
  mapDisplayMode?: string;
  mapFilterAttribute?: string;
  mapLatitude?: number;
  mapLegendDisclaimer?: string;
  mapLegendValues?: MapModalLegend[];
  mapLongitude?: number;
  mapMarkerColor?: string;
  mapMarkerIcon?: string;
  mapMarkerIconColor?: string;
  mapMaxZoom?: number;
  mapMinZoom?: number;
  mapObject?: MapObject[];
  mapShapeColor?: string;
  mapShapeOption?: string;
  mapStandardZoom?: number;
  mapWidgetValues?: MapModalWidget[];
  queryId?: string;
  showLegend?: boolean;
  sliderCurrentAttribute?: string;
  sliderMaximumAttribute?: string;
  textValue?: string;
  tiles?: number;
  widgetId?: string;
};

export type TabWithQuery = Tab & {
  query: {
    queryData: QueryData;
  };
};

export type TabWithCombinedWidgets = Tab & {
  combinedWidgets: WidgetWithContent[];
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
  collections: string[];
  origin: string;
};

export type CorporateInfo = {
  id?: string;
  tenantId?: string;
  dashboardFontColor: string;
  dashboardPrimaryColor: string;
  dashboardSecondaryColor: string;
  fontColor: string;
  fontFamily: string;
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
  apiToken: string;
  apiUrl?: string;
  appUser: string;
  appUserPassword: string;
  authUrl: string;
  clientId: string;
  clientSecret: string;
  collections?: string[];
  fiwareServices?: string[];
  liveUrl: string;
  name: string;
  tenantAbbreviation: string;
  timeSeriesUrl: string;
  type: authDataTypeEnum;
  visibility?: visibilityEnum;
  readRoles?: string[];
  writeRoles?: string[];
};

export type ChartData = {
  name: string;
  values: [string, number][];
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

export type SliderOverviewType = {
  name: string;
  capacityMax: number;
  capacityCurrent: number;
};

export type GeneralSettings = {
  id: string | undefined;
  tenant: string | undefined;
  information: string;
  imprint: string;
  privacy: string;
};
