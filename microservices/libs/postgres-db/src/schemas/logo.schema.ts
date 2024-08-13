import { sql } from 'drizzle-orm';
import { pgTable, smallint, text, uuid } from 'drizzle-orm/pg-core';
import { tenants } from './tenant.schema';

export const logos = pgTable('logo', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tenantId: text('tenant_id').references(() => tenants.abbreviation),
  logo: text('logo'),
  logoHeight: smallint('logo_height'),
  logoWidth: smallint('logo_width'),
  logoName: text('logo_name'),
  format: text('format'),
  size: text('size'),
});

export type Logo = typeof logos.$inferSelect;
export type NewLogo = typeof logos.$inferInsert;
