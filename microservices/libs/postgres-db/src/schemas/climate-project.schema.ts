import { sql } from 'drizzle-orm';
import {
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { timeHorizonTypeEnum } from './enums.schema';
import { visibilityEnum } from './dashboard.schema';

export const climateProjects = pgTable('climate_project', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text('title').notNull(),
  link: text('link').notNull(),
  costsInCents: integer('costs_in_cents').notNull(),
  location: json('location').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  imgPath: text('img_path'),
  startAt: timestamp('start_at', { mode: 'date', precision: 6 }).default(
    sql`now()`,
  ),
  endAt: timestamp('end_at', { mode: 'date', precision: 6 }).default(
    sql`now()`,
  ),
  locationText: text('locationText').notNull(),
  timeHorizon: timeHorizonTypeEnum('timeHorizon').notNull(),
  responsible: text('responsible').notNull(),
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

export type ClimateProject = typeof climateProjects.$inferSelect;
