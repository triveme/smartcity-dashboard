import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewQueryConfig,
  QueryConfig,
} from '@app/postgres-db/schemas/query-config.schema';
import { QueryService } from '../query/query.service';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { createHash } from 'crypto';
import { QueryConfigRepo } from './query-config.repo';

export type CreatedQueryConfig = QueryConfig & {
  queryId: string;
};

@Injectable()
export class QueryConfigService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly queryConfigRepo: QueryConfigRepo,
    private readonly queryService: QueryService,
  ) {}

  async getAll(): Promise<QueryConfig[]> {
    return this.queryConfigRepo.getAll();
  }

  async getById(id: string): Promise<QueryConfig> {
    return this.queryConfigRepo.getById(id);
  }

  async getQueryConfigByTabId(id: string): Promise<QueryConfig> {
    const result = await this.queryConfigRepo.getQueryConfigByTabId(id);

    if (result) return result;

    throw new NotFoundException();
  }

  async create(
    row: NewQueryConfig,
    transaction?: DbType,
  ): Promise<CreatedQueryConfig> {
    row.hash = this.generateHash(row);

    const result = await this.queryConfigRepo.create(row, transaction);

    if (result) {
      const createdQuery = result as CreatedQueryConfig;

      const newQuery: Query = {
        id: uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        queryConfigId: createdQuery.id,
        queryData: null,
        reportData: {},
        updateMessage: null,
      };

      const queryResult: Query = await this.queryService.create(
        newQuery,
        transaction,
      );

      createdQuery.queryId = queryResult.id;

      return createdQuery;
    }

    return null;
  }

  async update(
    id: string,
    values: Partial<QueryConfig>,
    transaction?: DbType,
  ): Promise<QueryConfig> {
    values.hash = this.generateHash(values);

    return this.queryConfigRepo.update(id, values, transaction);
  }

  async delete(id: string): Promise<QueryConfig> {
    return this.db.transaction(async (tx) => {
      const queryConfigArray = await this.queryConfigRepo.getById(id);

      if (!queryConfigArray)
        throw new HttpException('QueryConfig not found', HttpStatus.NOT_FOUND);

      const query = await this.queryService.getQueryByQueryConfigId(id);

      if (query) await this.queryService.delete(query.id, tx);

      return this.queryConfigRepo.delete(id, tx);
    });
  }

  private generateHash(object: Partial<QueryConfig> | NewQueryConfig): string {
    const propertiesToInclude = [
      'dataSourceId',
      'interval',
      'fiwareService',
      'fiwareServicePath',
      'fiwareType',
      'entityIds',
      'attributes',
      'aggrMode',
      'timeframe',
    ];

    return createHash('sha256')
      .update(JSON.stringify(object, propertiesToInclude))
      .digest('hex');
  }
}
