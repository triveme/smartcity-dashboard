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
import { Public } from '@app/auth-helper/PublicDecorator';
import { AuthenticatedRequest } from '@app/auth-helper';
import {
  GeneralSettings,
  NewGeneralSettings,
} from '@app/postgres-db/schemas/general-settings.schema';
import { GeneralSettingsService } from './general-settings.service';

@Controller('general-settings')
export class GeneralSettingsController {
  constructor(private readonly service: GeneralSettingsService) {}

  @Public()
  @Get('/')
  async getAll(
    @Req() request: AuthenticatedRequest,
  ): Promise<GeneralSettings[]> {
    const roles = request.roles ?? [];
    return this.service.getAll(roles);
  }

  @Public()
  @Get('/tenant/:abbreviation')
  async getByTenant(
    @Param('abbreviation') abbreviation: string,
  ): Promise<GeneralSettings> {
    return this.service.getByTenantAbbreviation(abbreviation);
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<GeneralSettings> {
    const roles = request.roles ?? [];
    return this.service.getById(id, roles);
  }

  @Public()
  @Post('/')
  async create(
    @Body() row: NewGeneralSettings,
    @Req() request: AuthenticatedRequest,
  ): Promise<NewGeneralSettings> {
    const roles = request.roles ?? [];
    return this.service.create(row, roles);
  }

  @Public()
  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<GeneralSettings>,
    @Req() request: AuthenticatedRequest,
  ): Promise<GeneralSettings> {
    const roles = request.roles ?? [];
    return this.service.update(id, values, roles);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<GeneralSettings> {
    const roles = request.roles ?? [];
    return this.service.delete(id, roles);
  }
}
