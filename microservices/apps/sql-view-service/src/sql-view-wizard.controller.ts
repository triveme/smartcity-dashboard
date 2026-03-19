import { Controller, Get, Query } from '@nestjs/common';
import { SqlViewService } from './data/data.service';

@Controller('wizard')
export class SqlViewWizardController {
  constructor(private readonly service: SqlViewService) {}

  @Get('/collections')
  async getCollections(@Query('apiid') apiid: string): Promise<string[]> {
    return this.service.getCollections(apiid);
  }
  @Get('/sources')
  async getSources(): Promise<string[]> {
    return this.service.getSources();
  }

  @Get('/entities')
  async getEntities(): Promise<string[]> {
    return this.service.getEntities();
  }

  @Get('/attributes')
  async getAttributes(
    @Query('collection') collection: string,
  ): Promise<string[]> {
    return this.service.getAttributes(collection);
  }
}
