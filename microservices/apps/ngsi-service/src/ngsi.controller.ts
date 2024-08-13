import { Controller, Get, Param } from '@nestjs/common';
import { NgsiService } from './ngsi.service';

@Controller('ngsi')
export class NgsiController {
  constructor(private readonly ngsiService: NgsiService) {}

  @Get('/download-data/:widgetId')
  async downloadData(@Param('widgetId') widgetId: string): Promise<string> {
    return this.ngsiService.downloadData(widgetId);
  }
}
