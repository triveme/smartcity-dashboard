import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tenants } from './tenant.schema';

// If you want to enforce a foreign key relationship back to the tabs table,
// you might import the tabs schema. Note: This can sometimes create a circular dependency.
// To avoid that, consider adding the foreign key constraint at the database level instead.
export const tabImages = pgTable('tab_images', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tenantId: text('tenant_id').references(() => tenants.abbreviation, {
    onUpdate: 'cascade',
  }),
  imageBase64: text('image_base64'),
  name: text('image_name'),
});

export type TabImage = typeof tabImages.$inferSelect;
export type NewTabImage = typeof tabImages.$inferInsert;
