import { pgTable, uuid, text, real } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tenants } from './tenant.schema';

// If you want to enforce a foreign key relationship back to the tabs table,
// you might import the tabs schema. Note: This can sometimes create a circular dependency.
// To avoid that, consider adding the foreign key constraint at the database level instead.
export const customMapImages = pgTable('tab_custom_map_images', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tenantId: text('tenant_id').references(() => tenants.abbreviation, {
    onUpdate: 'cascade',
  }),
  imageBase64: text('image_base64'),
  name: text('image_name'),
  width: real('image_widgth'),
  height: real('image_height'),
});

export type CustomMapImage = typeof customMapImages.$inferSelect;
export type NewCustomMapImage = typeof customMapImages.$inferInsert;
