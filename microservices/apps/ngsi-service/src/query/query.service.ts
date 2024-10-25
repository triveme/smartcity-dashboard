import { Inject, Injectable } from '@nestjs/common';
import { tabs, widgets } from '@app/postgres-db/schemas';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { queryConfigs } from '@app/postgres-db/schemas/query-config.schema';
import { and, eq, inArray, isNotNull, or } from 'drizzle-orm';
import { dataSources } from '@app/postgres-db/schemas/data-source.schema';
import { authData } from '@app/postgres-db/schemas/auth-data.schema';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  QueryBatch,
  QueryWithAllInfos,
  TabQueryWithAllInfos,
} from '../ngsi.service';

@Injectable()
export class QueryService {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getQueriesToUpdate(): Promise<Map<string, QueryBatch>> {
    const queriesWithAllInfos = await this.getAllQueriesWithAllInfos();
    // Only keep the queries that need to be updated (depending on their interval)
    const queriesToUpdate = this.filterQueriesToUpdate(queriesWithAllInfos);
    // Create a dictionary with the query_config hashes as keys so that we can
    // only fetch the data once for all queries with the same query_config hash
    return this.buildQueryHashMap(queriesToUpdate);
  }

  async getQueryHashMap(queryId: string): Promise<Map<string, QueryBatch>> {
    const queryWithAllInfos = await this.getQueryWithAllInfos(queryId);

    return this.buildQueryHashMap(queryWithAllInfos);
  }

  private buildQueryHashMap(
    queriesToUpdate: Array<QueryWithAllInfos>,
  ): Map<string, QueryBatch> {
    const queryHashMap = new Map<string, QueryBatch>();

    queriesToUpdate.forEach((queryWithAllInfos) => {
      const hash = queryWithAllInfos.query_config.hash;

      if (!queryHashMap.has(hash)) {
        queryHashMap.set(hash, {
          queryIds: [queryWithAllInfos.query.id],
          query_config: queryWithAllInfos.query_config,
          data_source: queryWithAllInfos.data_source,
          auth_data: queryWithAllInfos.auth_data,
        });
      } else {
        queryHashMap.get(hash).queryIds.push(queryWithAllInfos.query.id);
      }
    });

    return queryHashMap;
  }

  private filterQueriesToUpdate(
    queriesWithAllInfos: Array<QueryWithAllInfos>,
  ): QueryWithAllInfos[] {
    return queriesWithAllInfos.filter((queryWithAllInfos) => {
      if (queryWithAllInfos != null && queryWithAllInfos.query_config != null) {
        if (
          this.queryNeedsUpdate(
            queryWithAllInfos.query,
            queryWithAllInfos.query_config.interval,
          )
        ) {
          return queryWithAllInfos;
        }
      }
    });
  }

  async setQueryDataOfBatch(
    queryBatch: QueryBatch,
    newData: object | Array<object>,
  ): Promise<void> {
    try {
      await this.db
        .update(queries)
        .set({ queryData: newData, updatedAt: new Date(Date.now()) })
        .where(inArray(queries.id, queryBatch.queryIds));
    } catch (error) {
      console.error(
        'Error updating queries with ids:',
        queryBatch.queryIds,
        '\ndue to error: ',
        error,
      );
    }
  }

  async getAllQueriesWithAllInfos(): Promise<QueryWithAllInfos[]> {
    const imageTabQueries = this.db
      .select({ queryId: tabs.queryId })
      .from(tabs);

    return this.db
      .select()
      .from(queries)
      .leftJoin(queryConfigs, eq(queries.queryConfigId, queryConfigs.id))
      .leftJoin(dataSources, eq(queryConfigs.dataSourceId, dataSources.id))
      .leftJoin(authData, eq(dataSources.authDataId, authData.id))
      .where(inArray(queries.id, imageTabQueries))
      .where(or(eq(authData.type, 'ngsi-v2'), eq(authData.type, 'ngsi-ld')));
  }

  private async getQueryWithAllInfos(
    queryId: string,
  ): Promise<QueryWithAllInfos[]> {
    return this.db
      .select()
      .from(queries)
      .leftJoin(queryConfigs, eq(queries.queryConfigId, queryConfigs.id))
      .leftJoin(dataSources, eq(queryConfigs.dataSourceId, dataSources.id))
      .leftJoin(authData, eq(dataSources.authDataId, authData.id))
      .where(
        and(
          or(eq(authData.type, 'ngsi-v2'), eq(authData.type, 'ngsi-ld')),
          eq(queries.id, queryId),
        ),
      );
  }

  async getQueryWithAllInfosByWidgetId(
    widgetId: string,
  ): Promise<QueryWithAllInfos | null> {
    // Get the tab by widgetId
    const tab = await this.db
      .select()
      .from(tabs)
      .where(eq(tabs.widgetId, widgetId));

    if (tab.length === 0) return null;

    // Get the query by queryId from the tab
    const query = await this.db
      .select()
      .from(queries)
      .where(eq(queries.id, tab[0].queryId));

    if (query.length === 0) return null;

    // Get the queryConfig by queryConfigId from the query
    const queryConfig = await this.db
      .select()
      .from(queryConfigs)
      .where(eq(queryConfigs.id, query[0].queryConfigId));

    if (queryConfig.length === 0) return null;

    // Get the dataSource by dataSourceId from the queryConfig
    const queryDataSource = await this.db
      .select()
      .from(dataSources)
      .where(eq(dataSources.id, queryConfig[0].dataSourceId));

    if (queryDataSource.length === 0) return null;

    // Get the authData by authDataId from the dataSource
    const queryAuthData = await this.db
      .select()
      .from(authData)
      .where(eq(authData.id, queryDataSource[0].authDataId));

    if (queryAuthData.length === 0) return null;

    // Return the combined QueryWithAllInfos object
    return {
      query: query[0],
      query_config: queryConfig[0],
      data_source: queryDataSource[0],
      auth_data: queryAuthData[0],
    };
  }

  async getAllImagesWithAllInfos(): Promise<TabQueryWithAllInfos[]> {
    return this.db
      .select()
      .from(tabs)
      .leftJoin(queries, eq(tabs.queryId, queries.id))
      .leftJoin(widgets, eq(tabs.widgetId, widgets.id))
      .where(and(eq(tabs.componentType, 'Bild'), isNotNull(tabs.imageUrl)));
  }

  queryNeedsUpdate(query: Query, interval: number): boolean {
    const currentTime = new Date();
    const updatedAt = new Date(query.updatedAt);
    const timeDifference = currentTime.getTime() - updatedAt.getTime();

    // Check if the time difference is less than the queryConfig's interval (in seconds)
    return timeDifference > interval * 1000;
  }
}
