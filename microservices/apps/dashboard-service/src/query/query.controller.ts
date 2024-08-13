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
import { QueryService } from './query.service';
import { NewQuery, Query } from '@app/postgres-db/schemas/query.schema';
import { Public } from '@app/auth-helper/PublicDecorator';

@Controller('queries')
export class QueryController {
  constructor(private readonly service: QueryService) {}

  @Public()
  @Get('/')
  async getAll(): Promise<Query[]> {
    return this.service.getAll();
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Query> {
    return this.service.getById(id);
  }

  @Public()
  @Get('/tab/:id')
  async getByTabId(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Query> {
    return this.service.getQueryByTabId(id);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewQuery): Promise<Query> {
    return this.service.create(row);
  }

  @Public()
  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<Query>,
  ): Promise<Query> {
    return this.service.update(id, values);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Query> {
    return this.service.delete(id);
  }
}
