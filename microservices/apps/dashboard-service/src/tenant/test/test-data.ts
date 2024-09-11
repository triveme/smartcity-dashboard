import { Tenant, tenants } from '@app/postgres-db/schemas/tenant.schema';
import { DbType } from '@app/postgres-db';
import { v4 as uuid } from 'uuid';
import {
  dashboardsToTenants,
  DashboardToTenant,
} from '@app/postgres-db/schemas/dashboard-to-tenant.schema';
import { eq } from 'drizzle-orm';

export function getTenant(tenantAbbreviation?: string): Tenant {
  return {
    id: uuid(),
    abbreviation: tenantAbbreviation ?? 'edag',
  };
}

export async function createTenantByObject(
  db: DbType,
  tenant: Tenant,
): Promise<Tenant> {
  const createdTenants = await db.insert(tenants).values(tenant).returning();

  return createdTenants.length > 0 ? createdTenants[0] : null;
}

export async function createDashboardToTenant(
  db: DbType,
  dashboardId: string,
  tenantId: string,
): Promise<DashboardToTenant> {
  const createdDashboardToTenant = await db
    .insert(dashboardsToTenants)
    .values({
      dashboardId: dashboardId,
      tenantId: tenantId,
    })
    .returning()
    .returning();

  return createdDashboardToTenant.length > 0
    ? createdDashboardToTenant[0]
    : null;
}

export async function getTenantFromDb(db: DbType, id: string): Promise<Tenant> {
  const tenantArray = await db.select().from(tenants).where(eq(tenants.id, id));

  return tenantArray.length > 0 ? tenantArray[0] : null;
}
