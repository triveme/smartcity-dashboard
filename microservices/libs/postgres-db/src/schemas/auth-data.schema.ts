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
  apiToken: text('api_token'),
  apiUrl: text('api_url'),
  appUser: text('app_user'),
  appUserPassword: jsonb('app_user_password'),
  authUrl: text('auth_url').notNull(),
  clientId: text('client_id').notNull(),
  clientSecret: jsonb('client_secret').notNull(),
  collections: text('collections').array(),
  fiwareServices: text('fiware_services').array(),
  grantType: text('grant_type'),
  liveUrl: text('live_url').notNull(),
  name: text('name').notNull(),
  ngsildTenant: text('ngsild_tenant'),
  ngsildContextUrl: text('ngsild_context_url'),
  timeSeriesUrl: text('time_series_url').notNull(),
  type: authDataTypeEnum('type').notNull().default('api'),
  visibility: visibilityEnum('visibility'),
  createdAt: timestamp('created_at', { mode: 'date', precision: 6 })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { mode: 'date', precision: 6 })
    .notNull()
    .default(sql`now()`),
  readRoles: text('read_roles').array(),
  writeRoles: text('write_roles').array(),
});

export type AuthData = typeof authData.$inferSelect;
export type NewAuthData = typeof authData.$inferInsert;
