import { Module } from '@nestjs/common';
import { PostgresDbModule } from '@app/postgres-db';
import { ApiService } from './api.service';
import { SystemUserModule } from './system-user/system-user.module';
import { AuthService } from './auth/auth.service';
import { ApiController } from './api.controller';
import { HttpModule } from '@nestjs/axios';
import { ScheduleService } from './schedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { OrganisationScheduleService } from './organisation-schedule.service';
import { OrganisationService } from './organisation/organisation.service';
import { OrganisationModule } from './organisation/organisation.module';
import { SystemUserService } from './system-user/system-user.service';
import { TenantService } from 'apps/dashboard-service/src/tenant/tenant.service';
import { ReportModule } from '../../ngsi-service/src/report/report.module';
import { DataModule } from '../../ngsi-service/src/data/data.module';
import { QueryModule } from '../../ngsi-service/src/query/query.module';
import { DataService } from './data/data.service';
import { QueryService } from './query/query.service';
import { ReportService } from './report/report.service';
import { CorporateInfoService } from 'apps/dashboard-service/src/corporate-info/corporate-info.service';
import { CorporateInfoRepo } from 'apps/dashboard-service/src/corporate-info/corporate-info.repo';
import { TenantRepo } from 'apps/dashboard-service/src/tenant/tenant.repo';
import { CorporateInfoSidebarLogosRepo } from 'apps/dashboard-service/src/corporate-info/corporate-info-sidebar-logos.repo';
import { LogoRepo } from 'apps/dashboard-service/src/logo/logo.repo';
import { LogoService } from '../../dashboard-service/src/logo/logo.service';
import { GeneralSettingsRepo } from 'apps/dashboard-service/src/general-settings/general-settings.repo';

@Module({
  imports: [
    AuthModule,
    DataModule,
    HttpModule,
    OrganisationModule,
    PostgresDbModule,
    QueryModule,
    ReportModule,
    ScheduleModule.forRoot(),
    SystemUserModule,
  ],
  providers: [
    ApiService,
    AuthService,
    CorporateInfoRepo,
    CorporateInfoService,
    CorporateInfoSidebarLogosRepo,
    DataService,
    GeneralSettingsRepo,
    LogoRepo,
    LogoService,
    OrganisationScheduleService,
    OrganisationService,
    QueryService,
    ReportService,
    ScheduleService,
    SystemUserService,
    TenantRepo,
    TenantService,
  ],
  controllers: [ApiController],
})
export class ApiModule {}
