import { NewCorporateInfo } from '@app/postgres-db/schemas/corporate-info.schema';

const standardColor = '#3D4760';
const white = '#FFF';
const radius = '4px';

export const edagTemplate: NewCorporateInfo = {
  dashboardFontColor: white,
  dashboardPrimaryColor: '#2B3244',
  dashboardSecondaryColor: '#2B3244',
  fontColor: white,
  headerFontColor: white,
  headerPrimaryColor: standardColor,
  headerTitleAdmin: 'Smart Region Dashboard',
  headerTitleDashboards: 'Dashboard',
  headerSecondaryColor: standardColor,
  menuActiveColor: white,
  menuActiveFontColor: white,
  menuFontColor: white,
  menuHoverColor: standardColor,
  menuPrimaryColor: standardColor,
  menuSecondaryColor: standardColor,
  panelBorderColor: standardColor,
  panelBorderRadius: radius,
  panelBorderSize: radius,
  panelFontColor: white,
  panelPrimaryColor: standardColor,
  panelSecondaryColor: standardColor,
  showHeaderLogo: true,
  showMenuLogo: true,
  titleBar: '',
  useColorTransitionHeader: false,
  useColorTransitionMenu: false,
  widgetBorderColor: standardColor,
  widgetBorderRadius: radius,
  widgetBorderSize: radius,
  widgetFontColor: white,
  widgetPrimaryColor: standardColor,
  widgetSecondaryColor: standardColor,
};
