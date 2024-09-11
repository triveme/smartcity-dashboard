import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewTenant,
  Tenant,
  tenants,
} from '@app/postgres-db/schemas/tenant.schema';
import { Dashboard, dashboards } from '@app/postgres-db/schemas';
import { dashboardsToTenants } from '@app/postgres-db/schemas/dashboard-to-tenant.schema';

export type FlatTenantData = {
  dashboard: Dashboard;
  tenant: Tenant;
};

@Injectable()
export class TenantRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getFlatTenantData(): Promise<FlatTenantData[]> {
    return this.db
      .select()
      .from(tenants)
      .leftJoin(
        dashboardsToTenants,
        eq(tenants.id, dashboardsToTenants.tenantId),
      )
      .leftJoin(dashboards, eq(dashboards.id, dashboardsToTenants.dashboardId));
  }

  async getAll(): Promise<Tenant[]> {
    return this.db.select().from(tenants);
  }

  async getById(id: string): Promise<Tenant> {
    const result = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id));

    return result.length > 0 ? result[0] : null;
  }

  async existsByAbbreviation(abbreviation: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.abbreviation, abbreviation));

    return result.length > 0;
  }

  async create(row: NewTenant, transaction?: DbType): Promise<Tenant> {
    const dbActor = transaction ? transaction : this.db;

    const result = await dbActor.insert(tenants).values(row).returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string, transaction?: DbType): Promise<Tenant> {
    const dbActor = transaction ? transaction : this.db;

    const result = await dbActor
      .delete(tenants)
      .where(eq(tenants.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async getTenantByAbbreviation(abbreviation: string): Promise<Tenant> {
    const result = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.abbreviation, abbreviation));

    return result.length > 0 ? result[0] : null;
  }
}
