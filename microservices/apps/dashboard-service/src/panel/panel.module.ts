import { Module } from '@nestjs/common';
import { PanelService } from './panel.service';
import { PanelController } from './panel.controller';
import { PanelRepo } from './panel.repo';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';
import { DataService as NgsiDataService } from '../../../ngsi-service/src/data/data.service';
import { QueryService as NgsiQueryService } from '../../../ngsi-service/src/query/query.service';
import { AuthService as NgsiAuthService } from '../../../ngsi-service/src/auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { PanelDataService } from './panel.data.service';

@Module({
  imports: [HttpModule],
  providers: [
    PanelService,
    PanelDataService,
    PanelRepo,
    WidgetToPanelRepo,
    NgsiAuthService,
    NgsiDataService,
    NgsiQueryService,
  ],
  controllers: [PanelController],
})
export class PanelModule {}
