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

export function getCorporateInfo(
  logoId?: string,
  tenantId?: string,
): CorporateInfo {
  return {
    id: uuid(),
    tenantId: tenantId ?? 'edag',
    dashboardFontColor: '#333',
    dashboardPrimaryColor: '#333',
    dashboardSecondaryColor: '#333',
    fontColor: '#333',
    headerFontColor: '#333',
    headerLogoId: logoId ?? null,
    headerPrimaryColor: '#333',
    headerSecondaryColor: '#333',
    headerTitleAdmin: 'header_title_admin',
    headerTitleDashboards: 'header_title_dashboards',
    logo: 'https://example.com/logo.png',
    menuActiveColor: 'menu_active_color',
    menuActiveFontColor: 'menu_active_font_color',
    menuFontColor: '#333',
    menuHoverColor: '#333',
    menuLogoId: logoId ?? null,
    menuPrimaryColor: '#333',
    menuSecondaryColor: '#333',
    useColorTransitionHeader: false,
    useColorTransitionMenu: false,
    panelBorderColor: '#333',
    panelBorderRadius: 'panel_border_radius',
    panelBorderSize: 'panel_border_size',
    panelFontColor: '#333',
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
    titleBar: 'Company Name',
    widgetBorderColor: '#333',
    widgetBorderRadius: 'widget_border_radius',
    widgetBorderSize: 'widget_border_size',
    widgetFontColor: '#333',
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
  if (!corporateInfo.menuLogoId && !corporateInfo.headerLogoId) {
    await createTenantByObject(db, getTenant());
    const logo = await createLogoByObject(db, getLogo());
    corporateInfo.menuLogoId = logo.id;
    corporateInfo.headerLogoId = logo.id;
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
