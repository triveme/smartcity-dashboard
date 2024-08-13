import { sql } from 'drizzle-orm';
import { json, pgTable, uuid } from 'drizzle-orm/pg-core';

export const dataModels = pgTable('data_model', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  model: json('model'),
});

export type DataModel = typeof dataModels.$inferSelect;
export type NewDataModel = typeof dataModels.$inferInsert;
