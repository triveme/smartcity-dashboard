import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { AuthDataService } from './auth-data.service';
import {
  AuthData,
  NewAuthData,
} from '@app/postgres-db/schemas/auth-data.schema';
import { Public } from '@app/auth-helper/PublicDecorator';
import { AuthenticatedRequest } from '@app/auth-helper';

@Controller('auth-datas')
export class AuthDataController {
  constructor(private readonly service: AuthDataService) {}

  @Public()
  @Get('/')
  async getAll(@Req() request: AuthenticatedRequest): Promise<AuthData[]> {
    const roles = request.roles ?? [];
    return this.service.getAll(roles);
  }

  @Public()
  @Get('/tenant/:abbreviation')
  async getByTenant(
    @Param('abbreviation') abbreviation: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<AuthData[]> {
    const roles = request.roles ?? [];
    return this.service.getByTenant(roles, abbreviation);
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<AuthData> {
    const roles = request.roles ?? [];
    return this.service.getById(id, roles);
  }

  @Public()
  @Post('/')
  async create(
    @Body() row: NewAuthData,
    @Req() request: AuthenticatedRequest,
  ): Promise<NewAuthData> {
    const roles = request.roles ?? [];
    return this.service.create(row, roles);
  }

  @Public()
  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<AuthData>,
    @Req() request: AuthenticatedRequest,
  ): Promise<AuthData> {
    const roles = request.roles ?? [];
    return this.service.update(id, values, roles);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<AuthData> {
    const roles = request.roles ?? [];
    return this.service.delete(id, roles);
  }
}
