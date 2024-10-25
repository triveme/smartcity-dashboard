import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { TenantService, TenantWithDashboards } from './tenant.service';
import { NewTenant, Tenant } from '@app/postgres-db/schemas/tenant.schema';
import { Public } from '@app/auth-helper/PublicDecorator';

@Controller('tenants')
export class TenantController {
  constructor(private readonly service: TenantService) {}

  @Public()
  @Get('/')
  async getAll(
    @Query('includeDashboards') includeDashboards: string,
  ): Promise<Tenant[] | TenantWithDashboards[]> {
    if (includeDashboards === 'true') {
      return this.service.getTenantsWithDashboards();
    }
    return this.service.getAll();
  }

  @Public()
  @Get('/:id')
  async getById(
    @Query('includeDashboards') includeDashboards: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Tenant | TenantWithDashboards> {
    if (includeDashboards === 'true') {
      return this.service.getTenantWithDashboards(id);
    }
    return this.service.getById(id);
  }

  @Public()
  @Get('exists/:abbreviation')
  async existsByAbbreviation(
    @Param('abbreviation') abbreviation: string,
  ): Promise<boolean> {
    return this.service.existsByAbbreviation(abbreviation);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewTenant): Promise<Tenant> {
    return this.service.create(row);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Tenant> {
    return this.service.delete(id);
  }
}
