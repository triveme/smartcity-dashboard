import { Module } from '@nestjs/common';
import { SystemUserService } from './system-user.service';
import { SystemUserController } from './system-user.controller';
import { OrganisationService } from '../organisation/organisation.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { TenantService } from 'apps/dashboard-service/src/tenant/tenant.service';
import { CorporateInfoService } from 'apps/dashboard-service/src/corporate-info/corporate-info.service';
import { CorporateInfoRepo } from 'apps/dashboard-service/src/corporate-info/corporate-info.repo';
import { TenantRepo } from 'apps/dashboard-service/src/tenant/tenant.repo';
import { CorporateInfoSidebarLogosRepo } from 'apps/dashboard-service/src/corporate-info-sidebar-logos/corporate-info-sidebar-logos.repo';
import { LogoRepo } from 'apps/dashboard-service/src/logo/logo.repo';
import { LogoService } from 'apps/dashboard-service/src/logo/logo.service';

@Module({
  imports: [AuthModule, HttpModule],
  providers: [
    AuthService,
    CorporateInfoService,
    CorporateInfoRepo,
    CorporateInfoSidebarLogosRepo,
    LogoRepo,
    LogoService,
    SystemUserService,
    OrganisationService,
    TenantService,
    TenantRepo,
  ],
  controllers: [SystemUserController],
  exports: [SystemUserService],
})
export class SystemUserModule {}
