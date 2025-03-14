import { Marker } from '@/components/Map/Map';
import {
  aggregationEnum,
  CorporateInfo,
  aggregationPeriodEnum,
  Panel,
  QueryConfig,
  ReportConfig,
  timeframeEnum,
  visibilityEnum,
  Widget,
  MapModalWidget,
  reportThresholdTriggerTypeEnum,
  MapModalLegend,
  ChartData,
  menuArrowDirectionEnum,
} from '@/types';

export const EMPTY_PANEL: Panel = {
  name: '',
  width: 12,
  height: 400,
  position: 1,
  icon: '',
  info: '',
  generalInfo: '',
  showGeneralInfo: false,
  showJumpoffButton: false,
  openJumpoffLinkInNewTab: true,
  jumpoffLabel: '',
  jumpoffIcon: '',
  jumpoffUrl: '',
  headlineColor: '',
};

export const EMPTY_WIDGET: Widget = {
  name: '',
  description: '',
  showName: true,
  subheadline: '',
  height: 200,
  width: 4,
  icon: '',
  allowDataExport: false,
  allowShare: false,
  headlineColor: '',
  visibility: visibilityEnum.public,
  readRoles: [],
  writeRoles: [],
};

export const EMPTY_QUERY_CONFIG: QueryConfig = {
  fiwareType: '',
  fiwareService: '',
  fiwareServicePath: '/',
  attributes: [],
  entityIds: [],
  dataSourceId: '',
  interval: 60,
  aggrMode: aggregationEnum.none,
  aggrPeriod: aggregationPeriodEnum.hour,
  timeframe: timeframeEnum.day,
};

export const EMPTY_MAP_MODAL_WIDGET: MapModalWidget = {
  componentType: '',
  componentSubType: '',
  attributes: '',
  tiles: 5,
  chartMinimum: 0,
  chartMaximum: 0,
  chartUnit: '',
  chartStaticValues: [],
  chartStaticValuesColors: [],
  chartStaticValuesTexts: [],
  chartStaticValuesLogos: [],
  imageUrl: '',
  jumpoffAttribute: '',
  jumpoffIcon: '',
  jumpoffLabel: '',
  jumpoffUrl: '',
};

export const DEFAULT_MAP_MODAL_LEGEND: MapModalLegend = {
  icon: 'ChevronLeft',
  iconBackgroundColor: '#71A273',
  label: '',
};

