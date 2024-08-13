import { sql } from 'drizzle-orm';
import { smallint, boolean, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { tenants } from './tenant.schema';

export const groupingElements = pgTable('grouping_element', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  parentGroupingElementId: uuid('parent_grouping_element_id').references(
    () => groupingElements.id,
  ),
  name: text('name'),
  url: text('url'),
  color: text('color'),
  gradient: boolean('gradient'),
  icon: text('icon'),
  isDashboard: boolean('is_dashboard'),
  position: smallint('position'),
  tenantAbbreviation: text('tenant_abbreviation').references(
    () => tenants.abbreviation,
  ),
});

export type GroupingElement = typeof groupingElements.$inferSelect;
export type NewGroupingElement = typeof groupingElements.$inferInsert;
