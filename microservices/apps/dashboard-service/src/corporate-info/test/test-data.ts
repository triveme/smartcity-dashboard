import { DbType } from '@app/postgres-db';
import {
  CorporateInfo,
  corporateInfos,
} from '@app/postgres-db/schemas/corporate-info.schema';
import { v4 as uuid } from 'uuid';
import { createTenantByObject, getTenant } from '../../tenant/test/test-data';
import { createLogoByObject, getLogo } from '../../logo/test/test-data';
import { CorporateInfoWithLogos } from '../corporate-info.repo';
import {
  CorporateInfoSidebarLogo,
  corporateInfoSidebarLogos,
} from '@app/postgres-db/schemas/corporate-info-sidebar-logos.schema';
import { eq } from 'drizzle-orm';

export function getCorporateInfo(logoId?: string): CorporateInfo {
  return {
    id: uuid(),
    tenantId: null,
    dashboardFontColor: '#333',
    dashboardPrimaryColor: '#333',
    dashboardSecondaryColor: '#333',
    dashboardHeadlineFontSize: '24px',
    fontFamily: 'Helvetica',
    fontColor: '#FFF',
    headerFontColor: '#FFF',
    headerLogoId: logoId ?? null,
    headerPrimaryColor: '#333',
    headerSecondaryColor: '#333',
    headerTitleAdmin: 'header_title_admin',
    headerTitleDashboards: 'header_title_dashboards',
    logo: 'https://example.com/logo.png',
    menuActiveColor: 'menu_active_color',
    menuActiveFontColor: 'menu_active_font_color',
    menuArrowDirection: 'Oben | Unten',
    menuCornerColor: '#1d2330',
    menuCornerFontColor: '#fff',
    menuFontColor: '#FFF',
    menuHoverColor: '#333',
    menuHoverFontColor: '#fff',
    menuLogoId: logoId ?? null,
    menuPrimaryColor: '#333',
    menuSecondaryColor: '#333',
    useColorTransitionHeader: false,
    useColorTransitionMenu: false,
    panelBorderColor: '#333',
    panelBorderRadius: 'panel_border_radius',
    panelBorderSize: 'panel_border_size',
    panelFontColor: '#FFF',
    panelHeadlineFontSize: '24px',
    panelPrimaryColor: '#333',
    panelSecondaryColor: '#333',
    scrollbarBackground: '#333',
    scrollbarColor: '#333',
    saveButtonColor: '#333',
    saveHoverButtonColor: '#333',
    cancelButtonColor: '#333',
    cancelHoverButtonColor: '#333',
    showHeaderLogo: true,
    showMenuLogo: true,
    showInfoButtonsOnMobile: false,
    titleBar: 'Light',
    widgetBorderColor: '#333',
    widgetBorderRadius: 'widget_border_radius',
    widgetBorderSize: 'widget_border_size',
    widgetFontColor: '#FFF',
    widgetHeadlineFontSize: '16px',
    widgetSubheadlineFontSize: '14px',
    widgetPrimaryColor: '#333',
    widgetSecondaryColor: '#333',
    informationTextFontSize: '11',
    informationTextFontColor: '#FFF',
    iconWithLinkFontSize: '11',
    iconWithLinkFontColor: '#FFF',
    iconWithLinkIconSize: '11',
    iconWithLinkIconColor: '#FFF',
    isPanelHeadlineBold: true,
    isWidgetHeadlineBold: true,
    degreeChart180FontSize: '11',
    degreeChart180FontColor: '#FFF',
    degreeChart180BgColor: '#FFF',
    degreeChart180FillColor: '#FFF',
    degreeChart180UnitFontSize: '10',
    degreeChart360FontSize: '11',
    degreeChart360FontColor: '#FFF',
    degreeChart360BgColor: '#FFF',
    degreeChart360FillColor: '#FFF',
    degreeChart360UnitFontSize: '11',
    sliderCurrentFontColor: '#000000',
    sliderMaximumFontColor: '#FFFFFF',
    sliderGeneralFontColor: '#FFFFFF',
    sliderCurrentColor: '#DC2626',
    sliderMaximumColor: '#000000',
    stageableChartTicksFontSize: '11',
    stageableChartTicksFontColor: '#FFF',
    stageableChartFontSize: '11',
    stageableChartFontColor: '#FFF',
    pieChartFontSize: '11',
    pieChartFontColor: '#FFF',
    pieChartCurrentValuesColors: [
      '#4CAF50',
      '#2196F3',
      '#FF9800',
      '#F44336',
      '#9C27B0',
    ],
    lineChartAxisTicksFontSize: '11',
    lineChartAxisLabelSize: '11',
    lineChartAxisLabelFontColor: '#FFF',
    lineChartLegendFontSize: '11',
    lineChartLegendFontColor: '#FFFFF',
    lineChartTicksFontColor: '#FFF',
    lineChartAxisLineColor: '11',
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
    lineChartFilterColor: '#333',
    lineChartFilterTextColor: '#FFFFFF',
    lineChartGridColor: '#3D4760',
    barChartAxisTicksFontSize: '11',
    barChartAxisLabelSize: '11',
    barChartAxisLabelFontColor: '#FFFFFF',
    barChartAxisLabelColor: '#FFFFFF',
    barChartLegendFontSize: '11',
    barChartLegendFontColor: '#FFFFFF',
    barChartTicksFontColor: '#FFF',
    barChartAxisLineColor: '#FFF',
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
    barChartFilterColor: '#333',
    barChartFilterTextColor: '#FFFFFF',
    barChartGridColor: '#3D4760',
    measurementChartBigValueFontSize: '11',
    measurementChartBigValueFontColor: '#FFF',
    measurementChartTopButtonBgColor: '#FFF',
    measurementChartTopButtonInactiveBgColor: '#FFF',
    measurementChartTopButtonHoverColor: '#FFF',
    measurementChartTopButtonFontColor: '#FFF',
    measurementChartCardsBgColor: '#FFF',
    measurementChartCardsFontColor: '#FFF',
    measurementChartCardsIconColors: ['#3D4760', '#3D4760', '#3D4760'],
    measurementChartBarColor: '#FFF',
    measurementChartLabelFontColor: '#FFF',
    measurementChartGridColor: '#FFF',
    measurementChartAxisLineColor: '#FFF',
    measurementChartAxisTicksFontColor: '#FFF',
    measurementChartAxisLabelFontColor: '#FFF',
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
    coloredSliderBigValueFontColor: '#FFF',
    coloredSliderLabelFontSize: '11',
    coloredSliderLabelFontColor: '#FFF',
    coloredSliderArrowColor: '#FFF',
    coloredSliderUnitFontSize: '11',
    wertFontSize: '20',
    wertUnitFontSize: '11',
    wertFontColor: '#FFFFF',

    weatherWarningBgColor: '#3D4760',
    weatherWarningHeadlineColor: '#E74C3C',
    weatherInstructionsColor: '#000000',
    weatherAlertDescriptionColor: '#000000',
    weatherDateColor: '#FFFFF',
    weatherWarningButtonBackgroundColor: '#2C3E50',
    weatherWarningButtonIconColor: '#FFFFF',
  };
}

