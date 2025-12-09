import { sql } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { tabImages } from './tab-images.schema';
import { tabs } from './dashboard.tab.schema';

export const tabValuesToImageTable = pgTable('tab_values_to_image', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tabId: uuid('tab_id').references(() => tabs.id, {
    onDelete: 'cascade',
  }),
  imageId: uuid('image_id').references(() => tabImages.id, {
    onDelete: 'cascade',
  }),
  min: text('min'),
  max: text('max'), //unused currently
});

export type TabValuesToImage = typeof tabValuesToImageTable.$inferInsert;
export type NewTabValuesToImage = typeof tabValuesToImageTable.$inferInsert;
