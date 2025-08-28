import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { InternalDataService } from './internal-data.service';
import { InternalData, NewInternalData } from '@app/postgres-db/schemas';
import { AuthenticatedRequest } from '@app/auth-helper';
import { Public } from '@app/auth-helper/PublicDecorator';

@Controller('data')
export class InternalDataController {
  constructor(private readonly service: InternalDataService) {}

  @Public()
  @Post('/')
  async create(
    @Body() row: NewInternalData,
    @Req() request: AuthenticatedRequest,
  ): Promise<InternalData> {
    const roles = request.roles ?? [];
    return this.service.create(row, roles);
  }

  @Public()
  @Patch('/:id')
  async edit(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() row: Partial<NewInternalData>,
    @Req() request: AuthenticatedRequest,
  ): Promise<InternalData> {
    const roles = request.roles ?? [];
    return this.service.update(id, row, roles);
  }

  @Get('/')
  async getAll(@Query('tenant') tenant: string): Promise<InternalData[]> {
    return this.service.getAll(tenant);
  }

  @Get('/:id')
  async getById(@Param('id') id: string): Promise<InternalData> {
    return this.service.getById(id);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<InternalData> {
    const roles = request.roles ?? [];
    return this.service.delete(id, roles);
  }
}
