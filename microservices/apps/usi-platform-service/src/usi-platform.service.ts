/* eslint @typescript-eslint/no-explicit-any: 0 */
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Inject, Injectable } from '@nestjs/common';
import { QueryService } from './query/query.service';
import { QueryConfigService } from './data/data.service';
import {
  QueryConfig,
  queryConfigs,
} from '@app/postgres-db/schemas/query-config.schema';
import { Tab, Widget } from '@app/postgres-db/schemas';
import { authData, AuthData } from '@app/postgres-db/schemas/auth-data.schema';
import {
  DataSource,
  dataSources,
} from '@app/postgres-db/schemas/data-source.schema';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { eq, inArray } from 'drizzle-orm';
import { systemUsers } from '@app/postgres-db/schemas/tenant.system-user.schema';

export type QueryWithAllInfos = {
  query: Query;
  query_config: QueryConfig;
  data_source: DataSource;
  auth_data: AuthData;
};

export type TabQueryWithAllInfos = {
  tab: Tab;
  widget: Widget;
  query: Query;
};

export type QueryBatch = {
  queryIds: string[];
  query_config: QueryConfig;
  data_source: DataSource;
  auth_data: AuthData;
};

@Injectable()
export class UsiPlaformService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly queryService: QueryService,
    private readonly queryConfigService: QueryConfigService,
  ) {}

  async updateFiwareQueries(): Promise<void> {
    const queryHashMap = await this.queryService.getQueriesToUpdate();

    // Create an array of promises from the dictionary. Each promise will fetch the data
    // from the data source and update all of it's queries (with the same hash) with the new data.
    const updates = Array.from(queryHashMap.values()).map(
      async (queryBatch) => {
        const newData = await this.getDataFromDataSource(queryBatch);
        if (newData) {
          //const transformedData = this.transformationService.transformCollection(
          //  newData,
          //  queryBatch.query_config.attributes,
          //  queryBatch.query_config.fiwareType,
          //);
          await this.setQueryDataOfBatch(queryBatch, newData);
        }
      },
    );

    // Wait for all promises to resolve (this will send all the requests
    // to the data sources and update all the queries in parallel)
    await Promise.all(updates);
  }

  async getDataFromDataSource(queryBatch: QueryBatch): Promise<object> {
    const data = await this.queryConfigService.getSensorData(
      queryBatch.query_config,
    );
    return data;
  }

  async getQueriesToUpdate(): Promise<Map<string, QueryBatch>> {
    const queriesWithAllInfos = await this.getAllQueriesWithAllInfos();
    // Only keep the queries that need to be updated (depending on their interval)
    const queriesToUpdate = this.filterQueriesToUpdate(queriesWithAllInfos);
    // Create a dictionary with the query_config hashes as keys so that we can
    // only fetch the data once for all queries with the same query_config hash
    return this.buildQueryHashMap(queriesToUpdate);
  }

  private buildQueryHashMap(
    queriesToUpdate: Array<QueryWithAllInfos>,
  ): Map<string, QueryBatch> {
    // Create a dictionary with the query_config hashes as keys so that we can
    // only fetch the data once for all queries with the same query_config hash
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

  async getAllQueriesWithAllInfos(): Promise<QueryWithAllInfos[]> {
    // Select all queries & their related tables where the origin of the datasource = internal
    return this.db
      .select()
      .from(queries)
      .leftJoin(queryConfigs, eq(queries.queryConfigId, queryConfigs.id))
      .leftJoin(dataSources, eq(queryConfigs.dataSourceId, dataSources.id))
      .leftJoin(authData, eq(dataSources.authDataId, authData.id))
      .leftJoin(
        systemUsers,
        eq(authData.tenantAbbreviation, systemUsers.tenantAbbreviation),
      )
      .where(eq(dataSources.origin, 'usi'));
  }

  queryNeedsUpdate(query: Query, interval: number): boolean {
    const currentTime = new Date();
    const updatedAt = new Date(query.updatedAt);
    const timeDifference = currentTime.getTime() - updatedAt.getTime();

    // Check if the time difference is less than the queryConfig's interval (in seconds)
    return timeDifference > interval * 1000;
  }

  async setQueryDataOfBatch(
    queryBatch: QueryBatch,
    newData: object | object[],
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
}
