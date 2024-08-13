import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { CorporateInfoSidebarLogosRepo } from './corporate-info-sidebar-logos.repo';
import { CorporateInfoSidebarLogo } from '@app/postgres-db/schemas/corporate-info-sidebar-logos.schema';

@Injectable()
export class CorporateInfoSidebarLogosService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly corporateInfoSidebarLogosRepo: CorporateInfoSidebarLogosRepo,
  ) {}

  async getByCorporateInfoId(
    corporateInfoId: string,
  ): Promise<CorporateInfoSidebarLogo[]> {
    return this.corporateInfoSidebarLogosRepo.getByCorporateInfoId(
      corporateInfoId,
    );
  }
}
