import { Logo, NewLogo } from '@app/postgres-db/schemas/logo.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LogoRepo } from './logo.repo';

@Injectable()
export class LogoService {
  constructor(private readonly logoRepo: LogoRepo) {}

  async getAll(tenantAbbreviation?: string): Promise<Logo[]> {
    return this.logoRepo.getAllForTenantAbbreviation(tenantAbbreviation);
  }

  async getById(id: string): Promise<Logo> {
    return this.logoRepo.getById(id);
  }

  async create(row: NewLogo): Promise<Logo> {
    const result = await this.logoRepo.create(row);

    if (!result) {
      throw new HttpException('Failed to create logo', HttpStatus.BAD_REQUEST);
    }

    return result;
  }

  async update(id: string, values: Partial<Logo>): Promise<Logo> {
    return this.logoRepo.update(id, values);
  }

  async delete(id: string): Promise<Logo> {
    return this.logoRepo.delete(id);
  }
}
