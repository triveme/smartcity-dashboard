// eslint-disable-next-line prettier/prettier
import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  DataSource,
  dataSources,
} from '@app/postgres-db/schemas/data-source.schema';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';

export type QueryBatch = {
  queryIds: string[];
  query_config: QueryConfig;
  data_source: DataSource;
};

export interface NGSIv2Entity {
  entityId: string;
  index: string[];
  values: number[];
  labels: string[];
  timeLabels: string[];
}

export interface NGSIv2AttributeData {
  attrName: string;
  types: { entities: NGSIv2Entity[]; entityType: string }[];
}

@Injectable()
export class SqlViewService {
  private readonly logger = new Logger(SqlViewService.name);

  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getCollections(apiid: string): Promise<string[]> {
    try {
      const datas = await this.db
        .select()
        .from(dataSources)
        .where(eq(dataSources.id, apiid));

      return datas.flatMap((d) => d.collections);
    } catch (error) {
      this.logger.error('Failed to fetch data: ', error);
      throw new Error('Failed to fetch data');
    }
  }

  async getSources(): Promise<string[]> {
    return ['tables'];
  }

  async getEntities(): Promise<string[]> {
    return ['all'];
  }

  async getAttributes(collection: string): Promise<string[]> {
    try {
      const result = await this.db.execute(sql`
      SELECT c.column_name
        FROM information_schema.columns c
        JOIN information_schema.views v 
          ON v.table_name = c.table_name AND v.table_schema = c.table_schema
        WHERE c.table_schema = 'public'
        AND v.table_name = ${collection}
        ORDER BY ordinal_position;
      `);

      const rows = result.rows as { column_name: string }[];
      return rows.map((r) => r.column_name);
    } catch (error) {
      this.logger.error('Failed to fetch data: ', error);
      throw new Error('Failed to fetch data');
    }
  }

  async getDataFromDataSource(
    queryBatch: QueryBatch,
  ): Promise<{ attributes: { attrName: string; values: unknown[] }[] }> {
    const columns = queryBatch.query_config.attributes;
    const selected =
      columns && columns.length > 0
        ? sql.raw(columns.map((c) => `"${c}"`).join(', '))
        : sql.raw('*');

    const check = await this.db.execute(sql`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
        AND table_name = ${queryBatch.query_config.fiwareService};
    `);

    if (check.rows.length === 0) {
      throw new Error(
        `'${queryBatch.query_config.fiwareService}' is not a view`,
      );
    }

    const result = await this.db.execute(sql`
      SELECT ${selected}
      FROM ${sql.raw('public.' + queryBatch.query_config.fiwareService)};
  `);

    return this.combineAttributesFromRows(result.rows);
  }

  combineAttributesFromRows(rows: Record<string, unknown>[]): {
    attributes: { attrName: string; values: unknown[] }[];
  } {
    const combined: Record<string, unknown[]> = {};

    for (const row of rows) {
      for (const [key, value] of Object.entries(row)) {
        if (!combined[key]) {
          combined[key] = [];
        }
        combined[key].push(value);
      }
    }

    return {
      attributes: Object.entries(combined).map(([key, values]) => ({
        attrName: key,
        values,
      })),
    };
  }

  async updateFiwareQueries(): Promise<void> {
    return;
  }
}
