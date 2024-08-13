import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { NewTenant, Tenant } from '@app/postgres-db/schemas/tenant.schema';
import { Dashboard } from '@app/postgres-db/schemas';
import { TenantRepo } from './tenant.repo';
import { CorporateInfoService } from '../corporate-info/corporate-info.service';
import { DbType, POSTGRES_DB } from '@app/postgres-db';

export type TenantWithDashboards = Tenant & {
  dashboards: Dashboard[];
};

@Injectable()
export class TenantService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly tenantRepo: TenantRepo,
    private readonly corporateInfoService: CorporateInfoService,
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

      const corporateInfo = await this.corporateInfoService.create(
        {
          tenantId: result.abbreviation,
        },
        tx,
      );

      if (!corporateInfo) {
        throw new HttpException(
          `Could not create corporate identity for tenant ${row.abbreviation}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      return result;
    });
  }

  async update(id: string, values: Partial<Tenant>): Promise<Tenant> {
    return this.tenantRepo.update(id, values);
  }

  async delete(id: string): Promise<Tenant> {
    return this.tenantRepo.delete(id);
  }

  async getTenantsByAbbreviation(abbreviation: string): Promise<Tenant[]> {
    const tenantsWithAbbreviation =
      await this.tenantRepo.getTenantsByAbbreviation(abbreviation);

    if (tenantsWithAbbreviation.length === 0) {
      throw new HttpException(
        'No tenant found with given abbreviation.',
        HttpStatus.NOT_FOUND,
      );
    }

    return tenantsWithAbbreviation;
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
}
