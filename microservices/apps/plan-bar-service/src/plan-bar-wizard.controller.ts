import { Controller, Get, Query } from '@nestjs/common';
import { PlanBarService } from './data/data.service';

@Controller('wizard')
export class PlanBarWizardController {
  constructor(private readonly service: PlanBarService) {}

  @Get('/collections')
  async getCollections(@Query('apiid') apiid: string): Promise<string[]> {
    return this.service.getCollections(apiid);
  }
  @Get('/sources')
  async getSources(): Promise<string[]> {
    return this.service.getSources();
  }

  @Get('/entities')
  async getEntities(@Query('apiid') apiid: string): Promise<string[]> {
    return this.service.getEntities(apiid);
  }

  @Get('/attributes')
  async getAttributes(
    @Query('collection') collection: string,
    @Query('apiid') apiid: string,
  ): Promise<string[]> {
    return this.service.getAttributes(collection, apiid);
  }
}
