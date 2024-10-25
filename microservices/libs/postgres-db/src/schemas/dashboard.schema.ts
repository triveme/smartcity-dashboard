import { sql } from 'drizzle-orm';
import { boolean, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const visibilityEnum = pgEnum('visibility', [
  'public',
  'protected',
  'invisible',
]);
export const dashboards = pgTable('dashboard', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name'),
  allowDataExport: boolean('allow_data_export'),
  headlineColor: text('headline_color'),
  icon: text('icon'),
  readRoles: text('read_roles').array(),
  type: text('type'),
  url: text('url'),
  visibility: visibilityEnum('visibility'),
  writeRoles: text('write_roles').array(),
});

export type Dashboard = typeof dashboards.$inferSelect;
export type NewDashboard = typeof dashboards.$inferInsert;
