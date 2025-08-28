import { sql } from 'drizzle-orm';
import { pgTable, smallint, text, uuid } from 'drizzle-orm/pg-core';
import { tenants } from './tenant.schema';

export const internalData = pgTable('internal_data', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  collection: text('collection').notNull(),
  type: text('type').notNull(),
  data: text('data').notNull(),
  source: text('source').notNull().unique(),
  firstDataColIndex: smallint('firstDataColIndex').default(0),
  firstDataRowIndex: smallint('firstDataRowIndex').default(1),
  timeGroupRowCount: smallint('timeGroupRowCount').default(1),
  tenantAbbreviation: text('tenant_abbreviation').references(
    () => tenants.abbreviation,
  ),
});

export type InternalData = typeof internalData.$inferSelect;
export type NewInternalData = typeof internalData.$inferInsert;
