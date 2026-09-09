import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  QueryBatch,
  QueryWithAllInfos,
} from '../../../orchideo-connect-service/src/api.service';
import { QueryBatch as InternalDataQueryBatch } from '../data/data.service';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { queryConfigs } from '@app/postgres-db/schemas/query-config.schema';
import { and, eq, exists, inArray, isNull } from 'drizzle-orm';
import { dataSources } from '@app/postgres-db/schemas/data-source.schema';
import { authData } from '@app/postgres-db/schemas/auth-data.schema';
import { systemUsers } from '@app/postgres-db/schemas/tenant.system-user.schema';
import { DataService } from '../data/data.service';
import { TransformationService } from '../transformation/transformation.service';
import { OutputEntry } from '../data/csv-parser';
import { checkAuthorizationToRead } from '@app/auth-helper/right-management/right-management.service';

@Injectable()
export class QueryService {
  private readonly logger = new Logger(QueryService.name);

  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly dataService: DataService,
    private readonly transformationService: TransformationService,
  ) {}

  async updateQueries(): Promise<void> {
    const queriesToUpdate = await this.getQueriesToUpdate();
    for (const queryBatch of Array.from(queriesToUpdate.values())) {
      await this.enqueueQueryData(queryBatch, 'scheduler');
    }
  }

  async enqueueQueryPopulation(
    queryId: string,
    roles: string[],
    tenant?: string,
  ): Promise<void> {
    const queryBatches = Array.from(
      (await this.getQueryHashMap(queryId)).values(),
    );
    if (queryBatches.length === 0) {
      throw new NotFoundException(
        `No internal-data query found with id: ${queryId}`,
      );
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
  ): Promise<OutputEntry[]> {
    const queryBatch = Array.from(
      (await this.getQueryHashMap(queryId)).values(),
    )[0];
    if (!queryBatch) {
      throw new NotFoundException(
        `No internal-data query found with id: ${queryId}`,
      );
    }
    this.assertPopulationAccess(queryBatch, roles, tenant);
    const effectiveBatch: QueryBatch = {
      ...queryBatch,
      query_config: { ...queryBatch.query_config, ...overrides },
    };
    return this.dataService.executeQueuedFetch({
      category: 'dashboard-data',
      priority: 'interactive',
      fingerprintInput: {
        platform: 'internal-data',
        operation: 'dashboard-query-data',
        target: { dataSourceId: effectiveBatch.data_source.id },
        queryConfig: this.getEffectiveQueryConfig(effectiveBatch),
        runtimeParameters: { queryId, overrides },
        unorderedCollectionPaths: [
          'queryConfig.entityIds',
          'queryConfig.attributes',
        ],
      },
      execute: (signal) =>
        this.dataService.getDataFromDataSource(effectiveBatch, signal),
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
    await this.dataService.executeQueuedFetch({
      category,
      priority: 'background',
      fingerprintInput: {
        platform: 'internal-data',
        operation: 'query-data',
        target: {
          dataSourceId: queryBatch.data_source.id,
          collection: queryBatch.query_config.fiwareService,
          source: queryBatch.query_config.fiwareType,
        },
        queryConfig: this.getEffectiveQueryConfig(queryBatch),
        runtimeParameters: {},
        unorderedCollectionPaths: [
          'queryConfig.entityIds',
          'queryConfig.attributes',
        ],
      },
      execute: async (signal) => {
        const newData = await this.dataService.getDataFromDataSource(
          queryBatch,
          signal,
        );
        signal.throwIfAborted();
        if (newData) {
          const transformedData =
            this.transformationService.transformCollection(
              newData,
              queryBatch.query_config.attributes,
              queryBatch.query_config.fiwareType,
            );
          const dataToSave = { attrs: transformedData };

          signal.throwIfAborted();
          await this.setQueryDataOfBatch(queryBatch, dataToSave);
        }
      },
    });
  }

  private getEffectiveQueryConfig(queryBatch: QueryBatch): object {
    const { query_config: queryConfig } = queryBatch;
    return {
      dataSourceId: queryConfig.dataSourceId,
      collection: queryConfig.fiwareService,
      source: queryConfig.fiwareType,
      entityIds: queryConfig.entityIds,
      attributes: queryConfig.attributes,
    };
  }

  async getDataFromDataSource(
    queryBatch: InternalDataQueryBatch,
    signal?: AbortSignal,
  ): Promise<OutputEntry[]> {
    return await this.dataService.getDataFromDataSource(queryBatch, signal);
  }

  async getQueriesToUpdate(): Promise<Map<string, QueryBatch>> {
    const queriesWithAllInfos = await this.getAllQueriesWithAllInfos();
    // Only keep the queries that need to be updated (depending on their interval)
    const queriesToUpdate = this.filterQueriesToUpdate(queriesWithAllInfos);
    // Create a dictionary with the query_config hashes as keys so that we can
    // only fetch the data once for all queries with the same query_config hash
    return this.buildQueryHashMap(queriesToUpdate);
  }

  async getQueryHashMap(queryId: string): Promise<Map<string, QueryBatch>> {
    return this.buildQueryHashMap(await this.getQueryWithAllInfos(queryId));
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
          system_user: queryWithAllInfos.system_user,
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
      .where(eq(dataSources.origin, 'internal'));
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
      .leftJoin(
        systemUsers,
        eq(authData.tenantAbbreviation, systemUsers.tenantAbbreviation),
      )
      .where(and(eq(dataSources.origin, 'internal'), eq(queries.id, queryId)));
  }

  queryNeedsUpdate(query: Query, interval: number): boolean {
    const currentTime = new Date();
    const updatedAt = new Date(query.updatedAt);
    const timeDifference = currentTime.getTime() - updatedAt.getTime();

    // Check if the time difference is less than the queryConfig's interval (in seconds)
    return timeDifference > interval * 1000;
  }
}
