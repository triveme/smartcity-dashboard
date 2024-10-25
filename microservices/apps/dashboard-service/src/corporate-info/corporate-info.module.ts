import { Module } from '@nestjs/common';
import { CorporateInfoService } from './corporate-info.service';
import { CorporateInfoController } from './corporate-info.controller';
import { CorporateInfoRepo } from './corporate-info.repo';
import { CorporateInfoSidebarLogosRepo } from './corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../logo/logo.repo';
import { TenantRepo } from '../tenant/tenant.repo';

@Module({
  providers: [
    CorporateInfoService,
    CorporateInfoRepo,
    CorporateInfoSidebarLogosRepo,
    LogoRepo,
    TenantRepo,
  ],
  controllers: [CorporateInfoController],
})
export class CorporateInfoModule {}
