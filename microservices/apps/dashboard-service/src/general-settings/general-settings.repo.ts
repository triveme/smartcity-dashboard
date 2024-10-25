import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  generalSettings,
  GeneralSettings,
  NewGeneralSettings,
} from '@app/postgres-db/schemas/general-settings.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class GeneralSettingsRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<GeneralSettings[]> {
    return this.db.select().from(generalSettings);
  }

  async getById(id: string): Promise<GeneralSettings> {
    const result = await this.db
      .select()
      .from(generalSettings)
      .where(eq(generalSettings.id, id));

    return result.length > 0 ? result[0] : null;
  }

  async getByTenantAbbreviation(
    abbreviation: string,
  ): Promise<GeneralSettings> {
    const result = await this.db
      .select()
      .from(generalSettings)
      .where(eq(generalSettings.tenant, abbreviation));

    return result.length > 0 ? result[0] : null;
  }

  async create(
    row: NewGeneralSettings,
    transaction?: DbType,
  ): Promise<GeneralSettings> {
    const dbActor = transaction ? transaction : this.db;

    const result = await dbActor
      .insert(generalSettings)
      .values(row)
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async update(
    id: string,
    values: Partial<NewGeneralSettings>,
  ): Promise<GeneralSettings> {
    const result = await this.db
      .update(generalSettings)
      .set(values)
      .where(eq(generalSettings.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string): Promise<GeneralSettings> {
    const result = await this.db
      .delete(generalSettings)
      .where(eq(generalSettings.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }
}
