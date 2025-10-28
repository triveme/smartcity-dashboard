import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TabImageRepo } from './tab-image.repo';
import {
  NewTabImage,
  TabImage,
} from '@app/postgres-db/schemas/dashboard.tab.values-to-images.schema';
import { DbType } from '@app/postgres-db';

@Injectable()
export class TabImageService {
  constructor(private readonly tabImageRepo: TabImageRepo) {}

  async getAll(tenantAbbreviation?: string): Promise<TabImage[]> {
    return this.tabImageRepo.getAllForTenantAbbreviation(tenantAbbreviation);
  }

  async getById(id: string): Promise<TabImage> {
    return this.tabImageRepo.getById(id);
  }

  async getMultiple(ids: string[]): Promise<TabImage[]> {
    return this.tabImageRepo.getByMultipleIds(ids);
  }

  async create(row: NewTabImage): Promise<TabImage> {
    const result = await this.tabImageRepo.create(row);

    if (!result) {
      throw new HttpException(
        'Failed to create TabImage',
        HttpStatus.BAD_REQUEST,
      );
    }

    return result;
  }

  async delete(id: string): Promise<TabImage> {
    return this.tabImageRepo.delete(id);
  }

  async deleteByTenant(
    tenantAbbreviation: string,
    transaction?: DbType,
  ): Promise<TabImage[]> {
    return this.tabImageRepo.deleteByTenantAbbreviation(
      tenantAbbreviation,
      transaction,
    );
  }
}
