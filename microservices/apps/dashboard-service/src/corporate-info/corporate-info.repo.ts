import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  CorporateInfo,
  corporateInfos,
  NewCorporateInfo,
} from '@app/postgres-db/schemas/corporate-info.schema';
import { alias } from 'drizzle-orm/pg-core';
import { Logo, logos } from '@app/postgres-db/schemas/logo.schema';
import {
  CorporateInfoSidebarLogo,
  corporateInfoSidebarLogos,
} from '@app/postgres-db/schemas/corporate-info-sidebar-logos.schema';
import { CorporateInfoSidebarLogosRepo } from './corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../logo/logo.repo';
import { Tenant } from '@app/postgres-db/schemas/tenant.schema';
import { TenantRepo } from '../tenant/tenant.repo';

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
    private readonly tenantRepo: TenantRepo,
  ) {}

  async getAllWithLogos(): Promise<CorporateInfoWithLogos[]> {
    const tenantHeaderLogo = alias(logos, 'headerLogo');
    const tenantMenuLogo = alias(logos, 'menuLogo');
    const ciSidebarLogo = alias(corporateInfoSidebarLogos, 'sidebarLogo');

    const corporateInfosWithLogos = await this.db
      .select()
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
      ...info.corporate_info,
      headerLogo: info.headerLogo || null,
      menuLogo: info.menuLogo || null,
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
    tenantAbbreviation: string,
    withLogos: boolean,
  ): Promise<CorporateInfo[] | CorporateInfoWithLogos[]> {
    const tenant: Tenant =
      await this.tenantRepo.getTenantByAbbreviation(tenantAbbreviation);

    if (!tenant) {
      console.error('Tenant not found for abbreviation:', tenantAbbreviation);
      return [];
    }
    const result = await this.db
      .select()
      .from(corporateInfos)
      .where(eq(corporateInfos.tenantId, tenant.abbreviation));

    const corporateInfoArray = await Promise.all(
      result.map(async (corporateInfo) => {
        try {
          return await this.buildCorporateInfoArray(corporateInfo, withLogos);
        } catch (error) {
          console.error('Error in buildCorporateInfoArray:', error);
          throw error;
        }
      }),
    );

    corporateInfoArray.sort((a, b) => {
      if ('titleBar' in a && 'titleBar' in b) {
        return a.titleBar === 'Light' ? -1 : 1;
      }
      return 0;
    });

    return corporateInfoArray;
  }

  private async buildCorporateInfoArray(
    corporateInfo: CorporateInfo,
    withLogos: boolean,
  ): Promise<CorporateInfo | CorporateInfoWithLogos> {
    const sidebarLogosRelations: CorporateInfoSidebarLogo[] =
      await this.corporateInfoSideBarLogoRepo.getByCorporateInfoId(
        corporateInfo.id,
      );

    const sidebarLogoIds = sidebarLogosRelations.map(
      (relation) => relation.logoId,
    );
    const fetchedLogos = await this.logoRepo.getByMultipleIds(sidebarLogoIds);

    if (withLogos) {
      return this.buildWithLogos(
        corporateInfo,
        fetchedLogos,
        sidebarLogosRelations,
      );
    }

    const sidebarLogos: SidebarLogo[] = this.mergeOrderWithLogos(
      fetchedLogos,
      sidebarLogosRelations,
    );

    return {
      ...corporateInfo,
      sidebarLogos,
    };
  }

  private async buildWithLogos(
    corporateInfo: CorporateInfo,
    fetchedLogos: Logo[],
    sidebarLogosRelations: CorporateInfoSidebarLogo[],
  ): Promise<CorporateInfoWithLogos> {
    try {
      const headerLogo = await this.logoRepo.getById(
        corporateInfo.headerLogoId,
      );
      const menuLogo = await this.logoRepo.getById(corporateInfo.menuLogoId);

      const sidebarLogos: SidebarLogo[] = this.mergeOrderWithLogos(
        fetchedLogos,
        sidebarLogosRelations,
      );

      if (menuLogo) {
        return {
          ...corporateInfo,
          headerLogo: headerLogo || null,
          menuLogo: menuLogo || null,
          sidebarLogos,
        };
      }

      if (headerLogo) {
        return {
          ...corporateInfo,
          headerLogo: headerLogo || null,
          menuLogo: null,
          sidebarLogos,
        };
      }

      if (sidebarLogos.length === 0) {
        return {
          ...corporateInfo,
          headerLogo: null,
          menuLogo: null,
          sidebarLogos,
        };
      }

      return {
        ...corporateInfo,
        headerLogo: headerLogo || null,
        menuLogo: menuLogo || null,
        sidebarLogos,
      };
    } catch (error) {
      throw error;
    }
  }

  private mergeOrderWithLogos(
    logos: Logo[],
    relations: CorporateInfoSidebarLogo[],
  ): SidebarLogo[] {
    return logos.map((logo) => {
      const relation = relations.find((r) => r.logoId === logo.id);
      return { ...logo, order: relation?.order ?? 0 };
    });
  }

  async create(
    row: NewCorporateInfo,
    transaction?: DbType,
  ): Promise<CorporateInfo> {
    const dbActor = transaction === undefined ? this.db : transaction;

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

  async deleteByTenant(
    tenantAbbreviation: string,
    transaction?: DbType,
  ): Promise<CorporateInfo[]> {
    const dbActor = transaction === undefined ? this.db : transaction;

    return dbActor
      .delete(corporateInfos)
      .where(eq(corporateInfos.tenantId, tenantAbbreviation))
      .returning();
  }
}
