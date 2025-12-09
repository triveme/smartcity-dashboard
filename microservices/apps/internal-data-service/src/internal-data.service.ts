/* eslint @typescript-eslint/no-explicit-any: 0 */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { DataService, QueryBatch } from './data/data.service';
import { InternalData, NewInternalData } from '@app/postgres-db/schemas';
import { AuthHelperUtility } from '@app/auth-helper';
import { QueryService } from './query/query.service';
import {
  NGSIv2AttributeData,
  TransformationService,
} from './transformation/transformation.service';

@Injectable()
export class InternalDataService {
  constructor(
    private readonly dataService: DataService,
    private readonly authHelper: AuthHelperUtility,
    private readonly queryService: QueryService,
    private readonly transformationService: TransformationService,
  ) {}

  async getCollections(appid: string): Promise<string[]> {
    return this.dataService.getCollections(appid);
  }
  async getSources(collection: string, tenant: string): Promise<string[]> {
    return this.dataService.getSources(collection, tenant);
  }

  async getEntities(collection: string, source: string): Promise<string[]> {
    return this.dataService.getEntities(collection, source);
  }
  async getAttributes(collection: string, source: string): Promise<string[]> {
    return this.dataService.getAttributes(collection, source);
  }

  async create(
    row: NewInternalData,
    roles: Array<string>,
  ): Promise<InternalData> {
    const checks = [
      this.authHelper.isAdmin(roles),
      this.authHelper.isEditor(roles),
      this.authHelper.isSuperAdmin(roles),
    ];
    if (checks.some(Boolean)) {
      try {
        const newRow = await this.dataService.create(row);
        return newRow;
      } catch (error) {
        throw new BadRequestException(error.detail || error.message);
      }
    } else {
      throw new HttpException(
        'Unauthorized to add source',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async update(
    id: string,
    row: Partial<NewInternalData>,
    roles: Array<string>,
  ): Promise<InternalData> {
    const checks = [
      this.authHelper.isAdmin(roles),
      this.authHelper.isEditor(roles),
      this.authHelper.isSuperAdmin(roles),
    ];
    if (checks.some(Boolean)) {
      const existingDataSource = await this.getById(id);
      if (!existingDataSource) {
        throw new HttpException(
          `DataSource not found for the given ID: ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }
      // Set the origin property to the type of authDataRow
      const updatedValues = { ...row };
      return this.dataService.update(id, updatedValues);
    }
  }

  async getAll(tenant: string): Promise<InternalData[]> {
    return this.dataService.getAll(tenant);
  }
  async getById(id: string): Promise<InternalData> {
    return this.dataService.getById(id);
  }

  async getDataFromDataSource(
    queryBatch: QueryBatch,
  ): Promise<{ attrs: NGSIv2AttributeData[] }> {
    const newData = await this.queryService.getDataFromDataSource(queryBatch);
    if (newData) {
      const transformedData = this.transformationService.transformCollection(
        newData,
        queryBatch.query_config.attributes,
        queryBatch.query_config.fiwareType,
      );
      return { attrs: transformedData };
    }
  }

  async updateFiwareQueries(): Promise<void> {
    const queryHashMap = await this.queryService.getQueriesToUpdate();

    // Create an array of promises from the dictionary. Each promise will fetch the data
    // from the data source and update all of it's queries (with the same hash) with the new data.
    const updates = Array.from(queryHashMap.values()).map(
      async (queryBatch) => {
        const newData =
          await this.dataService.getDataFromDataSource(queryBatch);

        if (newData) {
          await this.queryService.setQueryDataOfBatch(queryBatch, newData);
        }
      },
    );

    // Wait for all promises to resolve (this will send all the requests
    // to the data sources and update all the queries in parallel)
    await Promise.all(updates);
  }

  async delete(id: string, roles: Array<string>): Promise<InternalData> {
    const checks = [
      this.authHelper.isAdmin(roles),
      this.authHelper.isEditor(roles),
      this.authHelper.isSuperAdmin(roles),
    ];
    if (checks.some(Boolean)) {
      const r = await this.dataService.delete(id);
      if (!r) {
        throw new HttpException(`Entry ${id} not found`, HttpStatus.NOT_FOUND);
      } else {
        return r;
      }
    } else {
      throw new HttpException(
        'Unauthorized to add source',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
