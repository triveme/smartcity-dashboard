import { Module } from '@nestjs/common';
import { DashboardToTenantService } from './dashboard-to-tenant.service';
import { TenantService } from '../tenant/tenant.service';
import { DashboardToTenantRepo } from './dashboard-to-tenant.repo';
import { TenantRepo } from '../tenant/tenant.repo';
import { CorporateInfoService } from '../corporate-info/corporate-info.service';
import { CorporateInfoRepo } from '../corporate-info/corporate-info.repo';
import { CorporateInfoSidebarLogosRepo } from '../corporate-info/corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../logo/logo.repo';
import { LogoService } from '../logo/logo.service';
import { GeneralSettingsRepo } from '../general-settings/general-settings.repo';

@Module({
  providers: [
    DashboardToTenantService,
    DashboardToTenantRepo,
    TenantService,
    TenantRepo,
    CorporateInfoService,
    CorporateInfoRepo,
    CorporateInfoSidebarLogosRepo,
    LogoRepo,
    LogoService,
    GeneralSettingsRepo,
  ],
})
export class DashboardToTenantModule {}
