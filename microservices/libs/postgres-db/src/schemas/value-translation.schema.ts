import { sql } from 'drizzle-orm';
import { pgTable, text, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { tenants } from './tenant.schema';

// 3. Datenmodell — eine Tabelle value_translations (category, rawValue, label, nullable tenantId)

export const valueTranslation = pgTable(
  'value-translation',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    category: text('category'),
    rawValue: text('raw_value'),
    label: text('text'),
    tenantId: text('tenant_id').references(() => tenants.abbreviation, {
      onUpdate: 'cascade',
    }),
  },
  (table) => ({
    rawValueTenantUniqueIndex: uniqueIndex(
      'value_translation_raw_value_tenant_unique',
    ).on(table.rawValue, table.tenantId),
  }),
);

export type ValueTranslation = typeof valueTranslation.$inferSelect;
export type NewValueTranslation = typeof valueTranslation.$inferInsert;
