import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  dashboardsToTenants,
  DashboardToTenant,
} from '@app/postgres-db/schemas/dashboard-to-tenant.schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class DashboardToTenantRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getByDashboardId(dashboardId: string): Promise<DashboardToTenant> {
    const dashboardToTenantsArray = await this.db
      .select()
      .from(dashboardsToTenants)
      .where(eq(dashboardsToTenants.dashboardId, dashboardId));

    return dashboardToTenantsArray.length > 0
      ? dashboardToTenantsArray[0]
      : null;
  }

  async getByTenantId(tenantId: string): Promise<DashboardToTenant[]> {
    return this.db
      .select()
      .from(dashboardsToTenants)
      .where(eq(dashboardsToTenants.tenantId, tenantId));
  }

  async update(
    values: DashboardToTenant,
    dashboardId: string,
    oldTenantId: string,
  ): Promise<DashboardToTenant> {
    const result = await this.db
      .update(dashboardsToTenants)
      .set(values)
      .where(
        and(
          eq(dashboardsToTenants.dashboardId, dashboardId),
          eq(dashboardsToTenants.tenantId, oldTenantId),
        ),
      )
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(
    row: DashboardToTenant,
    transaction?: DbType,
  ): Promise<DashboardToTenant> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .delete(dashboardsToTenants)
      .where(
        and(
          eq(dashboardsToTenants.dashboardId, row.dashboardId),
          eq(dashboardsToTenants.tenantId, row.tenantId),
        ),
      )
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async create(row: DashboardToTenant): Promise<DashboardToTenant> {
    const result = await this.db
      .insert(dashboardsToTenants)
      .values(row)
      .returning();

    return result.length > 0 ? result[0] : null;
  }
}
