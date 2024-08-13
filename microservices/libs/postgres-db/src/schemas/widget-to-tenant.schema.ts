import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core';
import { tenants } from './tenant.schema';
import { widgets } from './dashboard.widget.schema';

export const widgetsToTenants = pgTable(
  'widget_to_tenant',
  {
    widgetId: uuid('widget_id').references(() => widgets.id),
    tenantId: uuid('tenant_id').references(() => tenants.id),
  },
  (t) => ({
    pk: primaryKey(t.widgetId, t.tenantId),
  }),
);

export const widgetsToTenantsRelations = relations(
  widgetsToTenants,
  ({ one }) => ({
    widget: one(widgets, {
      fields: [widgetsToTenants.widgetId],
      references: [widgets.id],
    }),
    tenant: one(tenants, {
      fields: [widgetsToTenants.tenantId],
      references: [tenants.id],
    }),
  }),
);

export type WidgetToTenant = typeof widgetsToTenants.$inferSelect;
export type NewWidgetToTenant = typeof widgetsToTenants.$inferInsert;
