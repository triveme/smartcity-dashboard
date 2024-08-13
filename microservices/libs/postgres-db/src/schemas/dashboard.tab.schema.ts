import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  real,
  boolean,
  smallint,
  json,
} from 'drizzle-orm/pg-core';
import { queries } from './query.schema';
import { widgets } from './dashboard.widget.schema';
import { dataModels } from './data-model.schema';
import { tabComponentSubTypeEnum, tabComponentTypeEnum } from './enums.schema';

export const tabs = pgTable('tab', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  chartLabels: text('chart_labels').array(),
  chartMaximum: real('chart_maximum'),
  chartMinimum: real('chart_minimum'),
  chartStaticValues: real('chart_static_values').array(),
  chartStaticValuesColors: text('chart_static_values_colors').array(),
  chartStaticValuesTicks: real('chart_static_values_ticks').array(),
  chartStaticValuesLogos: text('chart_static_values_logos').array(),
  chartStaticValuesTexts: text('chart_static_values_texts').array(),
  chartUnit: text('chart_unit'),
  chartValues: real('chart_values').array(),
  chartXAxisLabel: text('chart_x_axis_label'),
  chartYAxisLabel: text('chart_y_axis_label'),
  componentSubType: tabComponentSubTypeEnum('component_sub_type'),
  componentType: tabComponentTypeEnum('component_type'),
  dataModelId: uuid('data_model_id').references(() => dataModels.id),
  decimalPlaces: smallint('decimal_places'),
  icon: text('icon'),
  iconColor: text('icon_color'),
  iconText: text('icon_text'),
  iconUrl: text('icon_url'),
  labelColor: text('label_color'),
  iFrameUrl: text('iframe_url'),
  imageSrc: text('image_src'),
  imageUpdateInterval: smallint('image_update_interval'),
  imageUrl: text('image_url'),
  isStepline: boolean('is_stepline'),
  mapActiveMarkerColor: text('map_active_marker_color'),
  mapAllowPopups: boolean('map_allow_popups'),
  mapAllowScroll: boolean('map_allow_scroll'),
  mapAllowZoom: boolean('map_allow_zoom'),
  mapAllowFilter: boolean('map_allow_filter'),
  mapFilterAttribute: text('map_filter_attribute'),
  mapAllowLegend: boolean('map_allow_legend'),
  mapLegendValues: json('map_legend_values'),
  mapLegendDisclaimer: text('map_legend_disclaimer'),
  mapDisplayMode: text('map_display_mode'),
  mapLatitude: real('map_latitude'),
  mapLongitude: real('map_longtitude'),
  mapMarkerColor: text('map_marker_color'),
  mapMarkerIcon: text('map_marker_icon'),
  mapMarkerIconColor: text('map_marker_icon_color'),
  mapMaxZoom: smallint('map_max_zoom'),
  mapMinZoom: smallint('map_min_zoom'),
  mapShapeColor: text('map_shape_color'),
  mapShapeOption: text('map_shape_option'),
  mapStandardZoom: smallint('map_standard_zoom'),
  mapWidgetValues: json('map_widget_values'),
  queryId: uuid('query_id').references(() => queries.id),
  showLegend: boolean('show_legend'),
  textValue: text('text_value'),
  widgetId: uuid('widget_id').references(() => widgets.id),
});

export const tabsRelations = relations(tabs, ({ one }) => ({
  widget: one(widgets, {
    fields: [tabs.widgetId],
    references: [widgets.id],
  }),
  query: one(queries, {
    fields: [tabs.queryId],
    references: [queries.id],
  }),
  dataModel: one(dataModels, {
    fields: [tabs.dataModelId],
    references: [dataModels.id],
  }),
}));

export type Tab = typeof tabs.$inferSelect;
export type NewTab = typeof tabs.$inferInsert;
