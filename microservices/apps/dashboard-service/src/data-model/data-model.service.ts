import { Injectable } from '@nestjs/common';
import {
  DataModel,
  NewDataModel,
} from '@app/postgres-db/schemas/data-model.schema';
import { DataModelRepo } from './data-model.repo';

@Injectable()
export class DataModelService {
  constructor(private readonly dataModelRepo: DataModelRepo) {}

  async getAll(): Promise<DataModel[]> {
    return this.dataModelRepo.getAll();
  }

  async getById(id: string): Promise<DataModel> {
    return this.dataModelRepo.getById(id);
  }

  async create(row: NewDataModel): Promise<DataModel> {
    return this.dataModelRepo.create(row);
  }

  async update(id: string, values: Partial<DataModel>): Promise<DataModel> {
    return this.dataModelRepo.update(id, values);
  }

  async delete(id: string): Promise<DataModel> {
    return this.dataModelRepo.delete(id);
  }
}
