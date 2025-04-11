/* eslint @typescript-eslint/no-explicit-any: 0 */
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { Inject, Injectable, Logger } from '@nestjs/common';
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
      // Create an array of promises from the dictionary. Each promise will fetch the data
      // from the data source and update all of it's queries (with the same hash) with the new data.
      const updates: Promise<void>[] = Array.from(
        queryHashMap.get(tenant).values(),
      ).map(async (queryBatch) => {
        const newData =
          await this.dataService.getDataFromDataSource(queryBatch);

        if (newData) {
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
          );

          const transformedData = this.transformToTargetModel(aggregatedData);

          await this.queryService.setQueryDataOfBatch(
            queryBatch,
            transformedData,
          );
        }
      });

      // Wait for all promises to resolve (this will send all the requests
      // to the data sources and update all the queries in parallel)
      await Promise.all(updates);
    }
  }

  private filterByAttribute(attributes: string[], data: object[]): object[] {
    return data.map((item) => {
      const reducedItem = {};
      // Always keep id and timestamp
      reducedItem['id'] = item['id'];
      reducedItem['timestamp'] = item['timestamp'];

      for (const attribute of attributes) {
        if (item.hasOwnProperty(attribute)) {
          reducedItem[attribute] = item[attribute];
        }
      }
      return reducedItem;
    });
  }

  private transformToTargetModel(data: any[]): any {
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
            attributes,
            aggregationMode,
          );
          aggregatedData = [...aggregatedData, ...aggregatedValues];
        }
        break;

      case 'live':
        return this.filterByAttribute(attributes, data);

      default:
        this.logger.warn(`Invalid timeframe supplied: ${timeframe}`);
        return data;
    }

    return aggregatedData;
  }

  private aggregateTimeframe(
    data,
    aggregationDays: number,
    properties: string[],
    aggregationMode: AggregationMode,
  ): object[] {
    const aggregatedValues: object[] = [];
    const endTimestamp = new Date(data[0].timestamp);
    const startTimestamp = new Date(endTimestamp);
    startTimestamp.setDate(endTimestamp.getDate() - aggregationDays);

    for (
      let i = startTimestamp.getTime();
      i <= endTimestamp.getTime();
      i += 24 * 60 * 60 * 1000
    ) {
      const currentDate = new Date(i);

      const values = data.filter(
        (entry) =>
          new Date(entry.timestamp).toDateString() ===
          currentDate.toDateString(),
      );

      aggregatedValues.push(
        this.startValueAggregation(values, properties, aggregationMode),
      );
    }

    return aggregatedValues;
  }

  private startValueAggregation(
    values,
    attributes: string[],
    aggregationMode: AggregationMode,
  ): object {
    if (values.length > 0) {
      const lastEntry = values[0];
      const aggregatedEntry = { ...lastEntry };

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
  | 'live'
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year';
