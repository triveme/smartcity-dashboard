import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewQuery,
  queries,
  Query,
} from '@app/postgres-db/schemas/query.schema';
import { tabs } from '@app/postgres-db/schemas';

@Injectable()
export class QueryRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<Query[]> {
    return this.db.select().from(queries).orderBy(queries.createdAt);
  }

  async getById(id: string): Promise<Query> {
    const result = await this.db
      .select()
      .from(queries)
      .where(eq(queries.id, id));

    return result.length > 0 ? result[0] : null;
  }

  async getQueryByTabId(id: string): Promise<Query> {
    const subSelect = this.db
      .select({ queryId: tabs.queryId })
      .from(tabs)
      .where(eq(tabs.id, id));

    const result = await this.db
      .select()
      .from(queries)
      .where(inArray(queries.id, subSelect));

    return result.length > 0 ? result[0] : null;
  }

  async getQueryByQueryConfigId(id: string): Promise<Query> {
    const result = await this.db
      .select()
      .from(queries)
      .where(eq(queries.queryConfigId, id));

    return result.length > 0 ? result[0] : null;
  }

  async create(row: NewQuery, transaction?: DbType): Promise<Query> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor.insert(queries).values(row).returning();

    return result.length > 0 ? result[0] : null;
  }

  async update(
    id: string,
    values: Partial<Query>,
    transaction?: DbType,
  ): Promise<Query> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .update(queries)
      .set(values)
      .where(eq(queries.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string, transaction?: DbType): Promise<Query> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .delete(queries)
      .where(eq(queries.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }
}
