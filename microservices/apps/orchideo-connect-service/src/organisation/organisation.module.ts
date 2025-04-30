import { Module } from '@nestjs/common';
import { OrganisationService } from './organisation.service';
import { AuthService } from '../auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { TenantService } from '../../../dashboard-service/src/tenant/tenant.service';
import { AuthModule } from '../auth/auth.module';
import { CorporateInfoService } from '../../../dashboard-service/src/corporate-info/corporate-info.service';
import { CorporateInfoRepo } from '../../../dashboard-service/src/corporate-info/corporate-info.repo';
import { TenantRepo } from '../../../dashboard-service/src/tenant/tenant.repo';
import { CorporateInfoSidebarLogosRepo } from '../../../dashboard-service/src/corporate-info/corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../../../dashboard-service/src/logo/logo.repo';
import { LogoService } from '../../../dashboard-service/src/logo/logo.service';
import { GeneralSettingsRepo } from '../../../dashboard-service/src/general-settings/general-settings.repo';

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
