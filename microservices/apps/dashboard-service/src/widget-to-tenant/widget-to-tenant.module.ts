import { Module } from '@nestjs/common';
import { WidgetToTenantService } from './widget-to-tenant.service';
import { TenantService } from '../tenant/tenant.service';
import { TenantRepo } from '../tenant/tenant.repo';
import { WidgetToTenantRepo } from './widget-to-tenant.repo';
import { CorporateInfoService } from '../corporate-info/corporate-info.service';
import { CorporateInfoRepo } from '../corporate-info/corporate-info.repo';
import { CorporateInfoSidebarLogosRepo } from '../corporate-info-sidebar-logos/corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../logo/logo.repo';

@Module({
  providers: [
    WidgetToTenantService,
    WidgetToTenantRepo,
    CorporateInfoService,
    CorporateInfoRepo,
    TenantService,
    TenantRepo,
    CorporateInfoSidebarLogosRepo,
    LogoRepo,
  ],
})
export class WidgetToTenantModule {}
