import { sql } from 'drizzle-orm';
import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { authDataTypeEnum } from './enums.schema';
import { visibilityEnum } from './dashboard.schema';
import { tenants } from './tenant.schema';

export const authData = pgTable('auth_data', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tenantAbbreviation: text('tenant_abbreviation').references(
    () => tenants.abbreviation,
  ),
  name: text('name').notNull(),
  type: authDataTypeEnum('type').notNull().default('api'),
  clientId: text('client_id').notNull(),
  clientSecret: jsonb('client_secret').notNull(),
  appUser: text('app_user'),
  appUserPassword: jsonb('app_user_password'),
  apiToken: text('api_token'),
  authUrl: text('auth_url').notNull(),
  liveUrl: text('live_url').notNull(),
  timeSeriesUrl: text('time_series_url').notNull(),
  apiUrl: text('api_url'),
  createdAt: timestamp('created_at', { mode: 'date', precision: 6 })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 6 })
    .notNull()
    .default(sql`now()`),
  readRoles: text('read_roles').array(),
  writeRoles: text('write_roles').array(),
  visibility: visibilityEnum('visibility'),
});

export type AuthData = typeof authData.$inferSelect;
export type NewAuthData = typeof authData.$inferInsert;
