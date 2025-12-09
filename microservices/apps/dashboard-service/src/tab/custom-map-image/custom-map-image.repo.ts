import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  CustomMapImage,
  customMapImages,
  NewCustomMapImage,
} from '@app/postgres-db/schemas/dashboard.tab.custom_map_image.schema';
import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';

@Injectable()
export class CustomMapImageRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAllForTenantAbbreviation(
    tenantAbbreviation?: string,
  ): Promise<CustomMapImage[]> {
    return this.db
      .select()
      .from(customMapImages)
      .where(eq(customMapImages.tenantId, tenantAbbreviation));
  }

  async getById(id: string): Promise<CustomMapImage> {
    const result = await this.db
      .select()
      .from(customMapImages)
      .where(eq(customMapImages.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async getByMultipleIds(ids: string[]): Promise<CustomMapImage[]> {
    if (ids.length === 0) return [];

    return this.db
      .select()
      .from(customMapImages)
      .where(inArray(customMapImages.id, ids));
  }

  async create(
    row: NewCustomMapImage,
    transaction?: DbType,
  ): Promise<CustomMapImage> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .insert(customMapImages)
      .values(row)
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string): Promise<CustomMapImage> {
    const result = await this.db
      .delete(customMapImages)
      .where(eq(customMapImages.id, id))
      .returning();
    return result.length > 0 ? result[0] : null;
  }

  async deleteByTenantAbbreviation(
    tenantAbbreviation: string,
    transaction?: DbType,
  ): Promise<CustomMapImage[]> {
    const dbActor = transaction ? transaction : this.db;

    return dbActor
      .delete(customMapImages)
      .where(eq(customMapImages.tenantId, tenantAbbreviation))
      .returning();
  }
}
