/* eslint @typescript-eslint/no-explicit-any: 0 */
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { authData, AuthData } from '@app/postgres-db/schemas/auth-data.schema';
import {
  DataSource,
  dataSources,
} from '@app/postgres-db/schemas/data-source.schema';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { QueryService } from './query/query.service';
import { DataService } from './data/data.service';
import { SystemUser } from '@app/postgres-db/schemas/tenant.system-user.schema';
import { AuthService } from './auth/auth.service';
import { eq } from 'drizzle-orm';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { checkAuthorizationToRead } from '@app/auth-helper/right-management/right-management.service';

export type QueryWithAllInfos = {
  query: Query;
  query_config: QueryConfig;
  data_source: DataSource;
  auth_data: AuthData;
  system_user: SystemUser;
};

export type TenantToQueryBatch = Map<string, Map<string, QueryBatch>>;

export type QueryBatch = {
  queryIds: string[];
  query_config: QueryConfig;
  queryConfigSnapshot: Pick<QueryConfig, 'id' | 'hash'>;
  data_source: DataSource;
  auth_data: AuthData;
  system_user: SystemUser;
};

@Injectable()
export class OrchideoConnectService {
  private readonly logger = new Logger(OrchideoConnectService.name);

  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly queryService: QueryService,
    private readonly dataService: DataService,
    private readonly authService: AuthService,
  ) {}

  async getCollections(
    authorizationToken: string,
    apiId?: string,
  ): Promise<string[]> {
    return this.dataService.getCollections(authorizationToken, apiId);
  }

  async getSources(
    collection: string,
    authorizationToken: string,
    apiId: string,
  ): Promise<string[]> {
    return this.dataService.getSources(collection, authorizationToken, apiId);
  }

  async getEntities(
    collection: string,
    source: string,
    authorizationToken: string,
    apiId: string,
  ): Promise<string[]> {
    return this.dataService.getEntities(
      collection,
      source,
      authorizationToken,
      apiId,
    );
  }

  async getAttributes(
    collection: string,
    source: string,
    authorizationToken: string,
    apiId: string,
  ): Promise<string[]> {
    return this.dataService.getAttributes(
      collection,
      source,
      authorizationToken,
      apiId,
    );
  }

  async updateQueries(): Promise<void> {
    const queryHashMap = await this.queryService.getQueriesToUpdate();

    for (const tenant of queryHashMap.keys()) {
      const updates: Promise<void>[] = Array.from(
        queryHashMap.get(tenant).values(),
      ).map((queryBatch) => this.enqueueQueryData(queryBatch, 'scheduler'));

      await Promise.all(updates);
    }
  }

  async enqueueQueryPopulation(
    queryId: string,
    roles: string[],
    tenant?: string,
  ): Promise<void> {
    const tenantBatches = await this.queryService.getQueryHashMap(queryId);
    const queryBatches = Array.from(tenantBatches.values()).flatMap((batches) =>
      Array.from(batches.values()),
    );
    if (queryBatches.length === 0) {
      throw new NotFoundException(
        `No Orchideo query found with id: ${queryId}`,
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
  ): Promise<object> {
    const tenantBatches = await this.queryService.getQueryHashMap(queryId);
    const queryBatch = Array.from(tenantBatches.values()).flatMap((batches) =>
      Array.from(batches.values()),
    )[0];
    if (!queryBatch) {
      throw new NotFoundException(
        `No Orchideo query found with id: ${queryId}`,
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
        platform: 'orchideo',
        operation: 'dashboard-query-data',
        target: {
          dataSourceId: effectiveBatch.data_source.id,
          authDataId: effectiveBatch.auth_data.id,
          apiUrl: effectiveBatch.auth_data.apiUrl,
        },
        queryConfig: this.getEffectiveQueryConfig(effectiveBatch.query_config),
        runtimeParameters: { queryId, overrides },
        unorderedCollectionPaths: [
          'queryConfig.entityIds',
          'queryConfig.attributes',
        ],
      },
      execute: async (signal) => {
        const data = await this.dataService.getDataFromDataSource(
          effectiveBatch,
          signal,
        );
        return this.transformToTargetModel(Array.isArray(data) ? data : [data]);
      },
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
        platform: 'orchideo',
        operation: 'query-data',
        target: {
          dataSourceId: queryBatch.data_source.id,
          authDataId: queryBatch.auth_data.id,
          apiUrl: queryBatch.auth_data.apiUrl,
          tenant: queryBatch.auth_data.tenantAbbreviation,
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
        if (!newData) {
          this.logger.warn(
            `No data received for query batch with ID: ${queryBatch.queryIds.join(', ')}`,
          );
          return;
        }

        const queryConfig = queryBatch.query_config;
        const filteredData = this.filterByAttribute(
          queryConfig.attributes,
          newData,
        );
        const aggregatedData = this.aggregateData(
          filteredData,
          queryConfig.timeframe,
          queryConfig.aggrMode,
          queryConfig.attributes,
          queryConfig.aggrPeriod,
        );
        const transformedData = this.transformToTargetModel(aggregatedData);
        signal.throwIfAborted();
        await this.queryService.setQueryDataOfBatch(
          queryBatch,
          transformedData,
        );
      },
    });
  }

  private getEffectiveQueryConfig(queryConfig: QueryConfig): object {
    return {
      dataSourceId: queryConfig.dataSourceId,
      collection: queryConfig.fiwareService,
      source: queryConfig.fiwareType,
      entityIds: queryConfig.entityIds,
      attributes: queryConfig.attributes,
      timeframe: queryConfig.timeframe,
      dataStartDate: queryConfig.dataStartDate,
      dataUntilDate: queryConfig.dataUntilDate,
      extendedDateSelection: queryConfig.extendedDateSelection,
      aggrMode: queryConfig.aggrMode,
      aggrPeriod: queryConfig.aggrPeriod,
    };
  }

  private filterByAttribute(attributes: string[], data: object[]): object[] {
    return data.map((item) => {
      const reducedItem = {};
      // Always keep id and timestamp
      reducedItem['id'] = item['id'];
      reducedItem['timestamp'] = item['timestamp'];

      for (const attribute of attributes) {
        // eslint-disable-next-line no-prototype-builtins
        if (item.hasOwnProperty(attribute)) {
          reducedItem[attribute] = item[attribute];
        }
      }
      return reducedItem;
    });
  }

  transformToTargetModel(data: any[]): any {
    // Group data by `id`
    const groupedData = data.reduce(
      (acc, item) => {
        if (item && item.id) {
          if (!acc[item.id]) {
            acc[item.id] = [];
          }
          acc[item.id].push(item);
        }
        return acc;
      },
      {} as Record<string, any[]>,
    );

    const entityIds = Object.keys(groupedData);

    // SINGLE ENTITY
    if (entityIds.length === 1) {
      const id = entityIds[0];
      const entityRecords = groupedData[id];

      // Extract all attribute names dynamically (excluding `id` and `timestamp`)
      const attributeNames = Object.keys(entityRecords[0]).filter(
        (key) => key !== 'id' && key !== 'timestamp',
      );

      return {
        entityId: `${id}`,
        attributes: attributeNames.map((attr) => ({
          attrName: attr,
          values: entityRecords.map((item) => item[attr]),
        })),
        index: entityRecords.map((item) => item.timestamp),
      };
    }

    // MULTIPLE ENTITIES
    const allAttributeNames = new Set<string>();
    Object.values(groupedData).forEach((records) => {
      Object.keys(records[0])
        .filter((key) => key !== 'id' && key !== 'timestamp')
        .forEach((attr) => allAttributeNames.add(attr));
    });

    return {
      attrs: Array.from(allAttributeNames).map((attrName) => ({
        attrName,
        types: [
          {
            entities: entityIds.map((entityId) => {
              const records = groupedData[entityId];
              return {
                entityId,
                index: records.map((item) => item.timestamp),
                values: records.map((item) => item[attrName] || null),
              };
            }),
          },
        ],
      })),
    };
  }

  private aggregateData(
    data,
    timeframe: Timeframe,
    aggregationMode: AggregationMode,
    attributes: string[],
    aggregationPeriod: AggregationPeriod,
  ): object[] {
    let aggregatedData: object[] = [];

    if (aggregationMode === 'none') {
      return data;
    }

    const sensorDataMap = this.buildSensorDataMap(data);

    switch (timeframe) {
      case 'day':
        for (const sensorValues of sensorDataMap.values()) {
          const aggregatedValues = this.aggregateTimeframe(
            sensorValues,
            1,
            this.getIntervalStep(aggregationPeriod),
            attributes,
            aggregationMode,
          );
          aggregatedData = [...aggregatedData, ...aggregatedValues];
        }
        break;

      case 'week':
        for (const sensorValues of sensorDataMap.values()) {
          const aggregatedValues = this.aggregateTimeframe(
            sensorValues,
            7,
            this.getIntervalStep(aggregationPeriod),
            attributes,
            aggregationMode,
          );
          aggregatedData = [...aggregatedData, ...aggregatedValues];
        }
        break;

      case 'month':
        for (const sensorValues of sensorDataMap.values()) {
          const aggregatedValues = this.aggregateTimeframe(
            sensorValues,
            30,
            this.getIntervalStep(aggregationPeriod),
            attributes,
            aggregationMode,
          );
          aggregatedData = [...aggregatedData, ...aggregatedValues];
        }
        break;

      case 'quarter':
        for (const sensorValues of sensorDataMap.values()) {
          const aggregatedValues = this.aggregateTimeframe(
            sensorValues,
            90,
            this.getIntervalStep(aggregationPeriod),
            attributes,
            aggregationMode,
          );
          aggregatedData = [...aggregatedData, ...aggregatedValues];
        }
        break;

      case 'year':
        for (const sensorValues of sensorDataMap.values()) {
          const aggregatedValues = this.aggregateTimeframe(
            sensorValues,
            365,
            this.getIntervalStep(aggregationPeriod),
            attributes,
            aggregationMode,
          );
          aggregatedData = [...aggregatedData, ...aggregatedValues];
        }
        break;

      case 'year2':
        for (const sensorValues of sensorDataMap.values()) {
          const aggregatedValues = this.aggregateTimeframe(
            sensorValues,
            365 * 2,
            this.getIntervalStep(aggregationPeriod),
            attributes,
            aggregationMode,
          );
          aggregatedData = [...aggregatedData, ...aggregatedValues];
        }
        break;

      case 'year3':
        for (const sensorValues of sensorDataMap.values()) {
          const aggregatedValues = this.aggregateTimeframe(
            sensorValues,
            365 * 3,
            this.getIntervalStep(aggregationPeriod),
            attributes,
            aggregationMode,
          );
          aggregatedData = [...aggregatedData, ...aggregatedValues];
        }
        break;

      case 'live':
        return aggregatedData;

      default:
        this.logger.warn(`Invalid timeframe supplied: ${timeframe}`);
        return data;
    }

    return aggregatedData;
  }

  private getIntervalStep(aggregationPeriod: AggregationPeriod): number {
    switch (aggregationPeriod) {
      case 'second':
        return 1000;
      case 'minute':
        return 60 * 1000;
      case 'hour':
        return 60 * 60 * 1000;
      case 'day':
        return 24 * 60 * 60 * 1000;
      case 'week':
        return 7 * 24 * 60 * 60 * 1000;
      case 'month':
        return 30 * 24 * 60 * 60 * 1000;
      case 'year':
        return 365 * 24 * 60 * 60 * 1000;
      default:
        this.logger.error(
          `Invalid aggregation period supplied: ${aggregationPeriod}`,
        );
        throw new Error('Invalid aggregation period.');
    }
  }

  private aggregateTimeframe(
    data,
    aggregationDays: number,
    intervalStep: number,
    properties: string[],
    aggregationMode: AggregationMode,
  ): object[] {
    const aggregatedValues: object[] = [];

    if (!data || data.length === 0) {
      return aggregatedValues;
    }

    // Sort data by timestamp in descending order
    const sortedData = [...data].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    const endTimestamp = new Date(sortedData[0].timestamp);
    const startTimestamp = new Date(endTimestamp);
    startTimestamp.setDate(endTimestamp.getDate() - aggregationDays);

    // Round timestamps to interval boundaries for better grouping
    startTimestamp.setMinutes(0, 0, 0);

    for (
      let i = startTimestamp.getTime();
      i <= endTimestamp.getTime();
      i += intervalStep
    ) {
      const intervalStart = new Date(i);
      const intervalEnd = new Date(i + intervalStep);

      // Filter entries that fall within this interval
      const intervalValues = data.filter((entry) => {
        const entryTime = new Date(entry.timestamp);
        return entryTime >= intervalStart && entryTime < intervalEnd;
      });

      // Only create an aggregated entry if there's data in this interval
      if (intervalValues.length > 0) {
        const aggregatedEntry = this.startValueAggregation(
          intervalValues,
          properties,
          aggregationMode,
        );

        // Set timestamp to the beginning of the interval for consistency
        if (aggregatedEntry) {
          aggregatedEntry.timestamp = intervalStart.toISOString();
          aggregatedValues.push(aggregatedEntry);
        }
      }
    }

    return aggregatedValues;
  }

  private startValueAggregation(
    values,
    attributes: string[],
    aggregationMode: AggregationMode,
  ): Record<string, any> {
    if (values.length > 0) {
      const lastEntry = values[0];
      const aggregatedEntry: Record<string, any> = { ...lastEntry };

      attributes.forEach((attribute) => {
        const attributeValue = values.map((entry) => entry[attribute]);
        aggregatedEntry[attribute] = this.aggregateValues(
          attributeValue,
          aggregationMode,
        );
      });

      return aggregatedEntry;
    }
  }

  private aggregateValues(
    values: number[],
    aggregationMode: AggregationMode,
  ): number {
    switch (aggregationMode) {
      case 'min':
        return Math.min(...values);

      case 'max':
        return Math.max(...values);

      case 'sum':
        return values.reduce((acc, curr) => acc + curr, 0);

      case 'avg':
        return values.reduce((acc, curr) => acc + curr, 0) / values.length;

      case 'none':
        return values[0];

      default:
        this.logger.error(
          `Invalid aggregation mode supplied: ${aggregationMode}`,
        );
        throw new Error('Invalid aggregation mode.');
    }
  }

  private buildSensorDataMap(data): Map<string, any> {
    const sensorDataMap = new Map<string, any[]>();

    for (const dataItem of data) {
      const sensorKey = dataItem.id;

      if (!sensorDataMap.get(sensorKey)) {
        sensorDataMap.set(sensorKey, []);
      }

      sensorDataMap.get(sensorKey).push(dataItem);
    }
    return sensorDataMap;
  }

  async getDatasource(datasourceId: string): Promise<AuthData> {
    const datasource = await this.db
      .select()
      .from(dataSources)
      .leftJoin(authData, eq(dataSources.authDataId, authData.id))
      .where(eq(dataSources.id, datasourceId));
    if (datasource.length > 0) {
      return datasource[0].auth_data;
    } else {
      this.logger.error(`No Datasource with this id: ${datasourceId}`);
      throw new Error('No Datasource with this id');
    }
  }
}

type AggregationMode = 'none' | 'min' | 'max' | 'sum' | 'avg';
type Timeframe =
  | 'user_defined'
  | 'live'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'year2'
  | 'year3';
type AggregationPeriod =
  | 'second'
  | 'minute'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year';
