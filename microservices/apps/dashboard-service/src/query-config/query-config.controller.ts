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
import { QueryConfigService } from './query-config.service';
import {
  NewQueryConfig,
  QueryConfig,
} from '@app/postgres-db/schemas/query-config.schema';
import { Public } from '@app/auth-helper/PublicDecorator';

@Controller('query-configs')
export class QueryConfigController {
  constructor(private readonly service: QueryConfigService) {}

  @Public()
  @Get('/')
  async getAll(): Promise<QueryConfig[]> {
    return this.service.getAll();
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<QueryConfig> {
    return this.service.getById(id);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewQueryConfig): Promise<QueryConfig> {
    return this.service.create(row);
  }

  @Public()
  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<QueryConfig>,
  ): Promise<QueryConfig> {
    return this.service.update(id, values);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<QueryConfig> {
    return this.service.delete(id);
  }
}
