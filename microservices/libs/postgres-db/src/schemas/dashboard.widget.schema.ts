import { sql } from 'drizzle-orm';
import { boolean, pgTable, smallint, text, uuid } from 'drizzle-orm/pg-core';
import { visibilityEnum } from './dashboard.schema';

export const widgets = pgTable('widget', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name'),
  showName: boolean('show_name'),
  height: smallint('height'),
  width: smallint('width'),
  headlineColor: text('headline_color'),
  icon: text('icon'),
  allowShare: boolean('allow_share'),
  allowDataExport: boolean('allow_data_export'),
  visibility: visibilityEnum('visibility'),
  readRoles: text('read_roles').array(),
  writeRoles: text('write_roles').array(),
});

export type Widget = typeof widgets.$inferSelect;
export type NewWidget = typeof widgets.$inferInsert;
