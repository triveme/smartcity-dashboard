/* eslint @typescript-eslint/no-explicit-any: 0 */
import { Injectable } from '@nestjs/common';
import {
  QueryBatch,
  PlanBarService,
  NGSIv2EntityFirstEntry,
} from './data/data.service';

@Injectable()
export class PlanBarDataService {
  constructor(private readonly dataService: PlanBarService) {}

  async getCollections(appid: string): Promise<string[]> {
    return this.dataService.getCollections(appid);
  }

  async getSources(): Promise<string[]> {
    return this.dataService.getSources();
  }

  async getEntities(apiId?: string): Promise<string[]> {
    return this.dataService.getEntities(apiId);
  }

  async getAttributes(collection: string): Promise<string[]> {
    return this.dataService.getAttributes(collection);
  }

  async getDataFromDataSource(
    queryBatch: QueryBatch,
  ): Promise<NGSIv2EntityFirstEntry[]> {
    return this.dataService.getDataFromDataSource(queryBatch);
  }
}
