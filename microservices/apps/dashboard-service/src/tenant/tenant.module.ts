import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantRepo } from './tenant.repo';
import { CorporateInfoService } from '../corporate-info/corporate-info.service';
import { CorporateInfoRepo } from '../corporate-info/corporate-info.repo';
import { CorporateInfoSidebarLogosRepo } from '../corporate-info-sidebar-logos/corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../logo/logo.repo';
import { LogoService } from '../logo/logo.service';
import { GeneralSettingsRepo } from '../general-settings/general-settings.repo';

@Module({
  providers: [
    TenantService,
    TenantRepo,
    CorporateInfoService,
    CorporateInfoRepo,
    CorporateInfoSidebarLogosRepo,
    LogoRepo,
    LogoService,
    GeneralSettingsRepo,
  ],
  controllers: [TenantController],
  exports: [TenantService],
})
export class TenantModule {}
