import { sql } from 'drizzle-orm';
import { boolean, pgTable, text, uuid, jsonb } from 'drizzle-orm/pg-core';
import { tenants } from './tenant.schema';

export const generalSettings = pgTable('general_settings', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tenant: text('tenant').references(() => tenants.abbreviation),
  information: text('information'),
  imprint: text('imprint'),
  privacy: text('privacy'),
  allowThemeSwitching: boolean('allow_theme_switching').default(false),
  disclaimer: text('disclaimer'),
  cookiebotId: text('cookiebot_id'),
  matomoSiteId: text('matomo_site_id'),
  matomoUrl: text('matomo_url'),
  linkWithIconValues: jsonb('link_with_icon_values'),
});

export type GeneralSettings = typeof generalSettings.$inferSelect;
export type NewGeneralSettings = typeof generalSettings.$inferInsert;
