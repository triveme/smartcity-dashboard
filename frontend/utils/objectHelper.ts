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
} from '@/types';

export const EMPTY_PANEL: Panel = {
  name: '',
  width: 12,
  height: 400,
  position: 1,
  info: '',
  generalInfo: '',
  showGeneralInfo: false,
};

export const EMPTY_WIDGET: Widget = {
  name: '',
  height: 400,
  width: 4,
  icon: '',
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
  chartMinimum: 0,
  chartMaximum: 0,
  chartUnit: '',
  chartStaticValues: [],
  chartStaticValuesColors: [],
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
  fontColor: '#FFF',
  headerFontColor: '#FFF',
  headerPrimaryColor: '#2B3244',
  headerSecondaryColor: '#3D4760',
  headerTitleAdmin: 'Smart Region Dashboard',
  headerTitleDashboards: 'Dashboards',
  menuActiveColor: '#1D2330',
  menuActiveFontColor: '#FFF',
  menuFontColor: '#fff',
  menuHoverColor: '#2B3244',
  menuPrimaryColor: '#3D4760',
  menuSecondaryColor: '#1d2330',
  panelBorderColor: '#3D4760',
  panelBorderRadius: '4px',
  panelBorderSize: '4px',
  panelFontColor: '#fff',
  panelPrimaryColor: '#3D4760',
  panelSecondaryColor: '#3D4760',
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
  widgetPrimaryColor: '#3D4760',
  widgetSecondaryColor: '#3D4760',
  sidebarLogos: [],
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
  },
];
