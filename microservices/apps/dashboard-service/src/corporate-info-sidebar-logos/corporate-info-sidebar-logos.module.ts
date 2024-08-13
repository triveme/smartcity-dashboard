import { Module } from '@nestjs/common';
import { CorporateInfoSidebarLogosController } from './corporate-info-sidebar-logos.controller';
import { CorporateInfoSidebarLogosService } from './corporate-info-sidebar-logos.service';
import { CorporateInfoSidebarLogosRepo } from './corporate-info-sidebar-logos.repo';

@Module({
  providers: [CorporateInfoSidebarLogosService, CorporateInfoSidebarLogosRepo],
  controllers: [CorporateInfoSidebarLogosController],
  exports: [CorporateInfoSidebarLogosRepo],
})
export class CorporateInfoSidebarLogosModule {}
