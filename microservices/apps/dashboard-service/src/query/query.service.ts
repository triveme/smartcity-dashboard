import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { NewQuery, Query } from '@app/postgres-db/schemas/query.schema';
import { QueryRepo } from './query.repo';

@Injectable()
export class QueryService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly queryRepo: QueryRepo,
  ) {}

  async getAll(): Promise<Query[]> {
    return this.queryRepo.getAll();
  }

  async getById(id: string): Promise<Query> {
    return this.queryRepo.getById(id);
  }

  async getQueryByTabId(id: string): Promise<Query> {
    const result = await this.queryRepo.getQueryByTabId(id);

    if (result) return result;

    throw new NotFoundException();
  }

  async getQueryByQueryConfigId(id: string): Promise<Query> {
    return this.queryRepo.getQueryByQueryConfigId(id);
  }

  async create(row: NewQuery, transaction?: DbType): Promise<Query> {
    return this.queryRepo.create(row, transaction);
  }

  async update(
    id: string,
    values: Partial<Query>,
    transaction?: DbType,
  ): Promise<Query> {
    return this.queryRepo.update(id, values, transaction);
  }

  async delete(id: string, transaction?: DbType): Promise<Query> {
    return this.queryRepo.delete(id, transaction);
  }
}
