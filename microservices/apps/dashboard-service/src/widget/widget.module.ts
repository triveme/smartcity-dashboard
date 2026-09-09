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
import { WidgetDataService } from './widget.data.service';
import { CorporateInfoSidebarLogosRepo } from '../corporate-info/corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../logo/logo.repo';
import { LogoService } from '../logo/logo.service';
import { DataSourceService } from '../data-source/data-source.service';
import { AuthDataRepo } from '../auth-data/auth-data.repo';
import { DataSourceRepo } from '../data-source/data-source.repo';
import { GeneralSettingsRepo } from '../general-settings/general-settings.repo';
import { PopulateChartService } from 'apps/data-translation-service/src/populate/populate-chart.service';
import { DataTranslationRepo } from 'apps/data-translation-service/src/data-translation.repo';
import { PopulateMapService } from 'apps/data-translation-service/src/populate/populate-map.service';
import { RoundingService } from 'apps/data-translation-service/src/transformation/rounding.service';
import { PlatformInternalClientService } from '../platform-internal/platform-internal.client.service';
import { PlatformQueryResolverService } from '../platform-internal/platform-query-resolver.service';

@Module({
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
    CorporateInfoSidebarLogosRepo,
    LogoRepo,
    LogoService,
    DataSourceService,
    DataSourceRepo,
    AuthDataRepo,
    GeneralSettingsRepo,
    PopulateChartService,
    DataTranslationRepo,
    PopulateMapService,
    RoundingService,
    PlatformInternalClientService,
    PlatformQueryResolverService,
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
