import { sql } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { authData } from './auth-data.schema';

export const dataSources = pgTable('data_source', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  authDataId: uuid('auth_data_id').references(() => authData.id),
  name: text('name').notNull(),
  origin: text('origin').notNull(),
});

export type DataSource = typeof dataSources.$inferSelect;
export type NewDataSource = typeof dataSources.$inferInsert;
