import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { AuthHelperMiddleware, AuthHelperUtility } from '@app/auth-helper';
import { DashboardService } from './dashboard.service';
import { QueryConfigService } from '../query-config/query-config.service';
import { WidgetToPanelService } from '../widget-to-panel/widget-to-panel.service';
import { QueryService } from '../query/query.service';
import { DataSourceService } from '../data-source/data-source.service';
import { GroupingElementService } from '../grouping-element/grouping-element.service';
import { TenantService } from '../tenant/tenant.service';
import { DashboardToTenantService } from '../dashboard-to-tenant/dashboard-to-tenant.service';
import { WidgetToTenantService } from '../widget-to-tenant/widget-to-tenant.service';
import { CorporateInfoService } from '../corporate-info/corporate-info.service';
import { PopulateService } from './populate/populate.service';
import { AuthDataRepo } from '../auth-data/auth-data.repo';
import { DataSourceRepo } from '../data-source/data-source.repo';
import { DashboardRepo } from './dashboard.repo';
import { DashboardToTenantRepo } from '../dashboard-to-tenant/dashboard-to-tenant.repo';
import { GroupingElementRepo } from '../grouping-element/grouping-element.repo';
import { PanelRepo } from '../panel/panel.repo';
import { QueryRepo } from '../query/query.repo';
import { QueryConfigRepo } from '../query-config/query-config.repo';
import { TenantRepo } from '../tenant/tenant.repo';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';
import { WidgetToTenantRepo } from '../widget-to-tenant/widget-to-tenant.repo';
import { CorporateInfoRepo } from '../corporate-info/corporate-info.repo';
import { DataService as NgsiDataService } from '../../../ngsi-service/src/data/data.service';
import { QueryService as NgsiQueryService } from '../../../ngsi-service/src/query/query.service';
import { AuthService as NgsiAuthService } from '../../../ngsi-service/src/auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { DashboardDataService } from './dashboard.data.service';
import { WidgetRepo } from '../widget/widget.repo';
import { CorporateInfoSidebarLogosRepo } from '../corporate-info/corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../logo/logo.repo';
import { LogoService } from '../logo/logo.service';
import { GeneralSettingsRepo } from '../general-settings/general-settings.repo';
import { WidgetService } from '../widget/widget.service';
import { TabService } from '../tab/tab.service';
import { TabRepo } from '../tab/tab.repo';
import { WidgetDataService } from '../widget/widget.data.service';

@Module({
  imports: [HttpModule],
  providers: [
    DashboardService,
    DashboardDataService,
    CorporateInfoService,
    CorporateInfoRepo,
    AuthHelperUtility,
    DataSourceService,
    QueryConfigService,
    GroupingElementService,
    WidgetToPanelService,
    QueryService,
    TenantService,
    DashboardToTenantService,
    WidgetToTenantService,
    PopulateService,
    AuthDataRepo,
    DataSourceRepo,
    DashboardRepo,
    DashboardToTenantRepo,
    GroupingElementRepo,
    PanelRepo,
    QueryRepo,
    QueryConfigRepo,
    TenantRepo,
    WidgetToPanelRepo,
    WidgetToTenantRepo,
    NgsiAuthService,
    NgsiDataService,
    NgsiQueryService,
    WidgetRepo,
    WidgetService,
    TabService,
    TabRepo,
    CorporateInfoSidebarLogosRepo,
    LogoRepo,
    LogoService,
    GeneralSettingsRepo,
    WidgetService,
    WidgetDataService,
    TabService,
    TabRepo,
  ],
  controllers: [DashboardController],
})
export class DashboardModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply the AuthHelperMiddleware to protect specific routes
    consumer.apply(AuthHelperMiddleware).forRoutes(
      { path: 'dashboards*', method: RequestMethod.ALL }, // Protect all methods in the "dashboards" route
    );
  }
}
