import { relations, sql } from 'drizzle-orm';
import { pgTable, text, uuid, json, timestamp } from 'drizzle-orm/pg-core';
import { queryConfigs } from './query-config.schema';

export const queries = pgTable('query', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  queryConfigId: uuid('query_config_id').references(() => queryConfigs.id),
  queryData: json('query_data'),
  reportData: json('report_data'),
  updateMessage: text('update_message').array(),
  createdAt: timestamp('created_at', { mode: 'date', precision: 6 }).default(
    sql`now()`,
  ),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 6 }).default(
    sql`now()`,
  ),
});

export const queriesRelations = relations(queries, ({ one }) => ({
  queryConfig: one(queryConfigs, {
    fields: [queries.queryConfigId],
    references: [queryConfigs.id],
  }),
}));

export type Query = typeof queries.$inferSelect;
export type NewQuery = typeof queries.$inferInsert;
