import { Controller, Get, Param, Query } from '@nestjs/common';
import { NgsiService } from './ngsi.service';
import { ChartData } from 'apps/dashboard-service/src/dashboard/dashboard.service';

@Controller('ngsi')
export class NgsiController {
  constructor(private readonly ngsiService: NgsiService) {}

  @Get('on-demand-data/:queryId')
  async getOnDemandData(
    @Param('queryId') queryId: string,
    @Query('entityId') entityId: string,
    @Query('attribute') attribute: string,
  ): Promise<ChartData> {
    return await this.ngsiService.getOnDemandData(queryId, entityId, attribute);
  }
}
