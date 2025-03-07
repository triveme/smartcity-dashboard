/* eslint @typescript-eslint/no-explicit-any: 0 */
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { Injectable, Logger } from '@nestjs/common';
import { AuthData } from '@app/postgres-db/schemas/auth-data.schema';
import { DataSource } from '@app/postgres-db/schemas/data-source.schema';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { QueryService } from './query/query.service';
import { DataService } from './data/data.service';
import { SystemUser } from '@app/postgres-db/schemas/tenant.system-user.schema';

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
export class ApiService {
  private readonly logger = new Logger(ApiService.name);

  constructor(
    private readonly queryService: QueryService,
    private readonly dataService: DataService,
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
          const aggregatedData = this.aggregateData(
            newData,
            queryConfig.timeframe,
            queryConfig.aggrMode,
            queryConfig.attributes,
          );
          await this.queryService.setQueryDataOfBatch(
            queryBatch,
            aggregatedData,
          );
        }
      });

      // Wait for all promises to resolve (this will send all the requests
      // to the data sources and update all the queries in parallel)
      await Promise.all(updates);
    }
  }

  private aggregateData(
    data,
    timeframe: Timeframe,
    aggregationMode: AggregationMode,
    attributes: string[],
  ): object[] {
    let aggregatedData: object[] = [];

    const sensorDataMap = this.buildSensorDataMap(data);

    switch (timeframe) {
      case 'day':
        aggregatedData = this.aggregateDay(
          sensorDataMap,
          aggregationMode,
          attributes,
        );
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

  private filterByAttribute(attributes: string[], data: object[]): object[] {
    return data.map((item) => {
      const reducedItem = {};
      for (const attribute of attributes) {
        if (item.hasOwnProperty(attribute)) {
          reducedItem[attribute] = item[attribute];
        }
      }
      return reducedItem;
    });
  }

  private aggregateDay(
    sensorDataMap: Map<string, any>,
    aggregationMode: AggregationMode,
    properties: string[],
  ): object[] {
    const aggregatedValues: object[] = [];

    for (let i = 0; i < 24; i++) {
      for (const sensorValues of sensorDataMap.values()) {
        const values = sensorValues.filter(
          (entry) => new Date(entry.timestamp).getUTCHours() === i,
        );

        if (aggregationMode === 'none') {
          const dayValues = this.getDayValuesWithoutAggregation(values);

          aggregatedValues.push(...dayValues);
          continue;
        }
        aggregatedValues.push(
          this.startValueAggregation(values, properties, aggregationMode),
        );
      }
    }

    return aggregatedValues;
  }

  private getDayValuesWithoutAggregation(values: any[]): object[] {
    const now: Date = new Date();
    const before24Hours: Date = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return values
      .filter((value) => {
        const timestamp = new Date(value.timestamp);

        return timestamp > before24Hours;
      })
      .sort((value1, value2) => (value1.timestamp > value2.timestamp ? -1 : 1));
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

    if (aggregationMode === 'none') {
      const noneAggregatedTimeframeValues =
        this.getNoneAggregatedTimeframeValues(aggregationDays, data);
      aggregatedValues.push(...noneAggregatedTimeframeValues);

      return aggregatedValues;
    }

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

  private getNoneAggregatedTimeframeValues(
    aggregationDays: number,
    values: any[],
  ): object[] {
    const now: Date = new Date();
    const beforeDays: Date = new Date(
      now.getTime() - aggregationDays * 24 * 60 * 60 * 1000,
    );

    return values
      .filter((value) => {
        const timestamp = new Date(value.timestamp);
        return timestamp > beforeDays;
      })
      .sort((value1, value2) => (value1.timestamp > value2.timestamp ? 1 : -1));
  }

  private startValueAggregation(
    values,
    properties: string[],
    aggregationMode: AggregationMode,
  ): object {
    if (values.length > 0) {
      const lastEntry = values[0];
      const aggregatedEntry = { ...lastEntry };

      properties.forEach((property) => {
        const propertyValues = values.map((entry) => entry[property]);
        aggregatedEntry[property] = this.aggregateValues(
          propertyValues,
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
