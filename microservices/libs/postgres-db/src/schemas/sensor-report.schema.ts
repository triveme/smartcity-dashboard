import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { reportThresholdTriggerTypeEnum } from './enums.schema';
import { queries } from './query.schema';

export const sensorReports = pgTable('sensor_report', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  queryId: uuid('query_id').references(() => queries.id),
  propertyName: text('property_name').notNull(),
  threshold: text('threshold').notNull(),
  trigger: reportThresholdTriggerTypeEnum('trigger'),
  recipients: text('recipients').array(),
  mailText: text('mail_text'),
  createdAt: timestamp('created_at', { mode: 'date', precision: 6 }).default(
    sql`now()`,
  ),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 6 }).default(
    sql`now()`,
  ),
});

export type SensorReport = typeof sensorReports.$inferSelect;
