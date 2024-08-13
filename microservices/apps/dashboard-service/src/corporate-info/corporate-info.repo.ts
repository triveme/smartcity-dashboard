import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  CorporateInfo,
  corporateInfos,
  NewCorporateInfo,
} from '@app/postgres-db/schemas/corporate-info.schema';
import { alias } from 'drizzle-orm/pg-core';
import { edagTemplate } from './corporate-info.template';
import { Logo, logos } from '@app/postgres-db/schemas/logo.schema';
import {
  CorporateInfoSidebarLogo,
  corporateInfoSidebarLogos,
} from '@app/postgres-db/schemas/corporate-info-sidebar-logos.schema';
import { CorporateInfoSidebarLogosRepo } from '../corporate-info-sidebar-logos/corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../logo/logo.repo';

export interface CorporateInfoWithLogos extends CorporateInfo {
  headerLogo: Logo;
  menuLogo: Logo;
  sidebarLogos: SidebarLogo[];
}

export type SidebarLogo = Logo & { order: number };

@Injectable()
export class CorporateInfoRepo {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly corporateInfoSideBarLogoRepo: CorporateInfoSidebarLogosRepo,
    private readonly logoRepo: LogoRepo,
  ) {}

  async getAllWithLogos(): Promise<CorporateInfoWithLogos[]> {
    const tenantHeaderLogo = alias(logos, 'headerLogo');
    const tenantMenuLogo = alias(logos, 'menuLogo');
    const ciSidebarLogo = alias(corporateInfoSidebarLogos, 'sidebarLogo');

    const corporateInfosWithLogos = await this.db
      .select({
        id: corporateInfos.id,
        tenantId: corporateInfos.tenantId,
        dashboardFontColor: corporateInfos.dashboardFontColor,
        dashboardPrimaryColor: corporateInfos.dashboardPrimaryColor,
        dashboardSecondaryColor: corporateInfos.dashboardSecondaryColor,
        fontColor: corporateInfos.fontColor,
        headerFontColor: corporateInfos.headerFontColor,
        headerLogo: tenantHeaderLogo,
        headerLogoId: corporateInfos.headerLogoId,
        headerPrimaryColor: corporateInfos.headerPrimaryColor,
        headerSecondaryColor: corporateInfos.headerSecondaryColor,
        headerTitleAdmin: corporateInfos.headerTitleAdmin,
        headerTitleDashboards: corporateInfos.headerTitleDashboards,
        logo: corporateInfos.logo,
        menuActiveColor: corporateInfos.menuActiveColor,
        menuActiveFontColor: corporateInfos.menuActiveFontColor,
        menuFontColor: corporateInfos.menuFontColor,
        menuHoverColor: corporateInfos.menuHoverColor,
        menuLogo: tenantMenuLogo,
        menuLogoId: corporateInfos.menuLogoId,
        menuPrimaryColor: corporateInfos.menuPrimaryColor,
        menuSecondaryColor: corporateInfos.menuSecondaryColor,
        panelBorderColor: corporateInfos.panelBorderColor,
        panelBorderRadius: corporateInfos.panelBorderRadius,
        panelBorderSize: corporateInfos.panelBorderSize,
        panelFontColor: corporateInfos.panelFontColor,
        panelPrimaryColor: corporateInfos.panelPrimaryColor,
        panelSecondaryColor: corporateInfos.panelSecondaryColor,
        scrollbarBackground: corporateInfos.scrollbarBackground,
        scrollbarColor: corporateInfos.scrollbarColor,
        saveButtonColor: corporateInfos.saveButtonColor,
        saveHoverButtonColor: corporateInfos.saveHoverButtonColor,
        cancelButtonColor: corporateInfos.saveButtonColor,
        cancelHoverButtonColor: corporateInfos.saveHoverButtonColor,
        showHeaderLogo: corporateInfos.showHeaderLogo,
        showMenuLogo: corporateInfos.showMenuLogo,
        titleBar: corporateInfos.titleBar,
        useColorTransitionHeader: corporateInfos.useColorTransitionHeader,
        useColorTransitionMenu: corporateInfos.useColorTransitionMenu,
        widgetBorderColor: corporateInfos.widgetBorderColor,
        widgetBorderRadius: corporateInfos.widgetBorderRadius,
        widgetBorderSize: corporateInfos.widgetBorderSize,
        widgetFontColor: corporateInfos.widgetFontColor,
        widgetPrimaryColor: corporateInfos.widgetPrimaryColor,
        widgetSecondaryColor: corporateInfos.widgetSecondaryColor,
      })
      .from(corporateInfos)
      .leftJoin(
        tenantHeaderLogo,
        eq(tenantHeaderLogo.id, corporateInfos.headerLogoId),
      )
      .leftJoin(
        tenantMenuLogo,
        eq(tenantMenuLogo.id, corporateInfos.menuLogoId),
      )
      .leftJoin(
        ciSidebarLogo,
        eq(ciSidebarLogo.corporateInfoId, corporateInfos.id),
      );

    return corporateInfosWithLogos.map((info) => ({
      ...info,
      sidebarLogos: [],
    }));
  }

  async getAll(): Promise<CorporateInfo[]> {
    return this.db.select().from(corporateInfos);
  }

  async getById(id: string): Promise<CorporateInfo> {
    const result = await this.db
      .select()
      .from(corporateInfos)
      .where(eq(corporateInfos.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async getByTenant(
    tenantId: string,
    withLogos: boolean,
  ): Promise<CorporateInfo | CorporateInfoWithLogos> {
    const result = await this.db
      .select()
      .from(corporateInfos)
      .where(eq(corporateInfos.tenantId, tenantId));

    if (result.length <= 0) {
      return null;
    }

    const sidebarLogosRelations: CorporateInfoSidebarLogo[] =
      await this.corporateInfoSideBarLogoRepo.getByCorporateInfoId(
        result[0].id,
      );

    let sidebarLogos: SidebarLogo[];

    function mergeOrderWithLogos(
      logos: Logo[],
      relations: CorporateInfoSidebarLogo[],
    ): SidebarLogo[] {
      return logos.map((logo) => {
        const relation = relations.find((r) => r.logoId === logo.id);
        return { ...logo, order: relation?.order ?? 0 };
      });
    }

    const sidebarLogoIds = sidebarLogosRelations.map(
      (relation) => relation.logoId,
    );
    const fetchedLogos = await this.logoRepo.getByMultipleIds(sidebarLogoIds);

    if (withLogos) {
      try {
        const headerLogo = await this.logoRepo.getById(result[0].headerLogoId);
        const menuLogo = await this.logoRepo.getById(result[0].menuLogoId);

        sidebarLogos = mergeOrderWithLogos(fetchedLogos, sidebarLogosRelations);

        if (menuLogo) {
          return {
            ...result[0],
            headerLogo: headerLogo || null,
            menuLogo: menuLogo || null,
            sidebarLogos,
          };
        }

        if (headerLogo) {
          return {
            ...result[0],
            headerLogo: headerLogo || null,
            menuLogo: null,
            sidebarLogos,
          };
        }

        if (sidebarLogos.length === 0) {
          return {
            ...result[0],
            headerLogo: null,
            menuLogo: null,
            sidebarLogos,
          };
        }

        return {
          ...result[0],
          headerLogo: headerLogo || null,
          menuLogo: menuLogo || null,
          sidebarLogos,
        };
      } catch (error) {
        throw error;
      }
    }

    sidebarLogos = mergeOrderWithLogos(fetchedLogos, sidebarLogosRelations);

    return {
      ...result[0],
      sidebarLogos,
    };
  }

  async create(
    row: NewCorporateInfo,
    transaction?: DbType,
  ): Promise<CorporateInfo> {
    const dbActor = transaction === undefined ? this.db : transaction;

    row = { ...edagTemplate, ...row };
    const result = await dbActor.insert(corporateInfos).values(row).returning();
    const createdCorporateInfo = result.length > 0 ? result[0] : null;

    if (createdCorporateInfo) return createdCorporateInfo;
  }

  async update(
    id: string,
    values: Partial<CorporateInfo>,
    transaction?: DbType,
  ): Promise<CorporateInfo> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .update(corporateInfos)
      .set(values)
      .where(eq(corporateInfos.id, id))
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string, transaction?: DbType): Promise<CorporateInfo> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .delete(corporateInfos)
      .where(eq(corporateInfos.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }
}
