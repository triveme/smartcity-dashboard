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
import { ValueTranslationService } from './value-translation.service';
import { ValueTranslation } from '@app/postgres-db/schemas/value-translation.schema';
import {
  CreateTenantTranslation,
  UpdateValueTranslation,
} from './value-translation.model';

@Controller('value-translation')
export class ValueTranslationController {
  constructor(private readonly service: ValueTranslationService) {}

  @Get('/:tenant')
  async getValuesTranslation(
    @Param('tenant') tenant: string,
  ): Promise<ValueTranslation[]> {
    const res = await this.service.getValuesTranslation(tenant);
    return res;
  }

  @Post('/:tenant')
  async createTenantSpecificTranslation(
    @Param('tenant') tenant: string,
    @Body() body: CreateTenantTranslation,
  ): Promise<ValueTranslation> {
    const res = await this.service.createTenantSpecificTranslation(
      tenant,
      body,
    );
    return res;
  }

  @Patch('/:tenant/:id')
  async updateTenantSpecificTranslationById(
    @Param('tenant') tenant: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: UpdateValueTranslation,
  ): Promise<ValueTranslation> {
    const res = await this.service.updateTennantSpecificTranslationById(
      id,
      tenant,
      values,
    );

    return res;
  }

  @Delete('/:tenant/:id')
  async deleteTenantSpecificTranslationById(
    @Param('tenant') tenant: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ValueTranslation> {
    return this.service.deleteTenantSpecificTranslationById(id, tenant);
  }
}
