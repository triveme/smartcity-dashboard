import { sql } from 'drizzle-orm';
import {
  smallint,
  boolean,
  pgTable,
  text,
  uuid,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenant.schema';

export const groupingElements = pgTable('grouping_element', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text('name'),
  url: text('url'),
  backgroundColor: text('background_color'),
  fontColor: text('font_color'),
  gradient: boolean('gradient'),
  icon: text('icon'),
  isDashboard: boolean('is_dashboard'),
  position: smallint('position'),
  tenantAbbreviation: text('tenant_abbreviation').references(
    () => tenants.abbreviation,
  ),
  parentGroupingElementId: uuid('parent_grouping_element_id').references(
    (): AnyPgColumn => groupingElements.id,
  ),
});

export type GroupingElement = typeof groupingElements.$inferSelect;
export type NewGroupingElement = typeof groupingElements.$inferInsert;
