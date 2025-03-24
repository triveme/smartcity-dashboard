import { Dashboard, dashboards } from '@app/postgres-db/schemas';
import { DbType } from '@app/postgres-db';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import {
  dashboardsToTenants,
  DashboardToTenant,
} from '@app/postgres-db/schemas/dashboard-to-tenant.schema';

export function getDashboard(url?: string): Dashboard {
  url = url ? url : 'testUrl';

  return {
    id: '',
    name: 'Sample Dashboard',
    headlineColor: '#FFFFFF',
    icon: null,
    readRoles: ['scs-admin'],
    type: 'example',
    url: url,
    visibility: 'public',
    allowDataExport: false,
    allowShare: false,
    writeRoles: ['scs-admin'],
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
