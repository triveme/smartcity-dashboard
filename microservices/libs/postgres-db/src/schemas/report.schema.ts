import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { integer, json } from 'drizzle-orm/pg-core';
import { visibilityEnum } from './dashboard.schema';

export const reports = pgTable('report', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  link: text('link').notNull(),
  costsInCents: integer('costs_in_cents').notNull(),
  location: json('location').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  imgPath: text('img_path').notNull(),
  startAt: timestamp('start_at', { mode: 'date', precision: 6 }).default(
    sql`now()`,
  ),
  endAt: timestamp('end_at', { mode: 'date', precision: 6 }).default(
    sql`now()`,
  ),
  contactPerson: text('contactPerson').notNull(),
  county: text('county').notNull(),
  comment: text('comment').notNull(),
  adminComment: text('adminComment').notNull(),
  lastModifiedBy: text('lastModifiedBy').notNull(),
  redirection: text('redirection').notNull(),
  address: text('address').notNull(),
  referenceNumber: text('referenceNumber').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  visibility: visibilityEnum('visibility'),
  readRoles: text('read_roles').array(),
  writeRoles: text('write_roles').array(),
  createdAt: timestamp('created_at', { mode: 'date', precision: 6 }).default(
    sql`now()`,
  ),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 6 }).default(
    sql`now()`,
  ),
});

export type Report = typeof reports.$inferSelect;
