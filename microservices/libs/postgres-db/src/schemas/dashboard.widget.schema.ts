import { sql } from 'drizzle-orm';
import {
  boolean,
  json,
  pgTable,
  smallint,
  text,
  uuid,
} from 'drizzle-orm/pg-core';
import { visibilityEnum } from './dashboard.schema';

export const widgets = pgTable('widget', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name'),
  description: text('description'),
  showName: boolean('show_name'),
  subheadline: text('subheadline'),
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

export const widgetData = pgTable('widget_data', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  widgetId: uuid('widget_id').references(() => widgets.id, {
    onDelete: 'cascade',
  }),
  data: json('data'),
});

export type WidgetData = typeof widgetData.$inferSelect;
export type Widget = typeof widgets.$inferSelect & {
  widgetData?: WidgetData;
};
export type NewWidget = typeof widgets.$inferInsert;
