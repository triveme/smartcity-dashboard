import { Controller, Get, Query } from '@nestjs/common';
import { InternalDataService } from './internal-data.service';

@Controller('wizard')
export class InternalDataWizardController {
  constructor(private readonly service: InternalDataService) {}

  @Get('/collections')
  async getCollections(@Query('apiid') apiid: string): Promise<string[]> {
    return this.service.getCollections(apiid);
  }
  @Get('/sources')
  async getSources(
    @Query('collection') collection: string,
    @Query('tenant') tenant: string,
  ): Promise<string[]> {
    return this.service.getSources(collection, tenant);
  }

  @Get('/entities')
  async getEntities(
    @Query('collection') collection: string,
    @Query('source') source: string,
  ): Promise<string[]> {
    return this.service.getEntities(collection, source);
  }

  @Get('/attributes')
  async getAttributes(
    @Query('collection') collection: string,
    @Query('source') source: string,
  ): Promise<string[]> {
    return this.service.getAttributes(collection, source);
  }
}
