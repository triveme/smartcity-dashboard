import { Dashboard, dashboards } from '@app/postgres-db/schemas';
import { DbType } from '@app/postgres-db';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import {
  dashboardsToTenants,
  DashboardToTenant,
} from '@app/postgres-db/schemas/dashboard-to-tenant.schema';

export function getDashboard(url?: string): Dashboard {
  url = url ? url : 'http://localhost:1234/dashboard';

  return {
    id: '',
    name: 'Sample Dashboard',
    url: url,
    icon: null,
    type: 'example',
    readRoles: ['scs-admin'],
    writeRoles: ['scs-admin'],
    visibility: 'public',
  };
}

export async function createDashboardByObject(
  dbClient: DbType,
  dashboard: Dashboard,
): Promise<Dashboard> {
  dashboard.id = uuid();

  const createdDashboards = await dbClient
    .insert(dashboards)
    .values(dashboard)
    .returning();

  return createdDashboards.length > 0 ? createdDashboards[0] : null;
}

export async function getDashboardFromDb(
  db: DbType,
  id: string,
): Promise<Dashboard> {
  const dashboardArray = await db
    .select()
    .from(dashboards)
    .where(eq(dashboards.id, id));

  return dashboardArray.length > 0 ? dashboardArray[0] : null;
}

export async function getDashboardToTenantForDashboardFromDb(
  db: DbType,
  id: string,
): Promise<DashboardToTenant> {
  const dashboardToTenantsArray = await db
    .select()
    .from(dashboardsToTenants)
    .where(eq(dashboardsToTenants.dashboardId, id));

  return dashboardToTenantsArray.length > 0 ? dashboardToTenantsArray[0] : null;
}
