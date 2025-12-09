import { sql } from 'drizzle-orm';
import { pgTable, real, text, uuid } from 'drizzle-orm/pg-core';
import { tabs } from './dashboard.tab.schema';

export const customMapSensorDataTable = pgTable('custom_map_sensor_data', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tabId: uuid('tab_id').references(() => tabs.id, {
    onDelete: 'cascade',
  }),
  entityId: text('entity_id'),
  attribute: text('attribute_id'),
  positionX: real('position_x'),
  positionY: real('position_y'),
});

export const CustomMapSensorData = typeof customMapSensorDataTable.$inferSelect;
export const NewCustomMapSensorData =
  typeof customMapSensorDataTable.$inferInsert;
