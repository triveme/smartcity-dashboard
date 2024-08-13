import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Logo, logos, NewLogo } from '@app/postgres-db/schemas/logo.schema';
import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { SidebarLogo } from '../corporate-info/corporate-info.repo';
import { corporateInfoSidebarLogos } from '@app/postgres-db/schemas/corporate-info-sidebar-logos.schema';

@Injectable()
export class LogoRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAllForTenantAbbreviation(
    tenantAbbreviation?: string,
  ): Promise<Logo[]> {
    return this.db
      .select()
      .from(logos)
      .where(eq(logos.tenantId, tenantAbbreviation));
  }

  async getById(id: string): Promise<Logo> {
    const result = await this.db.select().from(logos).where(eq(logos.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async getSidebarLogosByCorporateInfoId(
    corporateInfoId: string,
  ): Promise<SidebarLogo[]> {
    return this.db
      .select({
        id: logos.id,
        tenantId: logos.tenantId,
        logo: logos.logo,
        logoHeight: logos.logoHeight,
        logoWidth: logos.logoWidth,
        logoName: logos.logoName,
        format: logos.format,
        size: logos.size,
        order: corporateInfoSidebarLogos.order,
      })
      .from(logos)
      .leftJoin(
        corporateInfoSidebarLogos,
        eq(corporateInfoSidebarLogos.logoId, logos.id),
      )
      .where(eq(corporateInfoSidebarLogos.corporateInfoId, corporateInfoId));
  }

  async getByMultipleIds(ids: string[]): Promise<Logo[]> {
    if (ids.length === 0) return [];

    return this.db.select().from(logos).where(inArray(logos.id, ids));
  }

  async create(row: NewLogo, transaction?: DbType): Promise<Logo> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor.insert(logos).values(row).returning();
    return result.length > 0 ? result[0] : null;
  }

  async createMultiple(row: NewLogo[], transaction?: DbType): Promise<Logo[]> {
    if (row.length === 0) return [];

    const dbActor = transaction === undefined ? this.db : transaction;

    return dbActor.insert(logos).values(row).returning();
  }

  async update(
    id: string,
    values: Partial<Logo>,
    transaction?: DbType,
  ): Promise<Logo> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .update(logos)
      .set(values)
      .where(eq(logos.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string): Promise<Logo> {
    const result = await this.db
      .delete(logos)
      .where(eq(logos.id, id))
      .returning();
    return result.length > 0 ? result[0] : null;
  }
}
