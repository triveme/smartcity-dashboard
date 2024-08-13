import { sql } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenant', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  abbreviation: text('abbreviation').unique(),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
