/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  authDataTypeEnum,
  visibilityEnum,
  reportThresholdTriggerTypeEnum,
  QueryData,
  menuArrowDirectionEnum,
  dashboardTypeEnum,
} from '.';

export type Dashboard = {
  id?: string | null;
  name: string | null;
  allowDataExport?: boolean;
  allowShare?: boolean;
  headlineColor?: string;
  icon: string | null;
  readRoles: string[] | null;
  type: dashboardTypeEnum | null;
  url: string | null;
  visibility: visibilityEnum;
  writeRoles: string[] | null;
};
export type DashboardWithContent = {
  id?: string | null;
  name: string | null;
  allowDataExport: boolean;
  allowShare: boolean;
  headlineColor?: string;
  icon: string | null;
  panels: PanelWithContent[];
  readRoles: string[] | null;
  type: dashboardTypeEnum | null;
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
  widgetData: any;
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
  widgetData: any;
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
  queryId: string;
  queryConfigId: string;
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
  decimalPlaces?: number;
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
  chartXAxisLabel?: string;
  chartYAxisLabel?: string;
  chartDateRepresentation?: string;
  chartHasAutomaticZoom?: boolean;
  chartHasAdditionalSelection?: boolean;
  isStepline?: boolean;
  setYAxisInterval?: boolean;
  chartYAxisScale?: number;
  chartYAxisScaleChartMinValue?: number;
  chartYAxisScaleChartMaxValue?: number;
  showTimeOnDatetimeValues?: boolean;
};

export type MapModalLegend = {
  icon: string;
  iconBackgroundColor: string;
  label: string;
};