export const DEFAULT_CI: CorporateInfo = {
  dashboardFontColor: '#FFF',
  dashboardPrimaryColor: '#2D3244',
  dashboardSecondaryColor: '#3D4760',
  dashboardHeadlineFontSize: '24px',
  fontColor: '#FFF',
  fontFamily: 'Arial',
  headerFontColor: '#FFF',
  headerPrimaryColor: '#2B3244',
  headerSecondaryColor: '#3D4760',
  headerTitleAdmin: 'Smart Region Dashboard',
  headerTitleDashboards: 'Dashboards',
  menuActiveColor: '#1D2330',
  menuActiveFontColor: '#FFF',
  menuArrowDirection: menuArrowDirectionEnum.TopDown,
  menuCornerColor: '#3D4760',
  menuCornerFontColor: '#fff',
  menuFontColor: '#fff',
  menuHoverColor: '#2B3244',
  menuHoverFontColor: '#2B3244',
  menuPrimaryColor: '#3D4760',
  menuSecondaryColor: '#1d2330',
  panelBorderColor: '#3D4760',
  panelBorderRadius: '4px',
  panelBorderSize: '4px',
  panelFontColor: '#fff',
  panelPrimaryColor: '#3D4760',
  panelSecondaryColor: '#3D4760',
  panelHeadlineFontSize: '24px',
  scrollbarColor: '#3D4760',
  scrollbarBackground: '#3D4760',
  saveButtonColor: '#91D9FF',
  saveHoverButtonColor: '#82C3E5',
  cancelButtonColor: '#8388A4',
  cancelHoverButtonColor: '#6C7188',
  showHeaderLogo: false,
  showMenuLogo: false,
  titleBar: '',
  useColorTransitionHeader: false,
  useColorTransitionMenu: false,
  widgetBorderColor: '#3D4760',
  widgetBorderRadius: '4px',
  widgetBorderSize: '4px',
  widgetFontColor: '#fff',
  widgetHeadlineFontSize: '16px',
  widgetSubheadlineFontSize: '14px',
  widgetPrimaryColor: '#3D4760',
  widgetSecondaryColor: '#3D4760',
  sidebarLogos: [],
  informationTextFontSize: '11',
  informationTextFontColor: '#3D4760',
  iconWithLinkFontSize: '11',
  iconWithLinkFontColor: '#3D4760',
  iconWithLinkIconSize: '11',
  iconWithLinkIconColor: '#3D4760',
  isPanelHeadlineBold: true,
  isWidgetHeadlineBold: true,
  degreeChart180FontSize: '11',
  degreeChart180FontColor: '#3D4760',
  degreeChart180BgColor: '#3D4760',
  degreeChart180FillColor: '#3D4760',
  degreeChart180UnitFontSize: '11',
  degreeChart360FontSize: '11',
  degreeChart360FontColor: '#3D4760',
  degreeChart360BgColor: '#3D4760',
  degreeChart360FillColor: '#3D4760',
  degreeChart360UnitFontSize: '11',
  sliderCurrentFontColor: '#000000',
  sliderMaximumFontColor: '#FFFFFF',
  sliderGeneralFontColor: '#FFFFFF',
  sliderCurrentColor: '#DC2626',
  sliderMaximumColor: '#000000',
  stageableChartTicksFontSize: '11',
  stageableChartTicksFontColor: '#3D4760',
  stageableChartFontSize: '11',
  stageableChartFontColor: '#3D4760',
  pieChartFontSize: '11',
  pieChartFontColor: '#3D4760',
  pieChartCurrentValuesColors: [
    '#4CAF50',
    '#2196F3',
    '#FF9800',
    '#F44336',
    '#9C27B0',
  ],
  lineChartAxisTicksFontSize: '11',
  lineChartAxisLabelSize: '11',
  lineChartAxisLabelFontColor: '#3D4760',
  lineChartFilterColor: '#F1B434',
  lineChartFilterTextColor: '#1D2330',
  lineChartLegendFontSize: '11',
  lineChartLegendFontColor: '#FFFFF',
  lineChartTicksFontColor: '#3D4760',
  lineChartAxisLineColor: '#3D4760',
  lineChartCurrentValuesColors: [
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
  ],
  lineChartGridColor: '#3D4760',
  barChartAxisTicksFontSize: '11',
  barChartAxisLabelSize: '11',
  barChartAxisLabelFontColor: '#FFFFFF',
  barChartLegendFontSize: '11',
  barChartLegendFontColor: '#FFFFFF',
  barChartTicksFontColor: '#3D4760',
  barChartAxisLineColor: '#3D4760',
  barChartCurrentValuesColors: [
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
  ],
  barChartFilterColor: '#F1B434',
  barChartFilterTextColor: '#1D2330',
  barChartGridColor: '#3D4760',
  measurementChartBigValueFontSize: '11',
  measurementChartBigValueFontColor: '#3D4760',
  measurementChartTopButtonBgColor: '#3D4760',
  measurementChartTopButtonInactiveBgColor: '#3D4760',
  measurementChartTopButtonHoverColor: '#3D4760',
  measurementChartTopButtonFontColor: '#3D4760',
  measurementChartCardsBgColor: '#3D4760',
  measurementChartCardsFontColor: '#3D4760',
  measurementChartCardsIconColors: ['#3D4760', '#3D4760', '#3D4760'],
  measurementChartBarColor: '#3D4760',
  measurementChartLabelFontColor: '#3D4760',
  measurementChartGridColor: '#3D4760',
  measurementChartAxisLineColor: '#3D4760',
  measurementChartAxisTicksFontColor: '#3D4760',
  measurementChartAxisLabelFontColor: '#3D4760',
  measurementChartCurrentValuesColors: [
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
    '#3D4760',
  ],
  coloredSliderBigValueFontSize: '11',
  coloredSliderBigValueFontColor: '#3D4760',
  coloredSliderLabelFontSize: '11',
  coloredSliderLabelFontColor: '#3D4760',
  coloredSliderArrowColor: '#3D4760',
  coloredSliderUnitFontSize: '11',
  wertFontSize: '20',
  wertUnitFontSize: '15',
  wertFontColor: '#FFFFF',

  weatherWarningBgColor: '#3D4760',
  weatherWarningHeadlineColor: '#E74C3C',
  weatherInstructionsColor: '#000000',
  weatherAlertDescriptionColor: '#000000',
  weatherDateColor: '#FFFFF',
  weatherWarningButtonBackgroundColor: '#2C3E50',
  weatherWarningButtonIconColor: '#FFFFF',
};

export const EMPTY_REPORT_CONFIG: ReportConfig = {
  propertyName: '',
  threshold: '',
  trigger: reportThresholdTriggerTypeEnum.exceeding,
  recipients: [],
  mailText: '',
};

export const DEFAULT_MARKERS: Marker[] = [
  {
    position: [50.61078589279524, 9.705162007336277],
    title: 'Marker 1',
    details: {
      name: 'Location One',
      city: 'City One',
      country: 'Country One',
      established: 'Year One',
      area: 'Area One',
      visitors: 'Visitors One',
    },
    color: '#FFFF88',
  },
  {
    position: [50.55660139484508, 9.600378203143238],
    title: 'Marker 2',
    details: {
      name: 'Location Two',
      city: 'City Two',
      country: 'Country Two',
      established: 'Year Two',
      area: 'Area Two',
      visitors: 'Visitors Two',
    },
    color: '#FF44FF',
  },
  {
    position: [52.42857366923087, 13.519934059363427],
    title: 'Marker 3',
    details: {
      name: 'Location Three',
      city: 'City Three',
      country: 'Country Three',
      established: 'Year Three',
      area: 'Area Three',
      visitors: 'Visitors Three',
    },
    color: '#000000',
  },
];

