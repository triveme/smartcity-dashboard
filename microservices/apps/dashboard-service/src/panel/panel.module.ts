import { Module } from '@nestjs/common';
import { PanelService } from './panel.service';
import { PanelController } from './panel.controller';
import { PanelRepo } from './panel.repo';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PanelService, PanelRepo, WidgetToPanelRepo],
  controllers: [PanelController],
})
export class PanelModule {}
