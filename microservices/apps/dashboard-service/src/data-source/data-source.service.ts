import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  DataSource,
  NewDataSource,
} from '@app/postgres-db/schemas/data-source.schema';
import { DataSourceRepo } from './data-source.repo';
import { AuthDataRepo } from '../auth-data/auth-data.repo';

@Injectable()
export class DataSourceService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly authDataRepo: AuthDataRepo,
    private readonly dataSourceRepo: DataSourceRepo,
  ) {}

  async getAll(): Promise<DataSource[]> {
    return this.dataSourceRepo.getAll();
  }

  async getById(id: string): Promise<DataSource> {
    return this.dataSourceRepo.getById(id);
  }

  async getByTenant(tenant: string): Promise<DataSource[]> {
    return this.dataSourceRepo.getByTenant(tenant);
  }

  async getByAuthDataId(id: string): Promise<DataSource> {
    return this.dataSourceRepo.getByAuthDataId(id);
  }

  async create(row: NewDataSource, transaction?: DbType): Promise<DataSource> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const authData = await this.authDataRepo.getById(row.authDataId);

    if (!authData) {
      throw new HttpException(
        `AuthData not found for the given ID: ${row.authDataId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const origin = authData.type;
    const newRow = { ...row, origin };

    return this.dataSourceRepo.create(newRow, dbActor);
  }

  async update(
    id: string,
    values: Partial<DataSource>,
    transaction?: DbType,
  ): Promise<DataSource> {
    const dbActor = transaction === undefined ? this.db : transaction;

    // Fetch the corresponding DataSource
    const existingDataSource = await this.dataSourceRepo.getById(id);

    if (!existingDataSource) {
      throw new HttpException(
        `DataSource not found for the given ID: ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Fetch the corresponding authData
    const authDataRow = await this.authDataRepo.getById(
      existingDataSource.authDataId,
    );

    if (!authDataRow) {
      throw new HttpException(
        `AuthData not found for the given ID: ${existingDataSource[0].authDataId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Set the origin property to the type of authDataRow
    const updatedValues = { ...values, origin: authDataRow.type };

    // Perform the database update
    return this.dataSourceRepo.update(id, updatedValues, dbActor);
  }

  async delete(id: string): Promise<DataSource> {
    return this.dataSourceRepo.delete(id);
  }
}
