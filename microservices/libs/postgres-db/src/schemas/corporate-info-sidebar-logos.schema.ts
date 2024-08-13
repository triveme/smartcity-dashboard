import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, integer, uuid } from 'drizzle-orm/pg-core';
import { corporateInfos } from './corporate-info.schema';
import { logos } from './logo.schema';

export const corporateInfoSidebarLogos = pgTable(
  'corporate_info_sidebar_logos',
  {
    corporateInfoId: uuid('corporate_info_id').references(
      () => corporateInfos.id,
    ),
    logoId: uuid('logo_id').references(() => logos.id),
    order: integer('order'),
  },
  (t) => ({
    pk: primaryKey(t.corporateInfoId, t.logoId),
  }),
);

export const corporateInfoSidebarLogosRelations = relations(
  corporateInfoSidebarLogos,
  ({ one }) => ({
    corporateInfo: one(corporateInfos, {
      fields: [corporateInfoSidebarLogos.corporateInfoId],
      references: [corporateInfos.id],
    }),
    logo: one(logos, {
      fields: [corporateInfoSidebarLogos.logoId],
      references: [logos.id],
    }),
  }),
);

export type CorporateInfoSidebarLogo =
  typeof corporateInfoSidebarLogos.$inferSelect;
export type NewCorporateInfoSidebarLogo =
  typeof corporateInfoSidebarLogos.$inferInsert;
