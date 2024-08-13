import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, isNotNull } from 'drizzle-orm';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewQueryConfig,
  QueryConfig,
  queryConfigs,
} from '@app/postgres-db/schemas/query-config.schema';
import { queries } from '@app/postgres-db/schemas/query.schema';
import { tabs } from '@app/postgres-db/schemas';

@Injectable()
export class QueryConfigRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<QueryConfig[]> {
    return this.db.select().from(queryConfigs).orderBy(queryConfigs.createdAt);
  }

  async getById(id: string): Promise<QueryConfig> {
    const result = await this.db
      .select()
      .from(queryConfigs)
      .where(eq(queryConfigs.id, id));

    return result.length > 0 ? result[0] : null;
  }

  async getQueryConfigByTabId(id: string): Promise<QueryConfig> {
    const subSelectTabs = this.db
      .select({ queryId: tabs.queryId })
      .from(tabs)
      .where(eq(tabs.id, id));

    const subSelectQueries = this.db
      .select({ queryConfigId: queries.queryConfigId })
      .from(queries)
      .where(
        and(
          inArray(queries.id, subSelectTabs),
          isNotNull(queries.queryConfigId),
        ),
      );

    const result = await this.db
      .select()
      .from(queryConfigs)
      .where(inArray(queryConfigs.id, subSelectQueries));

    return result.length > 0 ? result[0] : null;
  }

  async create(
    row: NewQueryConfig,
    transaction?: DbType,
  ): Promise<QueryConfig> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor.insert(queryConfigs).values(row).returning();

    return result.length > 0 ? result[0] : null;
  }

  async update(
    id: string,
    values: Partial<QueryConfig>,
    transaction?: DbType,
  ): Promise<QueryConfig> {
    const dbActor = transaction === undefined ? this.db : transaction;

    values.updatedAt = new Date();
    delete values.createdAt;

    const result = await dbActor
      .update(queryConfigs)
      .set(values)
      .where(eq(queryConfigs.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string, transaction?: DbType): Promise<QueryConfig> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const deletedQueryConfig = await dbActor
      .delete(queryConfigs)
      .where(eq(queryConfigs.id, id))
      .returning();

    return deletedQueryConfig.length > 0 ? deletedQueryConfig[0] : null;
  }
}
