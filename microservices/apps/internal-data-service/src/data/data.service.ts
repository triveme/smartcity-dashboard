import { Inject, Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line prettier/prettier
import {
  DataSource,
  dataSources,
} from '@app/postgres-db/schemas/data-source.schema';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { POSTGRES_DB, DbType } from '@app/postgres-db';
import {
  InternalData,
  internalData,
  NewInternalData,
} from '@app/postgres-db/schemas';
import { and, eq } from 'drizzle-orm';
import { OutputEntry, parseCsvToJson } from './csv-parser';
import { generateAttributeKey } from '../helper';

export type QueryBatch = {
  queryIds: string[];
  query_config: QueryConfig;
  data_source: DataSource;
};

@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);

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

  async create(
    values: NewInternalData,
    transaction?: DbType,
  ): Promise<InternalData> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .insert(internalData)
      .values(values)
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async update(
    id: string,
    values: Partial<NewInternalData>,
    transaction?: DbType,
  ): Promise<InternalData> {
    const dbActor = transaction === undefined ? this.db : transaction;
    const result = await dbActor
      .update(internalData)
      .set(values)
      .where(eq(internalData.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string): Promise<InternalData> {
    const deletedReports = await this.db
      .delete(internalData)
      .where(eq(internalData.id, id))
      .returning();

    return deletedReports.length > 0 ? deletedReports[0] : null;
  }

  async getAll(tenant: string): Promise<InternalData[]> {
    const result = await this.db
      .select()
      .from(internalData)
      .where(eq(internalData.tenantAbbreviation, tenant));
    return result;
  }

  async getById(id: string): Promise<InternalData> {
    const result = await this.db
      .select()
      .from(internalData)
      .where(eq(internalData.id, id));
    return result[0];
  }

  async getSources(collection: string, tenant: string): Promise<string[]> {
    try {
      const whereClause = and(
        eq(internalData.collection, collection),
        eq(internalData.tenantAbbreviation, tenant),
      );
      const dataSources = await this.db
        .select()
        .from(internalData)
        .where(whereClause);

      return dataSources.map((d) => d.source);
    } catch (error) {
      this.logger.error('Failed to fetch data: ', error);
      throw new Error('Failed to fetch data');
    }
  }

  async getEntities(collection: string, source: string): Promise<string[]> {
    try {
      this.logger.debug('getEntities: ', collection, source);

      const whereClause = and(
        eq(internalData.collection, collection),
        eq(internalData.source, source),
      );

      const dataSources = await this.db
        .select()
        .from(internalData)
        .where(whereClause);

      return dataSources.flatMap((d) => {
        return this.extractEntities(
          d.data,
          d.firstDataRowIndex,
          d.timeGroupRowCount,
          d.firstDataColIndex,
        );
      });
    } catch (error) {
      this.logger.error('Failed to fetch data: ', error);
      throw new Error('Failed to fetch data');
    }
  }

  async getAttributes(collection: string, source: string): Promise<string[]> {
    try {
      this.logger.debug('getAttributes: ', collection, source);

      const whereClause = and(
        eq(internalData.collection, collection),
        eq(internalData.source, source),
      );

      const dataSources = await this.db
        .select()
        .from(internalData)
        .where(whereClause);

      const attrs = dataSources.flatMap((d) => {
        return this.extractAttributes(
          d.data,
          d.firstDataRowIndex,
          d.timeGroupRowCount,
          d.firstDataColIndex,
        );
      });
      return ['name', ...attrs];
    } catch (error) {
      this.logger.error('Failed to fetch data: ', error);
      throw new Error('Failed to fetch data');
    }
  }

  async getDataFromDataSource(queryBatch: QueryBatch): Promise<OutputEntry[]> {
    const whereClause = and(
      eq(internalData.collection, queryBatch.query_config.fiwareService),
      eq(internalData.source, queryBatch.query_config.fiwareType),
    );

    const [dataSource] = await this.db
      .select()
      .from(internalData)
      .where(whereClause);

    if (dataSource && dataSource.data) {
      let jsonData = parseCsvToJson(
        dataSource.data,
        dataSource.firstDataRowIndex,
        dataSource.timeGroupRowCount,
        0,
        dataSource.firstDataColIndex,
      );

      jsonData = this.filterDataByEntities(
        jsonData,
        queryBatch.query_config.entityIds,
      );

      jsonData = this.filterDataValuesByAttributes(
        jsonData,
        queryBatch.query_config.attributes,
      );

      // if (queryBatch.query_config.timeframe === 'live') {
      //   // return only latest time value for live widgets
      //   jsonData = this.filterDataValuesByTimeframe(jsonData, -1);
      // }

      return jsonData;
    } else {
      return undefined;
    }
  }

  private extractEntities(
    data: string,
    firstRow: number,
    timeRowsCount: number,
    firstCol: number,
  ): string[] {
    const jsonData = parseCsvToJson(data, firstRow, timeRowsCount, 0, firstCol);

    return jsonData.map((d) => d.Id);
  }

  private extractAttributes(
    data: string,
    firstRow: number,
    timeRowsCount: number,
    firstCol: number,
  ): string[] {
    const jsonData = parseCsvToJson(data, firstRow, timeRowsCount, 0, firstCol);
    if (jsonData.length) {
      const first = jsonData[0].Values;
      const all = first.map((f) => {
        return generateAttributeKey(f.Meta);
      });
      return [...new Set(all)];
    }
    return [];
  }

  private filterDataByEntities(
    data: OutputEntry[],
    entityIds: string[],
  ): OutputEntry[] {
    const result = data.filter((d) => {
      if (entityIds.indexOf(d.Id) === -1) {
        return false;
      }
      return true;
    });
    return result;
  }
  private filterDataValuesByAttributes(
    data: OutputEntry[],
    attributes: string[],
  ): OutputEntry[] {
    return data.map((d) => {
      d.Values = d.Values.filter((v) => {
        return attributes.indexOf(generateAttributeKey(v.Meta)) !== -1;
      });
      if (attributes.includes('name')) {
        d.Values.push({
          Meta: {},
          Time: {},
          Value: d.Descriptions.join(', '),
        });
      }
      return d;
    });
  }

  private filterDataValuesByTimeframe(
    data: OutputEntry[],
    timeframeIndex: number,
  ): OutputEntry[] {
    return data.map((d) => {
      if (timeframeIndex < 0) {
        const index = d.Values.length + timeframeIndex;
        d.Values = [d.Values[index]];
      } else {
        d.Values = [d.Values[timeframeIndex]];
      }
      return d;
    });
  }
}
