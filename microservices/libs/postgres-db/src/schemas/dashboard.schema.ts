import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core';

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
  url: text('url'),
  icon: text('icon'),
  type: text('type'),
  readRoles: text('read_roles').array(),
  writeRoles: text('write_roles').array(),
  visibility: visibilityEnum('visibility'),
});

export type Dashboard = typeof dashboards.$inferSelect;
export type NewDashboard = typeof dashboards.$inferInsert;
