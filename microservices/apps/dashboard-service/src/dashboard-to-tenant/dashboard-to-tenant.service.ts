import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DbType } from '@app/postgres-db';
import { DashboardToTenant } from '@app/postgres-db/schemas/dashboard-to-tenant.schema';
import { TenantService } from '../tenant/tenant.service';
import { DashboardToTenantRepo } from './dashboard-to-tenant.repo';

@Injectable()
export class DashboardToTenantService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly dashboardToTenantRepo: DashboardToTenantRepo,
  ) {}

  async getDashboardToTenantRelationshipByDashboardId(
    dashboardId: string,
  ): Promise<DashboardToTenant> {
    return this.dashboardToTenantRepo.getByDashboardId(dashboardId);
  }

  async getDashboardToTenantRelationshipsByTenantId(
    dashboardId: string,
  ): Promise<DashboardToTenant[]> {
    return this.dashboardToTenantRepo.getByTenantId(dashboardId);
  }

  async updateDashboardToTenantRelationship(
    dashboardId: string,
    oldTenantId: string,
    newTenantId: string,
  ): Promise<DashboardToTenant> {
    const dashboardToTenant: DashboardToTenant = {
      dashboardId: dashboardId,
      tenantId: newTenantId,
    };

    return this.dashboardToTenantRepo.update(
      dashboardToTenant,
      dashboardId,
      oldTenantId,
    );
  }

  async deleteDashboardToTenantEntity(
    row: DashboardToTenant,
    transaction?: DbType,
  ): Promise<DashboardToTenant> {
    return this.dashboardToTenantRepo.delete(row, transaction);
  }

  async createDashboardToTenantEntity(
    row: DashboardToTenant,
  ): Promise<DashboardToTenant> {
    return this.dashboardToTenantRepo.create(row);
  }

  async manageCreate(
    dashboardId: string,
    tenantAbbreviation: string,
  ): Promise<void> {
    const tenants =
      await this.tenantService.getTenantsByAbbreviation(tenantAbbreviation);

    if (tenants.length > 0) {
      const tenant = tenants[0];

      const dashboardToTenant: DashboardToTenant = {
        dashboardId: dashboardId,
        tenantId: tenant.id,
      };

      await this.createDashboardToTenantEntity(dashboardToTenant);
    }
  }

  async manageUpdate(
    dashboardId: string,
    tenantAbbreviation?: string,
  ): Promise<void> {
    const dashboardToTenant =
      await this.getDashboardToTenantRelationshipByDashboardId(dashboardId);

    if (tenantAbbreviation) {
      const tenants =
        await this.tenantService.getTenantsByAbbreviation(tenantAbbreviation);
      if (tenants.length === 0) {
        throw new HttpException(
          'manageUpdate: Tenant not existing',
          HttpStatus.BAD_REQUEST,
        );
      }
      const tenant = tenants[0];

      if (dashboardToTenant && dashboardToTenant.tenantId !== tenant.id) {
        await this.updateDashboardToTenantRelationship(
          dashboardId,
          dashboardToTenant.tenantId,
          tenant.id,
        );
      } else if (!dashboardToTenant) {
        await this.createDashboardToTenantEntity({
          dashboardId: dashboardId,
          tenantId: tenant.id,
        });
      }
    } else if (dashboardToTenant) {
      await this.deleteDashboardToTenantEntity(dashboardToTenant);
    }
  }

  async manageDelete(dashboardId: string, transaction: DbType): Promise<void> {
    const dashboardToTenant =
      await this.getDashboardToTenantRelationshipByDashboardId(dashboardId);

    if (dashboardToTenant) {
      await this.deleteDashboardToTenantEntity(dashboardToTenant, transaction);
    }
  }
}
