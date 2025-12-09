import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { dataSources } from './data-source.schema';
import {
  aggregationEnum,
  aggregationPeriodEnum,
  timeframeEnum,
} from './enums.schema';
import { tenants } from './tenant.schema';

export const queryConfigs = pgTable('query_config', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  dataSourceId: uuid('data_source_id').references(() => dataSources.id),
  interval: smallint('interval').notNull(),
  fiwareService: text('fiware_service').notNull(),
  fiwareServicePath: text('fiware_service_path').notNull(),
  fiwareType: text('fiware_type').notNull(),
  entityIds: text('entity_ids').array(),
  attributes: text('attributes').array(),
  aggrMode: aggregationEnum('aggr_mode'),
  timeframe: timeframeEnum('timeframe'),
  aggrPeriod: aggregationPeriodEnum('aggr_period'),
  isReporting: boolean('is_reporting'),
  roundingMode: text('rounding_mode'),
  roundingTarget: smallint('rounding_target'),

  hash: text('hash'),
  tenantId: text('tenant_id').references(() => tenants.abbreviation),
  createdAt: timestamp('created_at', { mode: 'date', precision: 6 })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 6 })
    .notNull()
    .default(sql`now()`),
});

export const queryConfigsRelations = relations(queryConfigs, ({ one }) => ({
  datasource: one(dataSources, {
    fields: [queryConfigs.dataSourceId],
    references: [dataSources.id],
  }),
}));

export type QueryConfig = typeof queryConfigs.$inferSelect;
export type NewQueryConfig = typeof queryConfigs.$inferInsert;
