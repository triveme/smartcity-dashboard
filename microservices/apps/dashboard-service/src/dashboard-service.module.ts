import { Module } from '@nestjs/common';
import { DataSourceModule } from './data-source/data-source.module';
import { QueryModule } from './query/query.module';
import { QueryConfigModule } from './query-config/query-config.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PostgresDbModule } from '@app/postgres-db';
import { WidgetModule } from './widget/widget.module';
import { PanelModule } from './panel/panel.module';
import { TabModule } from './tab/tab.module';
import { DataModelModule } from './data-model/data-model.module';
import { GroupingElementModule } from './grouping-element/grouping-element.module';
import { WidgetToPanelModule } from './widget-to-panel/widget-to-panel.module';
import { CorporateInfoModule } from './corporate-info/corporate-info.module';
import { TenantModule } from './tenant/tenant.module';
import { AuthDataService } from './auth-data/auth-data.service';
import { AuthDataController } from './auth-data/auth-data.controller';
import { AuthDataModule } from './auth-data/auth-data.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@app/auth-helper/AuthGuard';
import { DashboardToTenantModule } from './dashboard-to-tenant/dashboard-to-tenant.module';
import { WidgetToTenantModule } from './widget-to-tenant/widget-to-tenant.module';
import { LogoModule } from './logo/logo.module';
import { AuthHelperUtility } from '@app/auth-helper';
import { CorporateInfoSidebarLogosModule } from './corporate-info-sidebar-logos/corporate-info-sidebar-logos.module';
import { LoggerModule } from './logging/logger.module';
import { GeneralSettingsModule } from './general-settings/general-settings.module';

@Module({
  imports: [
    DataSourceModule,
    QueryModule,
    QueryConfigModule,
    DashboardModule,
    PostgresDbModule,
    WidgetModule,
    PanelModule,
    TabModule,
    DataModelModule,
    GroupingElementModule,
    WidgetToPanelModule,
    CorporateInfoModule,
    CorporateInfoSidebarLogosModule,
    TenantModule,
    AuthDataModule,
    JwtModule.register({
      global: true,
    }),
    DashboardToTenantModule,
    WidgetToTenantModule,
    LogoModule,
    LoggerModule,
    GeneralSettingsModule,
  ],
  providers: [
    AuthDataService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthHelperUtility,
  ],
  controllers: [AuthDataController],
})
export class DashboardServiceModule {}
