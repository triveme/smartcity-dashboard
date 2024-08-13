import { Module } from '@nestjs/common';
import { WidgetToPanelService } from './widget-to-panel.service';
import { WidgetToPanelController } from './widget-to-panel.controller';
import { WidgetToPanelRepo } from './widget-to-panel.repo';

@Module({
  providers: [WidgetToPanelService, WidgetToPanelRepo],
  controllers: [WidgetToPanelController],
})
export class WidgetToPanelModule {}
