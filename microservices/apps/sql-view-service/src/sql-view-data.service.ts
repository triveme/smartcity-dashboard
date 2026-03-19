/* eslint @typescript-eslint/no-explicit-any: 0 */
import { Injectable } from '@nestjs/common';
import { QueryBatch, SqlViewService } from './data/data.service';

@Injectable()
export class SqlViewDataService {
  constructor(private readonly dataService: SqlViewService) {}

  async getCollections(appid: string): Promise<string[]> {
    return this.dataService.getCollections(appid);
  }

  async getSources(): Promise<string[]> {
    return this.dataService.getSources();
  }

  async getEntities(): Promise<string[]> {
    return this.dataService.getEntities();
  }
  async getAttributes(collection: string): Promise<string[]> {
    return this.dataService.getAttributes(collection);
  }

  async getDataFromDataSource(
    queryBatch: QueryBatch,
  ): Promise<{ attributes: { attrName: string; values: unknown[] }[] }> {
    return this.dataService.getDataFromDataSource(queryBatch);
  }
}
