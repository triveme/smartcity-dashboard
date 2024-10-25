import { sql } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { tenants } from './tenant.schema';

export const generalSettings = pgTable('general_settings', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tenant: text('tenant').references(() => tenants.abbreviation),
  information: text('information'),
  imprint: text('imprint'),
  privacy: text('privacy'),
});

export type GeneralSettings = typeof generalSettings.$inferSelect;
export type NewGeneralSettings = typeof generalSettings.$inferInsert;
