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
} from '@nestjs/common';
import { CorporateInfoService } from './corporate-info.service';
import {
  CorporateInfo,
  NewCorporateInfo,
} from '@app/postgres-db/schemas/corporate-info.schema';
import { Public } from '@app/auth-helper/PublicDecorator';
import { CorporateInfoWithLogos } from './corporate-info.repo';

@Controller('corporate-infos')
export class CorporateInfoController {
  constructor(private readonly service: CorporateInfoService) {}

  @Public()
  @Get('/')
  async getAll(
    @Query('includeLogos') includeLogos?: boolean,
  ): Promise<CorporateInfo[] | CorporateInfoWithLogos[]> {
    if (includeLogos) {
      return this.service.getAllWithLogos();
    } else {
      return this.service.getAll();
    }
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<CorporateInfo> {
    return this.service.getById(id);
  }

  @Public()
  @Get('/tenant/:tenant')
  async getByTenant(
    @Param('tenant') tenant: string,
    @Query('includeLogos') includeLogos?: boolean,
  ): Promise<CorporateInfo[] | CorporateInfoWithLogos[]> {
    return this.service.getByTenant(tenant, includeLogos);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewCorporateInfo): Promise<CorporateInfo> {
    return this.service.create(row);
  }

  @Public()
  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<CorporateInfo>,
  ): Promise<CorporateInfo> {
    return this.service.update(id, values);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<CorporateInfo> {
    return this.service.delete(id);
  }
}
