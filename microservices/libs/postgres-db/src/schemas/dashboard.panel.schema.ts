import { relations, sql } from 'drizzle-orm';
import { boolean, pgTable, smallint, text, uuid } from 'drizzle-orm/pg-core';
import { dashboards } from './dashboard.schema';

export const panels = pgTable('panel', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  dashboardId: uuid('dashboard_id').references(() => dashboards.id),
  name: text('name'),
  height: smallint('height'),
  width: smallint('width'),
  position: smallint('position'),
  headlineColor: text('headline_color'),
  icon: text('icon'),
  info: text('info_msg'),
  generalInfo: text('general_info'),
  showGeneralInfo: boolean('show_general_info'),
  showJumpoffButton: boolean('show_jumpoff_button'),
  openJumpoffLinkInNewTab: boolean('open_jumpoff_link_in_new_tab'),
  jumpoffLabel: text('jumpoff_label'),
  jumpoffIcon: text('jumpoff_icon'),
  jumpoffUrl: text('jumpoff_url'),
});

export const panelsRelations = relations(panels, ({ one }) => ({
  dashboard: one(dashboards, {
    fields: [panels.dashboardId],
    references: [dashboards.id],
  }),
}));

export type Panel = typeof panels.$inferSelect;
export type NewPanel = typeof panels.$inferInsert;
