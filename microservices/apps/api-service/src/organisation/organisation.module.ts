import { Module } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { AuthService } from '../auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { TenantService } from 'apps/dashboard-service/src/tenant/tenant.service';
import { AuthModule } from '../auth/auth.module';
import { CorporateInfoService } from 'apps/dashboard-service/src/corporate-info/corporate-info.service';
import { CorporateInfoRepo } from 'apps/dashboard-service/src/corporate-info/corporate-info.repo';
import { TenantRepo } from 'apps/dashboard-service/src/tenant/tenant.repo';
import { CorporateInfoSidebarLogosRepo } from 'apps/dashboard-service/src/corporate-info/corporate-info-sidebar-logos.repo';
import { LogoRepo } from 'apps/dashboard-service/src/logo/logo.repo';
import { LogoService } from '../../../dashboard-service/src/logo/logo.service';
import { GeneralSettingsRepo } from 'apps/dashboard-service/src/general-settings/general-settings.repo';

@Module({
  imports: [AuthModule, HttpModule],
  providers: [
    AuthService,
    CorporateInfoService,
    CorporateInfoRepo,
    CorporateInfoSidebarLogosRepo,
    GeneralSettingsRepo,
    LogoRepo,
    LogoService,
    TenantService,
    TenantRepo,
    OrganisationService,
  ],
  exports: [OrganisationService],
})
export class OrganisationModule {}
