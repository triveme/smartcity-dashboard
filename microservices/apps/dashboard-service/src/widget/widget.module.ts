import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { WidgetService } from './widget.service';
import { WidgetController } from './widget.controller';
import { AuthHelperMiddleware, AuthHelperUtility } from '@app/auth-helper';
import { WidgetToPanelService } from '../widget-to-panel/widget-to-panel.service';
import { TabService } from '../tab/tab.service';
import { QueryConfigService } from '../query-config/query-config.service';
import { QueryService } from '../query/query.service';
import { TenantService } from '../tenant/tenant.service';
import { WidgetToTenantService } from '../widget-to-tenant/widget-to-tenant.service';
import { QueryRepo } from '../query/query.repo';
import { QueryConfigRepo } from '../query-config/query-config.repo';
import { TabRepo } from '../tab/tab.repo';
import { TenantRepo } from '../tenant/tenant.repo';
import { WidgetRepo } from './widget.repo';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';
import { WidgetToTenantRepo } from '../widget-to-tenant/widget-to-tenant.repo';
import { CorporateInfoService } from '../corporate-info/corporate-info.service';
import { CorporateInfoRepo } from '../corporate-info/corporate-info.repo';
import { DataService as NgsiDataService } from '../../../ngsi-service/src/data/data.service';
import { QueryService as NgsiQueryService } from '../../../ngsi-service/src/query/query.service';
import { AuthService as NgsiAuthService } from '../../../ngsi-service/src/auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { WidgetDataService } from './widget.data.service';
import { CorporateInfoSidebarLogosRepo } from '../corporate-info-sidebar-logos/corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../logo/logo.repo';

@Module({
  imports: [HttpModule],
  providers: [
    WidgetService,
    WidgetDataService,
    WidgetRepo,
    AuthHelperUtility,
    WidgetToPanelService,
    WidgetToPanelRepo,
    CorporateInfoService,
    CorporateInfoRepo,
    TabService,
    TabRepo,
    QueryConfigService,
    QueryService,
    TenantService,
    TenantRepo,
    WidgetToTenantService,
    WidgetToTenantRepo,
    QueryRepo,
    QueryConfigRepo,
    NgsiDataService,
    NgsiQueryService,
    NgsiAuthService,
    CorporateInfoSidebarLogosRepo,
    LogoRepo,
  ],
  controllers: [WidgetController],
})
export class WidgetModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply the AuthHelperMiddleware to protect specific routes
    consumer.apply(AuthHelperMiddleware).forRoutes(
      { path: 'widgets*', method: RequestMethod.ALL }, // Protect all methods in the "widgets" route
    );
  }
}