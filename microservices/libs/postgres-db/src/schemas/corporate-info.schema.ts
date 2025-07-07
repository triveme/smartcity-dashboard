import { sql } from 'drizzle-orm';
import { pgTable, text, uuid, boolean } from 'drizzle-orm/pg-core';
import { logos } from './logo.schema';
import { tenants } from './tenant.schema';
import {
  corporateInfoFontFamiliesTypeEnum,
  menuArrowDirectionEnum,
} from './enums.schema';
import { titleBarThemeTypeEnum } from './enums.schema';

export const corporateInfos = pgTable('corporate_info', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  tenantId: text('tenant_id').references(() => tenants.abbreviation, {
    onUpdate: 'cascade',
  }),
  titleBar: titleBarThemeTypeEnum('title_bar').notNull(),
  barChartAxisLabelSize: text('bar_chart_axis_label_size').default('14'),
  barChartAxisLabelColor: text('bar_chart_axis_label_color').default(
    '#ffffffff',
  ),
  barChartAxisLabelFontColor: text('bar_chart_axis_label_font_color').default(
    '#FFFFFF',
  ),
  barChartAxisLineColor: text('bar_chart_axis_line_color').default('#ffffffff'),
  barChartAxisTicksFontSize: text('bar_chart_axis_ticks_font_size').default(
    '14',
  ),
  barChartCurrentValuesColors: text('bar_chart_current_values_colors')
    .array()
    .default([
      '#FFA500',
      '#FF4500',
      '#00FF00',
      '#6f3939ff',
      '#d61010ff',
      '#a28d8dff',
      '#618369ff',
      '#7e6969ff',
      '#3d2f2fff',
      '#ecddddff',
    ]),
  barChartFilterColor: text('bar_chart_filter_color').default('#F1B434'),
  barChartFilterTextColor: text('bar_chart_filter_text_color').default(
    '#1D2330',
  ),
  barChartGridColor: text('bar_chart_grid_color').default('#ffffffff'),
  barChartLegendFontSize: text('bar_chart_legend_font_size').default('14'),
  barChartLegendFontColor: text('bar_chart_legend_font_color').default(
    '#FFFFFF',
  ),
  barChartTicksFontColor: text('bar_chart_ticks_font_color').default(
    '#ffffffff',
  ),
  cancelButtonColor: text('cancel_button_color').default('#803535ff'),
  cancelHoverButtonColor: text('cancel_hover_button_color').default(
    '#ffffffff',
  ),
  coloredSliderArrowColor: text('colored_slider_arrow_color').default(
    '#ffffffff',
  ),
  coloredSliderBigValueFontColor: text(
    'colored_slider_big_value_font_color',
  ).default('#ffffffff'),
  coloredSliderBigValueFontSize: text(
    'colored_slider_big_value_font_size',
  ).default('25'),
  coloredSliderLabelFontColor: text('colored_slider_label_font_color').default(
    '#ffffffff',
  ),
  coloredSliderLabelFontSize: text('colored_slider_label_font_size').default(
    '15',
  ),
  coloredSliderUnitFontSize: text('colored_slider_unit_font_size').default(
    '15',
  ),
  dashboardFontColor: text('dashboard_font_color').default('#FFF'),
  dashboardPrimaryColor: text('dashboard_primary_color').default('#2D3244'),
  dashboardSecondaryColor: text('dashboard_secondary_color').default('#3D4760'),
  dashboardHeadlineFontSize: text('dashboard_headline_font_size').default(
    '24px',
  ),
  degreeChart180BgColor: text('degree_chart_180_bg_color').default('#190f50ff'),
  degreeChart180FillColor: text('degree_chart_180_fill_color').default(
    '#ffffffff',
  ),
  degreeChart180FontColor: text('degree_chart_180_font_color').default(
    '#ffffffff',
  ),
  degreeChart180FontSize: text('degree_chart_180_font_size').default('20'),
  degreeChart180UnitFontSize: text('degree_chart_180_unit_font_size').default(
    '15',
  ),
  degreeChart360BgColor: text('degree_chart_360_bg_color').default('#004cafff'),
  degreeChart360FillColor: text('degree_chart_360_fill_color').default(
    '#ffffffff',
  ),
  degreeChart360FontColor: text('degree_chart_360_font_color').default(
    '#ffffffff',
  ),
  degreeChart360FontSize: text('degree_chart_360_font_size').default('20'),
  degreeChart360UnitFontSize: text('degree_chart_360_unit_font_size').default(
    '15',
  ),
  fontColor: text('font_color').notNull().default('#FFF'),
  fontFamily: corporateInfoFontFamiliesTypeEnum('font_family')
    .notNull()
    .default('Arial'),
  headerFontColor: text('header_font_color').default('#FFF'),
  headerLogoId: uuid('header_logo_id').references(() => logos.id),
  headerPrimaryColor: text('header_primary_color').default('#3d4760'),
  headerSecondaryColor: text('header_secondary_color').default('#3d4760'),
  headerTitleAdmin: text('header_title_admin').default(
    'Smart Region Dashboard',
  ),
  headerTitleDashboards: text('header_title_dashboards').default('Dashboards'),
  iconWithLinkFontColor: text('icon_with_link_font_color').default('#ffffffff'),
  iconWithLinkFontSize: text('icon_with_link_font_size').default('20'),
  iconWithLinkIconColor: text('icon_with_link_icon_color').default('#ffffffff'),
  iconWithLinkIconSize: text('icon_with_link_icon_size').default('xl'),
  isPanelHeadlineBold: boolean('is_panel_headline_bold').default(false),
  isWidgetHeadlineBold: boolean('is_widget_headline_bold').default(false),
  informationTextFontColor: text('information_text_font_color').default(
    '#ffffffff',
  ),
  informationTextFontSize: text('information_text_font_size').default('20'),
  lineChartAxisLabelFontColor: text('line_chart_axis_label_font_color').default(
    '#ffffffff',
  ),
  lineChartAxisLabelSize: text('line_chart_axis_label_size').default('14'),
  lineChartAxisLineColor: text('line_chart_axis_line_color').default(
    '#ffffffff',
  ),
  lineChartAxisTicksFontSize: text('line_chart_axis_ticks_font_size').default(
    '14',
  ),
  lineChartCurrentValuesColors: text('line_chart_current_values_colors')
    .array()
    .default([
      '#4f94dbff',
      '#755b5bff',
      '#971b1bff',
      '#31586fff',
      '#4bc771ff',
      '#b9c58bff',
      '#2534afb2',
      '#b21dc2ff',
      '#b1a2a2ff',
      '#ce3388ff',
    ]),
  lineChartFilterColor: text('line_chart_filter_color').default('#F1B434'),
  lineChartFilterTextColor: text('line_chart_filter_text_color').default(
    '#1D2330',
  ),
  lineChartGridColor: text('line_chart_grid_color').default('#ffffffff'),
  lineChartLegendFontSize: text('line_chart_legend_font_size').default('14'),
  lineChartLegendFontColor: text('line_chart_legend_font_color').default(
    '#ffffffff',
  ),
  lineChartTicksFontColor: text('line_chart_ticks_font_color').default(
    '#ffffffff',
  ),
  logo: text('logo'),
  measurementChartAxisLabelFontColor: text(
    'measurement_chart_axis_label_font_color',
  ).default('#4f94dbff'),
  measurementChartAxisLineColor: text(
    'measurement_chart_axis_line_color',
  ).default('#755b5bff'),
  measurementChartAxisTicksFontColor: text(
    'measurement_chart_axis_ticks_font_color',
  ).default('#971b1bff'),
  measurementChartBarColor: text('measurement_chart_bar_color').default(
    '#31586fff',
  ),
  measurementChartBigValueFontColor: text(
    'measurement_chart_big_value_font_color',
  ).default('#4bc771ff'),
  measurementChartBigValueFontSize: text(
    'measurement_chart_big_value_font_size',
  ).default('60'),
  measurementChartCardsBgColor: text(
    'measurement_chart_cards_bg_color',
  ).default('#ffffff00'),
  measurementChartCardsFontColor: text(
    'measurement_chart_cards_font_color',
  ).default('#ffffffff'),
  measurementChartCardsIconColors: text('measurement_chart_cards_icon_colors')
    .array()
    .default(['#68aff0ff', '#dd4bc0ff', '#d88935ff', '#e71010ff']),
  measurementChartCurrentValuesColors: text(
    'measurement_chart_current_values_colors',
  )
    .array()
    .default(['#00c8ffff']),
  measurementChartGridColor: text('measurement_chart_grid_color').default(
    '#ffffffff',
  ),
  measurementChartLabelFontColor: text(
    'measurement_chart_label_font_color',
  ).default('#ffffff00'),
  measurementChartTopButtonBgColor: text(
    'measurement_chart_top_button_bg_color',
  ).default('#ffffffff'),
  measurementChartTopButtonFontColor: text(
    'measurement_chart_top_button_font_color',
  ).default('#ffffff00'),
  measurementChartTopButtonHoverColor: text(
    'measurement_chart_top_button_hover_color',
  ).default('#000152ff'),
  measurementChartTopButtonInactiveBgColor: text(
    'measurement_chart_top_button_inactive_bg_color',
  ).default('#ffffff00'),
  menuActiveColor: text('menu_active_color').default('#FFF'),
  menuActiveFontColor: text('menu_active_font_color').default('#1d2330'),
  menuArrowDirection: menuArrowDirectionEnum('menu_arrow_direction').default(
    'Oben | Unten',
  ),
  menuCornerColor: text('menu_corner_color').default('#1d2330'),
  menuCornerFontColor: text('menu_corner_font_color').default('#fff'),
  menuFontColor: text('menu_font_color').default('#fff'),
  menuHoverColor: text('menu_hover_color').default('#99a4c3ff'),
  menuHoverFontColor: text('menu_hover_font_color').default('#FFFFFF40'),
  menuLogoId: uuid('menu_logo_id').references(() => logos.id),
  menuPrimaryColor: text('menu_primary_color').default('#3D4760'),
  menuSecondaryColor: text('menu_secondary_color').default('#1d2330'),
  panelBorderColor: text('panel_border_color').default('#3D4760'),
  panelBorderRadius: text('panel_border_radius').default('4px'),
  panelBorderSize: text('panel_border_size').default('4px'),
  panelFontColor: text('panel_font_color').default('#FFF'),
  panelHeadlineFontSize: text('panel_headline_font_size').default('24px'),
  panelPrimaryColor: text('panel_primary_color').default('#3D4760'),
  panelSecondaryColor: text('panel_secondary_color').default('#3D4760'),
  pieChartFontColor: text('pie_chart_font_color').default('#ffffffff'),
  pieChartFontSize: text('pie_chart_font_size').default('20'),
  pieChartCurrentValuesColors: text('pie_chart_current_values_colors')
    .array()
    .default([
      '#4f94dbff',
      '#755b5bff',
      '#971b1bff',
      '#31586fff',
      '#4bc771ff',
      '#b9c58bff',
      '#2534afb2',
      '#b21dc2ff',
      '#b1a2a2ff',
      '#ce3388ff',
    ]),
  saveButtonColor: text('save_button_color').default('#f5c442'),
  saveHoverButtonColor: text('save_hover_button_color').default('#f7c543'),
  scrollbarBackground: text('scrollbar_background').default('#b9c2ee'),
  scrollbarColor: text('scrollbar_color').default('#3D4760'),
  showHeaderLogo: boolean('show_header_logo').default(true),
  showMenuLogo: boolean('show_menu_logo').default(true),
  showInfoButtonsOnMobile: boolean('show_info_buttons_on_mobile').default(
    false,
  ),
  sliderCurrentFontColor: text('slider_current_font_color').default('#000000'),
  sliderMaximumFontColor: text('slider_maximum_font_color').default('#FFFFFF'),
  sliderGeneralFontColor: text('slider_general_font_color').default('#FFFFFF'),
  sliderCurrentColor: text('slider_current_color').default('#DC2626'),
  sliderMaximumColor: text('slider_maximum_color').default('#000000'),
  stageableChartFontColor: text('stageable_chart_font_color').default(
    '#ffffffff',
  ),
  stageableChartFontSize: text('stageable_chart_font_size').default('20'),
  stageableChartTicksFontColor: text(
    'stageable_chart_ticks_font_color',
  ).default('#ffffffff'),
  stageableChartTicksFontSize: text('stageable_chart_ticks_font_size').default(
    '10',
  ),
  useColorTransitionHeader: boolean('use_color_transition_header').default(
    false,
  ),
  useColorTransitionMenu: boolean('use_color_transition_menu').default(false),
  weatherWarningBgColor: text('weather_warning_bg_color').default('#3D4760'),
  weatherWarningHeadlineColor: text('weather_warning_headline_color').default(
    '#E74C3C',
  ),
  weatherInstructionsColor: text('weather_warning_instructions_color').default(
    '#000000',
  ),
  weatherAlertDescriptionColor: text(
    'weather_warning_descriptions_color',
  ).default('#000000'),
  weatherDateColor: text('weather_warning_date_color').default('#FFFFFF'),
  weatherWarningButtonBackgroundColor: text(
    'weather_warning_button_background_color',
  ).default('#2C3E50'),
  weatherWarningButtonIconColor: text(
    'weather_warning_button_icon_color',
  ).default('#FFFFFF'),
  wertFontColor: text('wert_font_color').default('#ffffffff'),
  widgetHeadlineFontSize: text('widget_headline_font_size').default('20'),
  widgetSubheadlineFontSize: text('widget_subheadline_font_size').default(
    '16px',
  ),
  wertFontSize: text('wert_font_size').default('14px'),
  wertUnitFontSize: text('wert_unit_font_size').default('20'),
  widgetBorderColor: text('widget_border_color').default('#3D4760'),
  widgetBorderRadius: text('widget_border_radius').default('4px'),
  widgetBorderSize: text('widget_border_size').default('4px'),
  widgetFontColor: text('widget_font_color').default('#FFF'),
  widgetPrimaryColor: text('widget_primary_color').default('#3D4760'),
  widgetSecondaryColor: text('widget_secondary_color').default('#3D4760'),
});

export type CorporateInfo = typeof corporateInfos.$inferSelect;
export type NewCorporateInfo = typeof corporateInfos.$inferInsert;
