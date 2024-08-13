import { sql } from 'drizzle-orm';
import { pgTable, smallint, text, uuid } from 'drizzle-orm/pg-core';
import { visibilityEnum } from './dashboard.schema';

export const widgets = pgTable('widget', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name'),
  height: smallint('height'),
  width: smallint('width'),
  icon: text('icon'),
  visibility: visibilityEnum('visibility'),
  readRoles: text('read_roles').array(),
  writeRoles: text('write_roles').array(),
});

export type Widget = typeof widgets.$inferSelect;
export type NewWidget = typeof widgets.$inferInsert;
