import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DbType } from '@app/postgres-db';
import { CustomMapImageRepo } from './custom-map-image.repo';
import {
  CustomMapImage,
  NewCustomMapImage,
} from '@app/postgres-db/schemas/dashboard.tab.custom_map_image.schema';

@Injectable()
export class CustomMapImageService {
  constructor(private readonly customMapImageRepo: CustomMapImageRepo) {}

  async getAll(tenantAbbreviation?: string): Promise<CustomMapImage[]> {
    return this.customMapImageRepo.getAllForTenantAbbreviation(
      tenantAbbreviation,
    );
  }

  async getById(id: string): Promise<CustomMapImage> {
    return this.customMapImageRepo.getById(id);
  }

  async getMultiple(ids: string[]): Promise<CustomMapImage[]> {
    return this.customMapImageRepo.getByMultipleIds(ids);
  }

  async create(row: NewCustomMapImage): Promise<CustomMapImage> {
    const result = await this.customMapImageRepo.create(row);

    if (!result) {
      throw new HttpException(
        'Failed to create CustomMapImage',
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  async delete(id: string): Promise<CustomMapImage> {
    return this.customMapImageRepo.delete(id);
  }

  async deleteByTenant(
    tenantAbbreviation: string,
    transaction?: DbType,
  ): Promise<CustomMapImage[]> {
    return this.customMapImageRepo.deleteByTenantAbbreviation(
      tenantAbbreviation,
      transaction,
    );
  }
}
