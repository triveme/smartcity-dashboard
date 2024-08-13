import { sql } from 'drizzle-orm';
import { pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { jsonb } from 'drizzle-orm/pg-core';

export const systemUsers = pgTable('system_user', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tenantAbbreviation: text('tenant_abbreviation').notNull().unique(),
  username: text('username').notNull(),
  password: jsonb('password').notNull(),
});

export type SystemUser = typeof systemUsers.$inferSelect;
export type NewSystemUser = typeof systemUsers.$inferInsert;
