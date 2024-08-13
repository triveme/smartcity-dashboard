import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, smallint, uuid } from 'drizzle-orm/pg-core';
import { widgets } from './dashboard.widget.schema';
import { panels } from './dashboard.panel.schema';

export const widgetsToPanels = pgTable(
  'widget_to_panel',
  {
    widgetId: uuid('widget_id').references(() => widgets.id),
    panelId: uuid('panel_id').references(() => panels.id),
    position: smallint('position'),
  },
  (t) => ({
    pk: primaryKey(t.widgetId, t.panelId),
  }),
);

export const widgetsToPanelsRelations = relations(
  widgetsToPanels,
  ({ one }) => ({
    widget: one(widgets, {
      fields: [widgetsToPanels.widgetId],
      references: [widgets.id],
    }),
    panel: one(panels, {
      fields: [widgetsToPanels.panelId],
      references: [panels.id],
    }),
  }),
);

export type WidgetToPanel = typeof widgetsToPanels.$inferSelect;
export type NewWidgetToPanel = typeof widgetsToPanels.$inferInsert;
