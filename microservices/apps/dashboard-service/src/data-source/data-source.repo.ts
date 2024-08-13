import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  DataSource,
  dataSources,
  NewDataSource,
} from '@app/postgres-db/schemas/data-source.schema';
import { eq, inArray } from 'drizzle-orm';
import { authData } from '@app/postgres-db/schemas/auth-data.schema';

@Injectable()
export class DataSourceRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<DataSource[]> {
    return this.db.select().from(dataSources).orderBy(dataSources.name);
  }

  async getById(id: string): Promise<DataSource> {
    const result = await this.db
      .select()
      .from(dataSources)
      .where(eq(dataSources.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async getByTenant(tenant: string): Promise<DataSource[]> {
    const authDataByTenant = this.db
      .select({
        id: authData.id,
      })
      .from(authData)
      .where(eq(authData.tenantAbbreviation, tenant));

    return this.db
      .select()
      .from(dataSources)
      .where(inArray(dataSources.authDataId, authDataByTenant));
  }

  async getByAuthDataId(id: string): Promise<DataSource> {
    const result = await this.db
      .select()
      .from(dataSources)
      .where(eq(dataSources.authDataId, id));

    return result.length > 0 ? result[0] : null;
  }

  async create(row: NewDataSource, transaction?: DbType): Promise<DataSource> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const createdDataSources = await dbActor
      .insert(dataSources)
      .values(row)
      .returning();

    return createdDataSources.length > 0 ? createdDataSources[0] : null;
  }

  async update(
    id: string,
    values: Partial<DataSource>,
    transaction?: DbType,
  ): Promise<DataSource> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .update(dataSources)
      .set(values)
      .where(eq(dataSources.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string): Promise<DataSource> {
    const result = await this.db
      .delete(dataSources)
      .where(eq(dataSources.id, id))
      .returning();
    return result.length > 0 ? result[0] : null;
  }
}
