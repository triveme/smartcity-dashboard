import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewTabImage,
  TabImage,
  tabImages,
} from '@app/postgres-db/schemas/dashboard.tab.values-to-images.schema';
import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';

@Injectable()
export class TabImageRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAllForTenantAbbreviation(
    tenantAbbreviation?: string,
  ): Promise<TabImage[]> {
    return this.db
      .select()
      .from(tabImages)
      .where(eq(tabImages.tenantId, tenantAbbreviation));
  }

  async getById(id: string): Promise<TabImage> {
    const result = await this.db
      .select()
      .from(tabImages)
      .where(eq(tabImages.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async getByMultipleIds(ids: string[]): Promise<TabImage[]> {
    if (ids.length === 0) return [];

    return this.db.select().from(tabImages).where(inArray(tabImages.id, ids));
  }

  async create(row: NewTabImage, transaction?: DbType): Promise<TabImage> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor.insert(tabImages).values(row).returning();
    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string): Promise<TabImage> {
    const result = await this.db
      .delete(tabImages)
      .where(eq(tabImages.id, id))
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async deleteByTenantAbbreviation(
    tenantAbbreviation: string,
    transaction?: DbType,
  ): Promise<TabImage[]> {
    const dbActor = transaction ? transaction : this.db;

    return dbActor
      .delete(tabImages)
      .where(eq(tabImages.tenantId, tenantAbbreviation))
      .returning();
  }
}
