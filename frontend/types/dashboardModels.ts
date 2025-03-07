import {
  authDataTypeEnum,
  visibilityEnum,
  reportThresholdTriggerTypeEnum,
  QueryData,
  menuArrowDirectionEnum,
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
  icon?: string;
  info: string;
  jumpoffIcon?: string;
  jumpoffLabel?: string;
  jumpoffUrl?: string;
  position: number;
  showGeneralInfo: boolean;
  showJumpoffButton: boolean;
  openJumpoffLinkInNewTab: boolean;
  width: number;
};

export type PanelWithContent = {
  id?: string;
  name: string;
  dashboardId?: string;
  generalInfo: string;
  headlineColor: string;
  height: number;
  icon?: string;
  info: string;
  jumpoffIcon?: string;
  jumpoffLabel?: string;
  jumpoffUrl?: string;
  position: number;
  showGeneralInfo: boolean;
  showJumpoffButton: boolean;
  openJumpoffLinkInNewTab: boolean;
  widgets: WidgetWithContent[];
  width: number;
};

export type Widget = {
  id?: string;
  name: string;
  description: string;
  subheadline: string;
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
  description: string;
  subheadline: string;
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

export type WidgetWithComponentTypes = {
  id: string;
  name: string;
  description: string;
  visibility: string;
  componentType: string;
  componentSubType: string;
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
  title?: string;
  componentType: string;
  componentSubType?: string;
  attributes: string;
  tiles: number;
  chartMinimum: number;
  chartMaximum: number;
  chartUnit: string;
  chartStaticValues?: number[];
  chartStaticValuesColors?: string[];
  chartStaticValuesTexts?: string[];
  chartStaticValuesLogos?: string[];
  dataSource?: number;
  imageUrl?: string;
  textValue?: string;
  icon?: string;
  iconColor?: string;
  iconText?: string;
  iconUrl?: string;
  showAxisLabels?: boolean;
  jumpoffIcon?: string;
  jumpoffLabel?: string;
  jumpoffUrl?: string;
  jumpoffAttribute?: string;
  openJumpoffLinkInNewTab?: boolean;
};

export type MapModalLegend = {
  icon: string;
  iconBackgroundColor: string;
  label: string;
};

export type Tab = {
  id?: string;
  chartHasAdditionalSelection?: boolean;
  chartData?: ChartData[];
  chartLabels?: string[];
  chartLegendAlign?: string;
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
  imageAllowJumpoff?: boolean;
  imageJumpoffUrl?: string;
  isStepline?: boolean;
  isLayoutVertical?: boolean;
  labelColor?: string;
  mapActiveMarkerColor?: string;
  mapAllowFilter?: boolean;
  mapAllowLegend?: boolean;
  mapAllowPopups?: boolean;
  mapAllowScroll?: boolean;
  mapAllowZoom?: boolean;
  mapAttributeForValueBased?: string;
  mapFormSizeFactor?: number;
  mapDisplayMode?: string;
  mapFilterAttribute?: string;
  mapIsFormColorValueBased?: boolean;
  mapIsIconColorValueBased?: boolean;
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
  mapWmsUrl?: string;
  mapWmsLayer?: string;
  queryId?: string;
  rangeStaticValuesMin?: number[];
  rangeStaticValuesMax?: number[];
  rangeStaticValuesColors?: string[];
  rangeStaticValuesLogos?: string[];
  rangeStaticValuesLabels?: string[];
  showLegend?: boolean;
  sliderCurrentAttribute?: string;
  sliderMaximumAttribute?: string;
  textValue?: string;
  tiles?: number;
  widgetId?: string;
  weatherWarnings?: WeatherWarningType[];
};

export type TabWithQuery = Tab & {
  query: {
    queryData: QueryData[];
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

  barChartAxisLabelFontColor: string;
  barChartAxisLabelSize: string;
  barChartAxisLineColor: string;
  barChartAxisTicksFontSize: string;
  barChartCurrentValuesColors: string[];
  barChartFilterColor: string;
  barChartFilterTextColor: string;
  barChartGridColor: string;
  barChartLegendFontColor: string;
  barChartLegendFontSize: string;
  barChartTicksFontColor: string;

  cancelButtonColor: string;
  cancelHoverButtonColor: string;
  coloredSliderArrowColor: string;
  coloredSliderBigValueFontColor: string;
  coloredSliderBigValueFontSize: string;
  coloredSliderLabelFontColor: string;
  coloredSliderLabelFontSize: string;
  coloredSliderUnitFontSize: string;
  dashboardFontColor: string;
  dashboardHeadlineFontSize: string;
  dashboardPrimaryColor: string;
  dashboardSecondaryColor: string;
  degreeChart180BgColor: string;
  degreeChart180FillColor: string;
  degreeChart180FontColor: string;
  degreeChart180FontSize: string;
  degreeChart180UnitFontSize: string;
  degreeChart360BgColor: string;
  degreeChart360FillColor: string;
  degreeChart360FontColor: string;
  degreeChart360FontSize: string;
  degreeChart360UnitFontSize: string;
  fontColor: string;
  fontFamily: string;
  headerFontColor: string;
  headerLogo?: Logo;
  headerLogoId?: string | null;
  headerPrimaryColor: string;
  headerSecondaryColor: string;
  headerTitleAdmin: string;
  headerTitleDashboards: string;
  iconWithLinkFontColor: string;
  iconWithLinkFontSize: string;
  iconWithLinkIconColor: string;
  iconWithLinkIconSize: string;
  informationTextFontColor: string;
  informationTextFontSize: string;
  isPanelHeadlineBold: boolean;
  isWidgetHeadlineBold: boolean;

  lineChartAxisLabelFontColor: string;
  lineChartAxisLabelSize: string;
  lineChartAxisLineColor: string;
  lineChartAxisTicksFontSize: string;
  lineChartCurrentValuesColors: string[];
  lineChartFilterColor: string;
  lineChartFilterTextColor: string;
  lineChartGridColor: string;
  lineChartLegendFontColor: string;
  lineChartLegendFontSize: string;
  lineChartTicksFontColor: string;

  logo?: string;
  measurementChartAxisLabelFontColor: string;
  measurementChartAxisLineColor: string;
  measurementChartAxisTicksFontColor: string;
  measurementChartBarColor: string;
  measurementChartBigValueFontColor: string;
  measurementChartBigValueFontSize: string;
  measurementChartCardsBgColor: string;
  measurementChartCardsFontColor: string;
  measurementChartCardsIconColors: string[];
  measurementChartCurrentValuesColors: string[];
  measurementChartGridColor: string;
  measurementChartLabelFontColor: string;
  measurementChartTopButtonBgColor: string;
  measurementChartTopButtonFontColor: string;
  measurementChartTopButtonHoverColor: string;
  measurementChartTopButtonInactiveBgColor: string;
  menuActiveColor: string;
  menuActiveFontColor: string;
  menuArrowDirection: menuArrowDirectionEnum;
  menuCornerColor: string;
  menuCornerFontColor: string;
  menuFontColor: string;
  menuHoverColor: string;
  menuHoverFontColor: string;
  menuLogo?: Logo;
  menuLogoId?: string;
  menuPrimaryColor: string;
  menuSecondaryColor: string;
  panelBorderColor: string;
  panelBorderRadius: string;
  panelBorderSize: string;
  panelFontColor: string;
  panelHeadlineFontSize: string;
  panelPrimaryColor: string;
  panelSecondaryColor: string;
  pieChartFontColor: string;
  pieChartFontSize: string;
  pieChartCurrentValuesColors: string[];
  saveButtonColor: string;
  saveHoverButtonColor: string;
  scrollbarBackground: string;
  scrollbarColor: string;
  showHeaderLogo: boolean;
  showMenuLogo: boolean;
  sidebarLogos: SidebarLogo[];
  sliderCurrentFontColor: string;
  sliderMaximumFontColor: string;
  sliderGeneralFontColor: string;
  sliderCurrentColor: string;
  sliderMaximumColor: string;
  stageableChartFontColor: string;
  stageableChartFontSize: string;
  stageableChartTicksFontColor: string;
  stageableChartTicksFontSize: string;
  titleBar: string;
  useColorTransitionHeader: boolean;
  useColorTransitionMenu: boolean;

  weatherWarningBgColor: string;
  weatherWarningHeadlineColor: string;
  weatherInstructionsColor: string;
  weatherAlertDescriptionColor: string;
  weatherDateColor: string;
  weatherWarningButtonBackgroundColor: string;
  weatherWarningButtonIconColor: string;

  wertFontColor: string;
  wertFontSize: string;
  wertUnitFontSize: string;
  widgetBorderColor: string;
  widgetBorderRadius: string;
  widgetBorderSize: string;
  widgetFontColor: string;
  widgetHeadlineFontSize: string;
  widgetSubheadlineFontSize: string;
  widgetPrimaryColor: string;
  widgetSecondaryColor: string;
};

export type WidgetWithChildren = {
  widget: Widget;
  tab: Tab;
  queryConfig?: QueryConfig;
  reportConfig?: ReportConfig;
  datasource?: DataSource;
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
  degreeChart180BgColor: string;
  degreeChart180FillColor: string;
  degreeChart180FontColor: string;
  degreeChart180FontSize: string;
  degreeChart180UnitFontSize: string;
  stageableChartFontColor: string;
  stageableChartFontSize: string;
  stageableChartTicksFontColor: string;
  stageableChartTicksFontSize: string;
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
  allowThemeSwitching: boolean;
  disclaimer: string;
};

export type WeatherWarningType = {
  category: string;
  subCategory: string;
  severity: number;
  instructions: string;
  alertDescription: string;
  validFrom: string;
  validTo: string;
};
