import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { and, eq, inArray } from 'drizzle-orm';
import {
  CorporateInfoSidebarLogo,
  corporateInfoSidebarLogos,
} from '@app/postgres-db/schemas/corporate-info-sidebar-logos.schema';

@Injectable()
export class CorporateInfoSidebarLogosRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<CorporateInfoSidebarLogo[]> {
    return this.db.select().from(corporateInfoSidebarLogos);
  }

  async getByCorporateInfoId(
    corporateInfoId: string,
  ): Promise<CorporateInfoSidebarLogo[]> {
    const result = await this.db
      .select()
      .from(corporateInfoSidebarLogos)
      .where(eq(corporateInfoSidebarLogos.corporateInfoId, corporateInfoId))
      .orderBy(corporateInfoSidebarLogos.order);

    return result.length > 0 ? result : [];
  }

  async createMultiple(
    corporateInfoSidebarLogoRelations: CorporateInfoSidebarLogo[],
    transaction?: DbType,
  ): Promise<CorporateInfoSidebarLogo[]> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .insert(corporateInfoSidebarLogos)
      .values(corporateInfoSidebarLogoRelations)
      .returning();

    return result.length > 0 ? result : [];
  }

  async update(
    corporateInfoId: string,
    logoId: string,
    order: number,
    transaction?: DbType,
  ): Promise<CorporateInfoSidebarLogo> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .update(corporateInfoSidebarLogos)
      .set({
        order: order,
      })
      .where(
        and(
          eq(corporateInfoSidebarLogos.corporateInfoId, corporateInfoId),
          eq(corporateInfoSidebarLogos.logoId, logoId),
        ),
      )
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async deleteMultiple(
    corporateInfoId: string,
    deletionLogoRelationIds: Array<string>,
    transaction: DbType,
  ): Promise<CorporateInfoSidebarLogo[]> {
    const dbActor = transaction === undefined ? this.db : transaction;

    return dbActor
      .delete(corporateInfoSidebarLogos)
      .where(
        and(
          eq(corporateInfoSidebarLogos.corporateInfoId, corporateInfoId),
          inArray(corporateInfoSidebarLogos.logoId, deletionLogoRelationIds),
        ),
      )
      .returning();
  }

  async deleteRelationsForCorporateInfo(
    corporateInfoId: string,
    transaction: DbType,
  ): Promise<CorporateInfoSidebarLogo[]> {
    const dbActor = transaction === undefined ? this.db : transaction;

    return dbActor
      .delete(corporateInfoSidebarLogos)
      .where(eq(corporateInfoSidebarLogos.corporateInfoId, corporateInfoId))
      .returning();
  }
}
