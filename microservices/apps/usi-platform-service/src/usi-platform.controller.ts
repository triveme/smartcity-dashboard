import { Controller, Get, Query } from '@nestjs/common';
import {
  QueryConfigService,
  UsiEventType,
} from './query-config/query-config.service';

@Controller('usi-platform')
export class UsiPlatformController {
  constructor(private readonly queryConfigService: QueryConfigService) {}

  @Get('event-types')
  async getEventTypes(@Query('apiId') apiId?: string): Promise<UsiEventType[]> {
    return this.queryConfigService.getEventTypes(apiId);
  }

  @Get('sensors')
  async getSensors(
    @Query('eventType') eventType: string,
    @Query('apiId') apiId?: string,
  ): Promise<string[]> {
    return this.queryConfigService.getSensors(eventType, apiId);
  }
}
