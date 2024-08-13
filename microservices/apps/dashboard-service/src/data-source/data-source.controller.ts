import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { DataSourceService } from './data-source.service';
import {
  DataSource,
  NewDataSource,
} from '@app/postgres-db/schemas/data-source.schema';
import { Public } from '@app/auth-helper/PublicDecorator';

@Controller('data-sources')
export class DataSourceController {
  constructor(private readonly service: DataSourceService) {}

  @Public()
  @Get('/')
  async getAll(): Promise<DataSource[]> {
    return this.service.getAll();
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<DataSource> {
    return this.service.getById(id);
  }

  @Public()
  @Get('/tenant/:tenant')
  async getByTenant(@Param('tenant') tenant: string): Promise<DataSource[]> {
    return this.service.getByTenant(tenant);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewDataSource): Promise<DataSource> {
    return this.service.create(row);
  }

  @Public()
  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<DataSource>,
  ): Promise<DataSource> {
    return this.service.update(id, values);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<DataSource> {
    return this.service.delete(id);
  }
}
