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
    menuFontColor: '#FFF',
    menuHoverColor: '#333',
    menuLogoId: logoId ?? null,
    menuPrimaryColor: '#333',
    menuSecondaryColor: '#333',
    useColorTransitionHeader: false,
    useColorTransitionMenu: false,
    panelBorderColor: '#333',
    panelBorderRadius: 'panel_border_radius',
    panelBorderSize: 'panel_border_size',
    panelFontColor: '#FFF',
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
    titleBar: 'Light',
    widgetBorderColor: '#333',
    widgetBorderRadius: 'widget_border_radius',
    widgetBorderSize: 'widget_border_size',
    widgetFontColor: '#FFF',
    widgetPrimaryColor: '#333',
    widgetSecondaryColor: '#333',
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
