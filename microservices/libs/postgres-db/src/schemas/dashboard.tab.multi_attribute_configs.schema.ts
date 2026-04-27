import { sql } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { tabs } from './dashboard.tab.schema';

export const tabMultiAttributeConfigsTable = pgTable(
  'tab_multi_attribute_configs',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    tabId: uuid('tab_id').references(() => tabs.id, {
      onDelete: 'cascade',
    }),
    attribute: text('attribute'),
    errorColor: text('error_color'),
    defaultRange: text('default_range'), // e.g. "1-10"
    defaultColor: text('default_color'),
    warnRange: text('warn_range'), // e.g. "11-20" (optional)
    warnColor: text('warn_color'),
  },
);

export type TabMultiAttributeConfig =
  typeof tabMultiAttributeConfigsTable.$inferSelect;
export type NewTabMultiAttributeConfig =
  typeof tabMultiAttributeConfigsTable.$inferInsert;