export const DUMMY_CHART_DATA: ChartData[] = [
  {
    name: 'Series-1 | Temperature',
    values: [
      ['2024-01-11', 14],
      ['2024-01-12', 93],
      ['2024-01-13', 28],
      ['2024-01-14', 36],
      ['2024-01-15', 77],
      ['2024-01-16', 60],
      ['2024-01-17', 49],
      ['2024-01-18', 85],
      ['2024-01-19', 25],
      ['2024-01-20', 50],
      ['2024-01-20', 68],
    ],
  },
  {
    name: 'Series-2 | Temperature',
    values: [
      ['2024-01-11', 8],
      ['2024-01-12', 67],
      ['2024-01-13', 32],
      ['2024-01-14', 47],
      ['2024-01-15', 85],
      ['2024-01-16', 24],
      ['2024-01-17', 13],
      ['2024-01-18', 54],
      ['2024-01-19', 79],
      ['2024-01-20', 19],
      ['2024-01-20', 76],
    ],
  },
  {
    name: 'Series-3 | Temperature',
    values: [
      ['2024-01-11', 31],
      ['2024-01-12', 12],
      ['2024-01-13', 97],
      ['2024-01-14', 5],
      ['2024-01-15', 66],
      ['2024-01-16', 89],
      ['2024-01-17', 21],
      ['2024-01-18', 73],
      ['2024-01-19', 58],
      ['2024-01-20', 6],
      ['2024-01-20', 61],
    ],
  },
  {
    name: 'Series-4 | Temperature',
    values: [
      ['2024-01-11', 47],
      ['2024-01-12', 28],
      ['2024-01-13', 84],
      ['2024-01-14', 13],
      ['2024-01-15', 40],
      ['2024-01-16', 92],
      ['2024-01-17', 16],
      ['2024-01-18', 71],
      ['2024-01-19', 9],
      ['2024-01-20', 36],
      ['2024-01-20', 81],
    ],
  },
  {
    name: 'Series-5 | Pressure',
    values: [
      ['2024-01-11', 4],
      ['2024-01-12', 71],
      ['2024-01-13', 57],
      ['2024-01-14', 65],
      ['2024-01-15', 95],
      ['2024-01-16', 54],
      ['2024-01-17', 25],
      ['2024-01-18', 82],
      ['2024-01-19', 33],
      ['2024-01-20', 41],
      ['2024-01-20', 87],
    ],
  },
  {
    name: 'Series-6 | Pressure',
    values: [
      ['2024-01-11', 52],
      ['2024-01-12', 40],
      ['2024-01-13', 91],
      ['2024-01-14', 8],
      ['2024-01-15', 58],
      ['2024-01-16', 17],
      ['2024-01-17', 64],
      ['2024-01-18', 88],
      ['2024-01-19', 77],
      ['2024-01-20', 30],
      ['2024-01-20', 83],
    ],
  },
  {
    name: 'Series-7 | Pressure',
    values: [
      ['2024-01-11', 6],
      ['2024-01-12', 92],
      ['2024-01-13', 38],
      ['2024-01-14', 41],
      ['2024-01-15', 44],
      ['2024-01-16', 80],
      ['2024-01-17', 90],
      ['2024-01-18', 51],
      ['2024-01-19', 65],
      ['2024-01-20', 19],
      ['2024-01-20', 75],
    ],
  },
  {
    name: 'Series-8 | Humidity',
    values: [
      ['2024-01-11', 98],
      ['2024-01-12', 45],
      ['2024-01-13', 27],
      ['2024-01-14', 68],
      ['2024-01-15', 5],
      ['2024-01-16', 96],
      ['2024-01-17', 30],
      ['2024-01-18', 76],
      ['2024-01-19', 48],
      ['2024-01-20', 63],
      ['2024-01-20', 93],
    ],
  },
  {
    name: 'Series-9 | Humidity',
    values: [
      ['2024-01-11', 84],
      ['2024-01-12', 56],
      ['2024-01-13', 99],
      ['2024-01-14', 2],
      ['2024-01-15', 47],
      ['2024-01-16', 12],
      ['2024-01-17', 89],
      ['2024-01-18', 27],
      ['2024-01-19', 52],
      ['2024-01-20', 66],
      ['2024-01-20', 88],
    ],
  },
  {
    name: 'Series-10 | Humidity',
    values: [
      ['2024-01-11', 63],
      ['2024-01-12', 19],
      ['2024-01-13', 70],
      ['2024-01-14', 97],
      ['2024-01-15', 43],
      ['2024-01-16', 14],
      ['2024-01-17', 60],
      ['2024-01-18', 33],
      ['2024-01-19', 23],
      ['2024-01-20', 75],
      ['2024-01-20', 94],
    ],
  },
];

export const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36];
