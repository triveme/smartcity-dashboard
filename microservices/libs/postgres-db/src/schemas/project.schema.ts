import {
  boolean,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { tenants } from './tenant.schema';

export const projectCategory = pgTable('project_category', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull().unique(),
  created_at: timestamp('created_at', { mode: 'date', precision: 6 }),
});

export const project = pgTable('project', {
  id: uuid('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category_id: uuid('category_id')
    .notNull()
    .references(() => projectCategory.id)
    .notNull(),
  status: text('status').notNull(),
  cost: integer('cost'),
  district: text('district'),
  street_name: text('street_name'),
  location: json('location').notNull(),
  line_locations: json('line_locations'),
  contact_person: text('contact_person').notNull(),
  is_public: boolean('is_public').default(false),
  start_date: timestamp('start_date', { mode: 'date', precision: 6 }),
  end_date: timestamp('end_date', { mode: 'date', precision: 6 }),
  tenantAbbreviation: text('tenant_abbreviation').references(
    () => tenants.abbreviation,
  ),
});

export type Project = typeof project.$inferSelect;
export type ProjectWithCategory = typeof project.$inferInsert & {
  category?: string;
};
