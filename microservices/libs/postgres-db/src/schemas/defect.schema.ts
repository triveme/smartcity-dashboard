import { sql } from 'drizzle-orm';
import { json, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { visibilityEnum } from './dashboard.schema';

export const defects = pgTable('defect', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  location: json('location').notNull(),
  category: text('category').notNull(),
  imgPath: text('imgPath').notNull(),
  description: text('description'),
  mail: text('mail'),
  phone: text('phone'),
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

export type Defect = typeof defects.$inferSelect;
