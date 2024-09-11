import { sql } from 'drizzle-orm';
import { pgTable, text, uuid, boolean } from 'drizzle-orm/pg-core';
import { logos } from './logo.schema';
import { tenants } from './tenant.schema';
import { corporateInfoFontFamiliesTypeEnum } from './enums.schema';
import { titleBarThemeTypeEnum } from './enums.schema';

export const corporateInfos = pgTable('corporate_info', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tenantId: text('tenant_id').references(() => tenants.abbreviation, {
    onUpdate: 'cascade',
  }),
  dashboardFontColor: text('dashboard_font_color'),
  dashboardPrimaryColor: text('dashboard_primary_color'),
  dashboardSecondaryColor: text('dashboard_secondary_color'),
  fontFamily: corporateInfoFontFamiliesTypeEnum('font_family').notNull(),
  fontColor: text('font_color').notNull(),
  headerFontColor: text('header_font_color'),
  headerLogoId: uuid('header_logo_id').references(() => logos.id),
  headerPrimaryColor: text('header_primary_color'),
  headerSecondaryColor: text('header_secondary_color'),
  headerTitleAdmin: text('header_title_admin'),
  headerTitleDashboards: text('header_title_dashboards'),
  logo: text('logo'),
  menuActiveColor: text('menu_active_color'),
  menuActiveFontColor: text('menu_active_font_color'),
  menuFontColor: text('menu_font_color'),
  menuHoverColor: text('menu_hover_color'),
  menuLogoId: uuid('menu_logo_id').references(() => logos.id),
  menuPrimaryColor: text('menu_primary_color'),
  menuSecondaryColor: text('menu_secondary_color'),
  panelBorderColor: text('panel_border_color'),
  panelBorderRadius: text('panel_border_radius'),
  panelBorderSize: text('panel_border_size'),
  panelFontColor: text('panel_font_color'),
  panelPrimaryColor: text('panel_primary_color'),
  panelSecondaryColor: text('panel_secondary_color'),
  scrollbarBackground: text('scrollbar_background'),
  scrollbarColor: text('scrollbar_color'),
  saveButtonColor: text('save_button_color'),
  saveHoverButtonColor: text('save_hover_button_color'),
  cancelButtonColor: text('cancel_button_color'),
  cancelHoverButtonColor: text('cancel_hover_button_color'),
  showHeaderLogo: boolean('show_header_logo'),
  showMenuLogo: boolean('show_menu_logo'),
  titleBar: titleBarThemeTypeEnum('title_bar').notNull(),
  useColorTransitionHeader: boolean('use_color_transition_header'),
  useColorTransitionMenu: boolean('use_color_transition_menu'),
  widgetBorderColor: text('widget_border_color'),
  widgetBorderRadius: text('widget_border_radius'),
  widgetBorderSize: text('widget_border_size'),
  widgetFontColor: text('widget_font_color'),
  widgetPrimaryColor: text('widget_primary_color'),
  widgetSecondaryColor: text('widget_secondary_color'),
});

export type CorporateInfo = typeof corporateInfos.$inferSelect;
export type NewCorporateInfo = typeof corporateInfos.$inferInsert;