export type Tab = {
  id?: string;
  chartAllowImageDownload?: boolean;
  chartDateRepresentation?: string;
  chartHasAutomaticZoom?: boolean;
  chartHasAdditionalSelection?: boolean;
  chartData?: ChartData[];
  chartLabels?: string[];
  chartLegendAlign?: string;
  chartMaximum?: number;
  chartMinimum?: number;
  chartPieRadius?: number;
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
  chartYAxisScale?: number | null;
  chartYAxisScaleChartMinValue?: number | null;
  chartYAxisScaleChartMaxValue?: number | null;
  chartHoverSingleValue: boolean;
  chartDynamicOnlyShowHover?: boolean;
  chartDynamicNoSelectionDisplayAll?: boolean;
  componentSubType?: string;
  componentType?: string;
  dataModelId?: string;
  decimalPlaces?: number;
  dynamicHighlightColor?: string;
  dynamicUnhighlightColor?: string;
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
  isStackedChart?: boolean;
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
  mapGeoJSON?: string;
  mapGeoJSONSensorBasedColors?: boolean;
  mapGeoJSONSensorBasedNoDataColor?: string;
  mapGeoJSONBorderColor?: string;
  mapGeoJSONFillColor?: string;
  mapGeoJSONFillOpacity?: number;
  mapGeoJSONSelectionBorderColor?: string;
  mapGeoJSONSelectionFillColor?: string;
  mapGeoJSONSelectionFillOpacity?: number;
  mapGeoJSONHoverBorderColor?: string;
  mapGeoJSONHoverFillColor?: string;
  mapGeoJSONHoverFillOpacity?: number;
  mapIsFormColorValueBased?: boolean;
  mapIsIconColorValueBased?: boolean;
  mapGeoJSONFeatureIdentifier?: string;
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
  mapCombinedWmsUrl?: string;
  mapWmsLayer?: string;
  mapCombinedWmsLayer?: string;
  mapUnitsTexts?: string[];
  listviewName?: string;
  listviewIsFilteringAllowed?: boolean;
  listviewFilterAttribute?: string;
  listviewShowAddress?: boolean;
  listviewAddressAttribute?: string;
  listviewShowContact?: boolean;
  listviewContactAttribute?: string;
  listviewShowImage?: boolean;
  listviewImageAttribute?: string;
  listviewShowCategory?: boolean;
  listviewCategoryAttribute?: string;
  listviewShowName?: boolean;
  listviewNameAttribute?: string;
  listviewShowContactName?: boolean;
  listviewContactNameAttribute?: string;
  listviewShowContactPhone?: boolean;
  listviewContactPhoneAttribute?: string;
  listviewShowParticipants?: boolean;
  listviewParticipantsAttribute?: string;
  listviewShowSupporter?: boolean;
  listviewSupporterAttribute?: string;
  listviewShowEmail?: boolean;
  listviewEmailAttribute?: string;
  listviewShowWebsite?: boolean;
  listviewWebsiteAttribute?: string;
  listviewShowDescription?: boolean;
  listviewDescriptionAttribute?: string;
  queryId?: string;
  rangeStaticValuesMin?: number[];
  rangeStaticValuesMax?: number[];
  rangeStaticValuesColors?: string[];
  rangeStaticValuesLogos?: string[];
  rangeStaticValuesLabels?: string[];
  setYAxisInterval?: boolean;
  setSortAscending: boolean;
  setSortDescending: boolean;
  setValueLimit: boolean;
  userDefinedLimit: number;
  showLegend?: boolean;
  sliderCurrentAttribute?: string;
  sliderMaximumAttribute?: string;
  textValue?: string;
  tiles?: number;
  tableFontColor?: string;
  tableHeaderColor?: string;
  tableOddRowColor?: string;
  tableEvenRowColor?: string;
  widgetId?: string;
  weatherWarnings?: WeatherWarningType[];
  chartStaticValuesText?: boolean;
  valuesToImages?: ValueToImageData[];
  sensorStatusValue?: number;
  sensorStatusLightCount?: number;
  sensorStatusMinThreshold?: string;
  sensorStatusMaxThreshold?: string;
  sensorStatusDefaultColor?: string;
  sensorStatusColor1?: string;
  sensorStatusColor2?: string;
  sensorStatusColor3?: string;
  sensorStatusLayoutVertical?: boolean;
  sensorStatusIsNumericType?: boolean;
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
  showInfoButtonsOnMobile: boolean;
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
  tableFontColor?: string;
  tableHeaderColor?: string;
  tableOddRowColor?: string;
  tableEvenRowColor?: string;
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

  // ListView styling
  listviewBackgroundColor: string;
  listviewItemBackgroundColor: string;
  listviewItemBorderColor: string;
  listviewItemBorderRadius: string;
  listviewItemBorderSize: string;
  listviewTitleFontColor: string;
  listviewTitleFontSize: string;
  listviewTitleFontWeight: string;
  listviewDescriptionFontColor: string;
  listviewDescriptionFontSize: string;
  listviewCounterFontColor: string;
  listviewCounterFontSize: string;
  listviewFilterButtonBackgroundColor: string;
  listviewFilterButtonBorderColor: string;
  listviewFilterButtonFontColor: string;
  listviewFilterButtonHoverBackgroundColor: string;
  listviewArrowIconColor: string;
  listviewBackButtonBackgroundColor: string;
  listviewBackButtonHoverBackgroundColor: string;
  listviewBackButtonFontColor: string;
  listviewMapButtonBackgroundColor: string;
  listviewMapButtonHoverBackgroundColor: string;
  listviewMapButtonFontColor: string;

  // Date Selector
  dateSelectorBorderColor: string;
  dateSelectorBackgroundColorSelected: string;
  dateSelectorFontColorSelected: string;
  dateSelectorFontColorUnselected: string;
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
  ngsildTenant?: string;
  ngsildContextUrl?: string;
  tenantAbbreviation: string;
  timeSeriesUrl: string;
  type: authDataTypeEnum;
  visibility?: visibilityEnum;
  grantType?: string;
  readRoles?: string[];
  writeRoles?: string[];
};

export type ChartData = {
  name: string;
  values: [string, number, string?][];
  color?: string;
  highlighted?: boolean;
  id?: string;
};

export type PieChartDataItem = {
  value: number;
  name: string;
  unit: string;
  itemStyle?: { color: string };
};

export type Mail = {
  to: string;
  subject: string;
  body: string;
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

export type InternalData = {
  id: string;
  source: string;
  collection: string;
  firstDataColIndex: number;
  firstDataRowIndex: number;
  timeGroupRowCount: number;
};

export type ValueToImageData = {
  min: string;
  max: string;
  imageId: string;
};

export type TabImage = {
  id?: string;
  tenantId: string | undefined;
  imageBase64: string;
  name: string;
};
