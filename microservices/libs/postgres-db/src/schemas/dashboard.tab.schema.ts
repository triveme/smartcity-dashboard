import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  real,
  boolean,
  smallint,
  json,
  jsonb,
} from 'drizzle-orm/pg-core';
import { queries } from './query.schema';
import { widgets } from './dashboard.widget.schema';
import { dataModels } from './data-model.schema';
import {
  chartLegendPlacement,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
} from './enums.schema';

export const tabs = pgTable('tab', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  chartHasAdditionalSelection: boolean('chart_has_additional_selection'),
  chartLabels: text('chart_labels').array(),
  chartLegendAlign: chartLegendPlacement('chart_legend_align'),
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
  childWidgets: jsonb('child_widgets'),
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
  mapAllowFilter: boolean('map_allow_filter'),
  mapAllowLegend: boolean('map_allow_legend'),
  mapAllowPopups: boolean('map_allow_popups'),
  mapAllowScroll: boolean('map_allow_scroll'),
  mapAllowZoom: boolean('map_allow_zoom'),
  mapAttributeForValueBased: text('map_attribute_for_value_based'),
  mapFormSizeFactor: smallint('map_form_size_factor'),
  mapDisplayMode: text('map_display_mode'),
  mapFilterAttribute: text('map_filter_attribute'),
  mapIsFormColorValueBased: boolean('map_is_form_color_value_based'),
  mapIsIconColorValueBased: boolean('map_is_icon_color_value_based'),
  mapLatitude: real('map_latitude'),
  mapLegendDisclaimer: text('map_legend_disclaimer'),
  mapLegendValues: json('map_legend_values'),
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
  mapWmsUrl: text('map_wms_url'),
  mapWmsLayer: text('map_wms_layer'),
  queryId: uuid('query_id').references(() => queries.id),
  rangeStaticValuesMin: real('range_static_values_min').array(),
  rangeStaticValuesMax: real('range_static_values_max').array(),
  rangeStaticValuesColors: text('range_static_values_colors').array(),
  rangeStaticValuesLogos: text('range_static_values_logos').array(),
  rangeStaticValuesLabels: text('range_static_values_labels').array(),
  showLegend: boolean('show_legend'),
  sliderCurrentAttribute: text('slider_current_attribute'),
  sliderMaximumAttribute: text('slider_maximum_attribute'),
  textValue: text('text_value'),
  widgetId: uuid('widget_id').references(() => widgets.id),
  tiles: real('tiles'),
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
