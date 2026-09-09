import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { AuthData, authData } from '@app/postgres-db/schemas/auth-data.schema';
import {
  DataSource,
  dataSources,
} from '@app/postgres-db/schemas/data-source.schema';
import {
  QueryConfig,
  queryConfigs,
} from '@app/postgres-db/schemas/query-config.schema';
import { Query, queries } from '@app/postgres-db/schemas/query.schema';
import { tabs } from '@app/postgres-db/schemas/dashboard.tab.schema';

export type ResolvedQuery = {
  query: Query;
  query_config: QueryConfig;
  data_source: DataSource;
  auth_data: AuthData;
};

@Injectable()
export class PlatformQueryResolverService {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getByWidgetId(widgetId: string): Promise<ResolvedQuery | null> {
    const tab = await this.db
      .select()
      .from(tabs)
      .where(eq(tabs.widgetId, widgetId));
    if (!tab[0]?.queryId) return null;
    return this.getByQueryId(tab[0].queryId);
  }

  async getByQueryId(queryId: string): Promise<ResolvedQuery | null> {
    const rows = await this.db
      .select()
      .from(queries)
      .innerJoin(queryConfigs, eq(queries.queryConfigId, queryConfigs.id))
      .innerJoin(dataSources, eq(queryConfigs.dataSourceId, dataSources.id))
      .innerJoin(authData, eq(dataSources.authDataId, authData.id))
      .where(eq(queries.id, queryId));
    return rows[0] ?? null;
  }
}
