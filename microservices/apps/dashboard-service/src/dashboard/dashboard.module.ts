import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { AuthHelperMiddleware, AuthHelperUtility } from '@app/auth-helper';
import { DashboardService } from './dashboard.service';
import { DataModelService } from '../data-model/data-model.service';
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
import { DataModelRepo } from '../data-model/data-model.repo';
import { DashboardToTenantRepo } from '../dashboard-to-tenant/dashboard-to-tenant.repo';
import { GroupingElementRepo } from '../grouping-element/grouping-element.repo';
import { PanelRepo } from '../panel/panel.repo';
import { QueryRepo } from '../query/query.repo';
import { QueryConfigRepo } from '../query-config/query-config.repo';
import { TenantRepo } from '../tenant/tenant.repo';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';
import { WidgetToTenantRepo } from '../widget-to-tenant/widget-to-tenant.repo';
import { CorporateInfoRepo } from '../corporate-info/corporate-info.repo';
import { PopulateValueService } from './populate/populate-value.service';
import { PopulateChartService } from './populate/populate-chart.service';
import { PopulateMapService } from './populate/populate-map.service';
import { DataService as NgsiDataService } from '../../../ngsi-service/src/data/data.service';
import { QueryService as NgsiQueryService } from '../../../ngsi-service/src/query/query.service';
import { AuthService as NgsiAuthService } from '../../../ngsi-service/src/auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { DashboardDataService } from './dashboard.data.service';
import { CorporateInfoSidebarLogosRepo } from '../corporate-info-sidebar-logos/corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../logo/logo.repo';

@Module({
  imports: [HttpModule],
  providers: [
    DashboardService,
    DashboardDataService,
    CorporateInfoService,
    CorporateInfoRepo,
    AuthHelperUtility,
    DataModelService,
    DataSourceService,
    QueryConfigService,
    GroupingElementService,
    WidgetToPanelService,
    QueryService,
    TenantService,
    DashboardToTenantService,
    WidgetToTenantService,
    PopulateService,
    PopulateValueService,
    PopulateChartService,
    PopulateMapService,
    AuthDataRepo,
    DataSourceRepo,
    DashboardRepo,
    DataModelRepo,
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
    CorporateInfoSidebarLogosRepo,
    LogoRepo,
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
