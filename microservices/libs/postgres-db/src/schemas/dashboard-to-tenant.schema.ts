import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { dashboards } from './dashboard.schema';
import { tenants } from './tenant.schema';

export const dashboardsToTenants = pgTable(
  'dashboard_to_tenant',
  {
    dashboardId: uuid('dashboard_id').references(() => dashboards.id),
    tenantId: uuid('tenant_id').references(() => tenants.id),
  },
  (t) => ({
    pk: primaryKey(t.dashboardId, t.tenantId),
  }),
);

export const dashboardsToTenantsRelations = relations(
  dashboardsToTenants,
  ({ one }) => ({
    dashboard: one(dashboards, {
      fields: [dashboardsToTenants.dashboardId],
      references: [dashboards.id],
    }),
    tenant: one(tenants, {
      fields: [dashboardsToTenants.tenantId],
      references: [tenants.id],
    }),
  }),
);

export type DashboardToTenant = typeof dashboardsToTenants.$inferSelect;
export type NewDashboardToTenant = typeof dashboardsToTenants.$inferInsert;