export function getCorporateInfoWithLogos(): CorporateInfoWithLogos {
  const corporateInfo = getCorporateInfo();

  return {
    ...corporateInfo,
    headerLogo: null,
    menuLogo: null,
    sidebarLogos: [],
  };
}

export async function createCorporateInfoByObject(
  db: DbType,
  corporateInfo: CorporateInfo,
): Promise<CorporateInfo> {
  let tenant;
  if (!corporateInfo.tenantId) {
    tenant = await createTenantByObject(db, getTenant());
  } else {
    tenant = corporateInfo.tenantId;
  }

  if (!corporateInfo.menuLogoId && !corporateInfo.headerLogoId) {
    const logo = await createLogoByObject(db, getLogo());
    corporateInfo.menuLogoId = logo.id;
    corporateInfo.headerLogoId = logo.id;
    corporateInfo.tenantId = tenant.abbreviation;
  }

  const createdCorporateInfos = await db
    .insert(corporateInfos)
    .values(corporateInfo)
    .returning();

  return createdCorporateInfos.length > 0 ? createdCorporateInfos[0] : null;
}

export async function createCorporateInfoSidebarLogoRelationsByObject(
  db: DbType,
  corporateInfoSidebarLogo: CorporateInfoSidebarLogo,
): Promise<CorporateInfoSidebarLogo> {
  const dbCorporateInfoSidebarLogos = await db
    .insert(corporateInfoSidebarLogos)
    .values(corporateInfoSidebarLogo)
    .returning();

  return dbCorporateInfoSidebarLogos.length > 0
    ? dbCorporateInfoSidebarLogos[0]
    : null;
}

export async function getCorporateInfoSidebarLogoRelationsByCorporateInfoId(
  db: DbType,
  corporateInfoId: string,
): Promise<CorporateInfoSidebarLogo[]> {
  return db
    .select()
    .from(corporateInfoSidebarLogos)
    .where(eq(corporateInfoSidebarLogos.corporateInfoId, corporateInfoId));
}

export async function getCorporateInfosByTenantAbbreviation(
  db: DbType,
  tenantAbbreviation: string,
): Promise<CorporateInfo[]> {
  return db
    .select()
    .from(corporateInfos)
    .where(eq(corporateInfos.tenantId, tenantAbbreviation));
}
