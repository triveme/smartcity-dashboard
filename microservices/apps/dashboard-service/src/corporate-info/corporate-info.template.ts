import { NewCorporateInfo } from '@app/postgres-db/schemas/corporate-info.schema';

const standardColor = '#3D4760';
const white = '#FFF';
const radius = '4px';

export const edagTemplate: NewCorporateInfo = {
  dashboardFontColor: white,
  dashboardPrimaryColor: '#2B3244',
  dashboardSecondaryColor: '#2B3244',
  fontFamily: 'Helvetica',
  fontColor: white,
  headerFontColor: null,
  headerPrimaryColor: standardColor,
  headerTitleAdmin: 'Smart Region Dashboard',
  headerTitleDashboards: 'Dashboard',
  headerSecondaryColor: standardColor,
  menuActiveColor: white,
  menuActiveFontColor: white,
  menuFontColor: null,
  menuHoverColor: standardColor,
  menuPrimaryColor: standardColor,
  menuSecondaryColor: standardColor,
  panelBorderColor: standardColor,
  panelBorderRadius: radius,
  panelBorderSize: radius,
  panelFontColor: null,
  panelPrimaryColor: standardColor,
  panelSecondaryColor: standardColor,
  showHeaderLogo: true,
  showMenuLogo: true,
  titleBar: 'Light',
  useColorTransitionHeader: false,
  useColorTransitionMenu: false,
  widgetBorderColor: standardColor,
  widgetBorderRadius: radius,
  widgetBorderSize: radius,
  widgetFontColor: null,
  widgetPrimaryColor: standardColor,
  widgetSecondaryColor: standardColor,
};
