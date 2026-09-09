/* eslint @typescript-eslint/no-explicit-any: 0 */
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import { and, eq, exists, inArray, isNull } from 'drizzle-orm';
import { systemUsers } from '@app/postgres-db/schemas/tenant.system-user.schema';
import { checkAuthorizationToRead } from '@app/auth-helper/right-management/right-management.service';

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
  queryConfigSnapshot: Pick<QueryConfig, 'id' | 'hash'>;
  data_source: DataSource;
  auth_data: AuthData;
};

@Injectable()
export class UsiPlaformService {
  private readonly logger = new Logger(UsiPlaformService.name);

  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly queryService: QueryService,
    private readonly queryConfigService: QueryConfigService,
  ) {}

  async updateFiwareQueries(): Promise<void> {
    const queryHashMap = await this.queryService.getQueriesToUpdate();
    await Promise.all(
      Array.from(queryHashMap.values()).map((queryBatch) =>
        this.enqueueQueryData(queryBatch, 'scheduler'),
      ),
    );
  }

  async enqueueQueryPopulation(
    queryId: string,
    roles: string[],
    tenant?: string,
  ): Promise<void> {
    const queryBatches = Array.from(
      (await this.queryService.getQueryHashMap(queryId)).values(),
    );
    if (queryBatches.length === 0) {
      throw new NotFoundException(`No USI query found with id: ${queryId}`);
    }

    for (const queryBatch of queryBatches) {
      this.assertPopulationAccess(queryBatch, roles, tenant);
      void this.enqueueQueryData(queryBatch, 'population').catch((error) =>
        this.logger.error(
          `Failed to populate query ${queryId}`,
          error instanceof Error ? error.stack : undefined,
        ),
      );
    }
  }

  async getQueuedQueryData(
    queryId: string,
    overrides: object,
    roles: string[],
    tenant?: string,
  ): Promise<object> {
    const queryBatch = Array.from(
      (await this.queryService.getQueryHashMap(queryId)).values(),
    )[0];
    if (!queryBatch) {
      throw new NotFoundException(`No USI query found with id: ${queryId}`);
    }
    this.assertPopulationAccess(queryBatch, roles, tenant);
    const effectiveBatch: QueryBatch = {
      ...queryBatch,
      query_config: { ...queryBatch.query_config, ...overrides },
    };
    return this.queryConfigService.executeQueuedFetch({
      category: 'dashboard-data',
      priority: 'interactive',
      fingerprintInput: {
        platform: 'usi',
        operation: 'dashboard-query-data',
        target: { dataSourceId: effectiveBatch.data_source.id },
        queryConfig: this.getEffectiveQueryConfig(effectiveBatch.query_config),
        runtimeParameters: { queryId, overrides },
        unorderedCollectionPaths: [
          'queryConfig.entityIds',
          'queryConfig.attributes',
        ],
      },
      execute: (signal) => this.getDataFromDataSource(effectiveBatch, signal),
    });
  }

  private assertPopulationAccess(
    queryBatch: QueryBatch,
    roles: string[],
    tenant?: string,
  ): void {
    if (
      tenant &&
      queryBatch.auth_data.tenantAbbreviation &&
      queryBatch.auth_data.tenantAbbreviation !== tenant
    ) {
      throw new ForbiddenException(
        'Query does not belong to the authenticated tenant',
      );
    }
    checkAuthorizationToRead(queryBatch.auth_data, roles);
  }

  private async enqueueQueryData(
    queryBatch: QueryBatch,
    category: 'scheduler' | 'population',
  ): Promise<void> {
    await this.queryConfigService.executeQueuedFetch({
      category,
      priority: 'background',
      fingerprintInput: {
        platform: 'usi',
        operation: 'query-data',
        target: {
          dataSourceId: queryBatch.data_source.id,
          authDataId: queryBatch.auth_data.id,
          apiUrl: queryBatch.auth_data.apiUrl,
          liveUrl: queryBatch.auth_data.liveUrl,
        },
        queryConfig: this.getEffectiveQueryConfig(queryBatch.query_config),
        runtimeParameters: {},
        unorderedCollectionPaths: [
          'queryConfig.entityIds',
          'queryConfig.attributes',
        ],
      },
      execute: async (signal) => {
        const newData = await this.getDataFromDataSource(queryBatch, signal);
        signal.throwIfAborted();
        if (newData) {
          await this.setQueryDataOfBatch(queryBatch, newData);
        }
      },
    });
  }

  private getEffectiveQueryConfig(queryConfig: QueryConfig): object {
    return {
      dataSourceId: queryConfig.dataSourceId,
      eventType: queryConfig.fiwareType,
      entityIds: queryConfig.entityIds,
      attributes: queryConfig.attributes,
      timeframe: queryConfig.timeframe,
      dataStartDate: queryConfig.dataStartDate,
      dataUntilDate: queryConfig.dataUntilDate,
      aggrMode: queryConfig.aggrMode,
      aggrPeriod: queryConfig.aggrPeriod,
    };
  }

  async getDataFromDataSource(
    queryBatch: QueryBatch,
    signal?: AbortSignal,
  ): Promise<object> {
    const data = await this.queryConfigService.getSensorData(
      queryBatch.query_config,
      signal,
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
          queryConfigSnapshot: {
            id: queryWithAllInfos.query_config.id,
            hash: queryWithAllInfos.query_config.hash,
          },
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
      const hashMatches =
        queryBatch.queryConfigSnapshot.hash === null
          ? isNull(queryConfigs.hash)
          : eq(queryConfigs.hash, queryBatch.queryConfigSnapshot.hash);
      const updatedQueries = await this.db
        .update(queries)
        .set({ queryData: newData, updatedAt: new Date(Date.now()) })
        .where(
          and(
            inArray(queries.id, queryBatch.queryIds),
            eq(queries.queryConfigId, queryBatch.queryConfigSnapshot.id),
            exists(
              this.db
                .select({ id: queryConfigs.id })
                .from(queryConfigs)
                .where(
                  and(
                    eq(queryConfigs.id, queryBatch.queryConfigSnapshot.id),
                    hashMatches,
                  ),
                ),
            ),
          ),
        )
        .returning({ id: queries.id });
      if (updatedQueries.length === 0) {
        this.logger.warn(
          `Discarded stale query result for configuration ${queryBatch.queryConfigSnapshot.id}`,
        );
      }
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
