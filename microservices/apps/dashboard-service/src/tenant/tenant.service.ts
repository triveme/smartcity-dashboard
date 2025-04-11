import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { NewTenant, Tenant } from '@app/postgres-db/schemas/tenant.schema';
import { Dashboard } from '@app/postgres-db/schemas';
import { TenantRepo } from './tenant.repo';
import { CorporateInfoService } from '../corporate-info/corporate-info.service';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { LogoService } from '../logo/logo.service';
import { GeneralSettingsRepo } from '../general-settings/general-settings.repo';
import { v4 as uuid } from 'uuid';

export type TenantWithDashboards = Tenant & {
  dashboards: Dashboard[];
};

@Injectable()
export class TenantService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly tenantRepo: TenantRepo,
    private readonly corporateInfoService: CorporateInfoService,
    private readonly logoService: LogoService,
    private readonly generalSettingsRepo: GeneralSettingsRepo,
  ) {}

  private readonly logger = new Logger(TenantService.name);

  async getAll(): Promise<Tenant[]> {
    return this.tenantRepo.getAll();
  }

  async getById(id: string): Promise<Tenant> {
    return this.tenantRepo.getById(id);
  }

  async existsByAbbreviation(abbreviation: string): Promise<boolean> {
    return this.tenantRepo.existsByAbbreviation(abbreviation);
  }

  async create(row: NewTenant): Promise<Tenant> {
    return await this.db.transaction(async (tx) => {
      const result = await this.tenantRepo.create(row, tx);

      if (!result) {
        throw new HttpException(
          `Could not create tenant ${row.abbreviation}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.createCorporateInfo(result, tx, row, 'Light');
      await this.createCorporateInfo(result, tx, row, 'Dark');
      await this.createGeneralSettings(tx, row);

      return result;
    });
  }

  private async createCorporateInfo(
    result: Tenant,
    tx: DbType,
    row: NewTenant,
    theme: 'Dark' | 'Light',
  ): Promise<void> {
    const corporateInfo = await this.corporateInfoService.create(
      {
        tenantId: result.abbreviation,
        titleBar: theme,
      },
      tx,
    );

    if (!corporateInfo) {
      throw new HttpException(
        `Could not create corporate identity for tenant ${row.abbreviation} with theme ${theme}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(id: string): Promise<Tenant> {
    return this.db.transaction(async (tx) => {
      const dbTenant = await this.tenantRepo.getById(id);

      if (!dbTenant)
        throw new NotFoundException(`Tenant not found by id ${id}`);

      await this.corporateInfoService.deleteByTenant(dbTenant.abbreviation, tx);
      await this.logoService.deleteByTenant(dbTenant.abbreviation, tx);

      return await this.tenantRepo.delete(id);
    });
  }

  async getTenantByAbbreviation(abbreviation: string): Promise<Tenant> {
    const tenantByAbbreviation =
      await this.tenantRepo.getTenantByAbbreviation(abbreviation);

    if (!tenantByAbbreviation) {
      throw new HttpException(
        `No tenant found with given abbreviation ${abbreviation}.`,
        HttpStatus.NOT_FOUND,
      );
    }

    return tenantByAbbreviation;
  }

  async getTenantsWithDashboards(): Promise<TenantWithDashboards[]> {
    // Joining the related tenant & dashboard tables
    const flatTenantData = await this.tenantRepo.getFlatTenantData();

    if (flatTenantData.length === 0) {
      this.logger.error('No tenants found.');
      throw new HttpException('Tenants Not Found', HttpStatus.NOT_FOUND);
    } else {
      // constructing the TenantWithDashboards returnable
      return this.reduceRowsToTenantWithDashboards(flatTenantData);
    }
  }

  async getTenantWithDashboards(id: string): Promise<TenantWithDashboards> {
    // Joining the related tenant & dashboard tables
    const flatTenantData = await this.tenantRepo.getFlatTenantData();

    if (flatTenantData.length === 0) {
      this.logger.error(`No tenant found by id ${id}`);
      throw new HttpException('Tenants Not Found', HttpStatus.NOT_FOUND);
    } else {
      const tenantsWithDashboards =
        this.reduceRowsToTenantWithDashboards(flatTenantData);

      return tenantsWithDashboards[0];
    }
  }

  // Method to construct the Tenant objects with an array of dashboards inside
  private reduceRowsToTenantWithDashboards(rows): TenantWithDashboards[] {
    const tenantsWithDashboards: Record<string, TenantWithDashboards> = {};

    rows.forEach((row) => {
      const tenantId = row.tenant.id as string;
      const dashboardId = row.dashboard?.id as string | null;

      if (!tenantsWithDashboards[tenantId]) {
        tenantsWithDashboards[tenantId] = {
          ...row.tenant,
          dashboards: [],
        };
      }

      if (dashboardId) {
        tenantsWithDashboards[tenantId].dashboards.push(
          row.dashboard as Dashboard,
        );
      }
    });

    return Object.values(tenantsWithDashboards);
  }

  private async createGeneralSettings(
    tx: DbType,
    tenant: NewTenant,
  ): Promise<void> {
    await this.generalSettingsRepo.create(
      {
        id: uuid(),
        tenant: tenant.abbreviation,
        information: null,
        imprint: null,
        privacy: null,
        allowThemeSwitching: false,
        disclaimer: null,
      },
      tx,
    );
  }
}
