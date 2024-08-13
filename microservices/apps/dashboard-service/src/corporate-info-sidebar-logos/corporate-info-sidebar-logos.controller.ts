import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { Public } from '@app/auth-helper/PublicDecorator';
import { CorporateInfoSidebarLogo } from '@app/postgres-db/schemas/corporate-info-sidebar-logos.schema';
import { CorporateInfoSidebarLogosService } from './corporate-info-sidebar-logos.service';

@Controller('corporate_info_sidebar_logos')
export class CorporateInfoSidebarLogosController {
  constructor(private readonly service: CorporateInfoSidebarLogosService) {}

  @Public()
  @Get('/:corporateId')
  async getByCorporateInfoId(
    @Param('corporateId', new ParseUUIDPipe({ version: '4' }))
    corporateInfoId: string,
  ): Promise<CorporateInfoSidebarLogo[]> {
    return this.service.getByCorporateInfoId(corporateInfoId);
  }
}
