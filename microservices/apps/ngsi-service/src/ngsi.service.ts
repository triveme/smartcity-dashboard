import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { DataSource } from '@app/postgres-db/schemas/data-source.schema';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { AuthData } from '@app/postgres-db/schemas/auth-data.schema';
import { Tab, Widget } from '@app/postgres-db/schemas';
import { ReportService } from './report/report.service';
import { DataService } from './data/data.service';
import { QueryService } from './query/query.service';
import { ChartData } from 'apps/dashboard-service/src/dashboard/dashboard.service';
import { createCredentialFingerprint } from '@app/data-platform-queue';
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
export class NgsiService {
  private readonly logger = new Logger(NgsiService.name);

  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly dataService: DataService,
    private readonly reportService: ReportService,
    private readonly queryService: QueryService,
  ) {}

  async updateQueries(): Promise<void> {
    console.log('Updating queries at', new Date().toISOString());
    await this.updateFiwareQueries();
    await this.updateImageQueries();
    await this.reportService.updateReportData();
    console.log('Queries updated successfully at', new Date().toISOString());
  }

  async updateImageQueries(): Promise<void> {
    const tabQueriesWithAllInfos =
      await this.queryService.getAllImagesWithAllInfos();

    // Only keep the queries that need to be updated (depending on their interval)
    const tabQueriesToUpdate = tabQueriesWithAllInfos.filter(
      (queryWithAllInfos) =>
        this.queryService.queryNeedsUpdate(
          queryWithAllInfos.query,
          queryWithAllInfos.tab.imageUpdateInterval,
        ),
    );

    for (const tabQueryWithAllInfos of tabQueriesToUpdate) {
      const imageData =
        await this.dataService.getImageFromSource(tabQueryWithAllInfos);
      const query = tabQueryWithAllInfos.query;
      // If data just inclused the http error status code

      if (/^[0-9]{3}$/.test(imageData)) {
        query.updateMessage = [
          'Something went wrong, when updating the image.',
        ];
        query.queryData = null;
      } else {
        query.queryData = {
          imageData: imageData,
        };
        query.updateMessage = null;
      }

      await this.updateImageQueryData(query);
    }
  }

  async updateFiwareQueries(): Promise<void> {
    const queryHashMap = await this.queryService.getQueriesToUpdate();
    await Promise.allSettled(
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
      throw new NotFoundException(`No NGSI query found with id: ${queryId}`);
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
    overrides: Partial<QueryConfig>,
    roles: string[],
    tenant?: string,
  ): Promise<object | object[]> {
    const queryBatch = Array.from(
      (await this.queryService.getQueryHashMap(queryId)).values(),
    )[0];
    if (!queryBatch) {
      throw new NotFoundException(`No NGSI query found with id: ${queryId}`);
    }

    this.assertPopulationAccess(queryBatch, roles, tenant);
    const effectiveBatch: QueryBatch = {
      ...queryBatch,
      query_config: {
        ...queryBatch.query_config,
        ...overrides,
        dataStartDate: overrides.dataStartDate
          ? new Date(overrides.dataStartDate)
          : queryBatch.query_config.dataStartDate,
        dataUntilDate: overrides.dataUntilDate
          ? new Date(overrides.dataUntilDate)
          : queryBatch.query_config.dataUntilDate,
      },
    };

    return this.dataService.executeQueuedFetch({
      category: 'dashboard-data',
      priority: 'interactive',
      fingerprintInput: {
        platform: 'ngsi',
        operation: 'dashboard-query-data',
        target: {
          dataSourceId: effectiveBatch.data_source.id,
          authDataId: effectiveBatch.auth_data.id,
          type: effectiveBatch.auth_data.type,
        },
        queryConfig: this.getEffectiveQueryConfig(effectiveBatch.query_config),
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
        platform: 'ngsi',
        operation: 'query-data',
        target: {
          dataSourceId: queryBatch.data_source.id,
          authDataId: queryBatch.auth_data.id,
          type: queryBatch.auth_data.type,
          liveUrl: queryBatch.auth_data.liveUrl,
          timeSeriesUrl: queryBatch.auth_data.timeSeriesUrl,
          ngsildTenant: queryBatch.auth_data.ngsildTenant,
        },
        queryConfig: this.getEffectiveQueryConfig(queryBatch.query_config),
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
          await this.queryService.setQueryDataOfBatch(queryBatch, newData);
        }
      },
    });
  }

  private getEffectiveQueryConfig(queryConfig: QueryConfig): object {
    return {
      dataSourceId: queryConfig.dataSourceId,
      fiwareService: queryConfig.fiwareService,
      fiwareServicePath: queryConfig.fiwareServicePath,
      fiwareType: queryConfig.fiwareType,
      entityIds: queryConfig.entityIds,
      attributes: queryConfig.attributes,
      timeframe: queryConfig.timeframe,
      dataStartDate: queryConfig.dataStartDate,
      dataUntilDate: queryConfig.dataUntilDate,
      extendedDateSelection: queryConfig.extendedDateSelection,
      aggrMode: queryConfig.aggrMode,
      aggrPeriod: queryConfig.aggrPeriod,
      isBlacklist: queryConfig.isBlacklist,
    };
  }

  async updateImageQueryData(query: Query): Promise<void> {
    try {
      await this.db
        .update(queries)
        .set({
          queryData: query.queryData,
          updateMessage: query.updateMessage,
          updatedAt: new Date(Date.now()),
        })
        .where(eq(queries.id, query.id));
    } catch (error) {
      console.error(
        'Error updating queries with ids:',
        query.id,
        '\ndue to error: ',
        error,
      );
    }
  }

  async getOnDemandData(
    queryId: string,
    entityId: string,
    attribute: string,
  ): Promise<ChartData> {
    const queryHashMap = await this.queryService.getQueryHashMap(queryId);

    if (queryHashMap.size === 0) {
      throw new Error(`No query found with id: ${queryId}`);
    }

    // Get the first (and only) QueryBatch
    const queryBatch = Array.from(queryHashMap.values())[0];
    queryBatch.query_config.timeframe = 'week';
    queryBatch.query_config.aggrPeriod = 'day';
    queryBatch.query_config.aggrMode = 'avg';
    queryBatch.query_config.attributes = [attribute];
    queryBatch.query_config.entityIds = [entityId];

    const data = await this.dataService.executeQueuedFetch({
      category: 'on-demand',
      priority: 'interactive',
      fingerprintInput: {
        platform: 'ngsi',
        operation: 'on-demand-data',
        target: {
          dataSourceId: queryBatch.data_source.id,
          authDataId: queryBatch.auth_data.id,
          type: queryBatch.auth_data.type,
          credentialFingerprint: createCredentialFingerprint(
            JSON.stringify({
              authDataId: queryBatch.auth_data.id,
              clientId: queryBatch.auth_data.clientId,
              clientSecret: queryBatch.auth_data.clientSecret,
              appUser: queryBatch.auth_data.appUser,
              appUserPassword: queryBatch.auth_data.appUserPassword,
            }),
          ),
        },
        queryConfig: this.getEffectiveQueryConfig(queryBatch.query_config),
        runtimeParameters: { queryId, entityId, attribute },
        unorderedCollectionPaths: [
          'queryConfig.entityIds',
          'queryConfig.attributes',
        ],
      },
      execute: (signal) =>
        this.dataService.getDataFromDataSource(queryBatch, signal),
    });
    const transformedData: [string, number][] = [];

    // DATAMAPPING
    if (
      data &&
      data['index'] &&
      data['attributes'] &&
      data['attributes'].length > 0
    ) {
      const attrData = data['attributes'].find(
        (attr) => attr.attrName === attribute,
      );

      if (attrData && attrData.values) {
        transformedData.push(
          ...data['index'].map((date, idx) => [date, attrData.values[idx]]),
        );
      }
    }

    return {
      name: attribute,
      values: transformedData,
    };
  }
}
