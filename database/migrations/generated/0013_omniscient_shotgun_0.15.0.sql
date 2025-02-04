DO $$ BEGIN
 CREATE TYPE "chart_legend_placement" AS ENUM('Left', 'Right', 'Top');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "auth_data_type" ADD VALUE IF NOT EXISTS 'static-endpoint';--> statement-breakpoint
ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Kombinierte Karte';--> statement-breakpoint
ALTER TYPE "timeframe" ADD VALUE IF NOT EXISTS 'quarter';--> statement-breakpoint
ALTER TYPE "timeframe" ADD VALUE IF NOT EXISTS 'year';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "bar_chart_axis_label_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "bar_chart_axis_label_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "bar_chart_axis_label_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "bar_chart_axis_line_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "bar_chart_axis_ticks_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "bar_chart_current_values_colors" text[];--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "bar_chart_filter_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "bar_chart_filter_text_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "bar_chart_grid_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "bar_chart_legend_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "bar_chart_legend_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "bar_chart_ticks_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "colored_slider_arrow_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "colored_slider_big_value_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "colored_slider_big_value_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "colored_slider_label_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "colored_slider_label_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "colored_slider_unit_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "dashboard_headline_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "degree_chart_180_bg_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "degree_chart_180_fill_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "degree_chart_180_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "degree_chart_180_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "degree_chart_180_unit_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "degree_chart_360_bg_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "degree_chart_360_fill_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "degree_chart_360_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "degree_chart_360_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "degree_chart_360_unit_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "icon_with_link_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "icon_with_link_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "icon_with_link_icon_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "icon_with_link_icon_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "information_text_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "information_text_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "line_chart_axis_label_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "line_chart_axis_label_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "line_chart_axis_line_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "line_chart_axis_ticks_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "line_chart_current_values_colors" text[];--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "line_chart_filter_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "line_chart_filter_text_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "line_chart_grid_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "line_chart_legend_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "line_chart_legend_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "line_chart_ticks_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_axis_label_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_axis_line_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_axis_ticks_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_bar_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_big_value_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_big_value_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_cards_bg_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_cards_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_cards_icon_colors" text[];--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_current_values_colors" text[];--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_grid_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_label_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_top_button_bg_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_top_button_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_top_button_hover_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "measurement_chart_top_button_inactive_bg_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "panel_headline_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "pie_chart_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "pie_chart_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "pie_chart_current_values_colors" text[];--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "stageable_chart_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "stageable_chart_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "stageable_chart_ticks_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "stageable_chart_ticks_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "wert_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "widget_headline_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "widget_subheadline_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "wert_font_size" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "wert_unit_font_size" text;--> statement-breakpoint
ALTER TABLE "panel" ADD COLUMN IF NOT EXISTS "icon" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_has_additional_selection" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_legend_align" "chart_legend_placement";--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_attribute_for_value_based" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_form_size_factor" smallint;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_is_form_color_value_based" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_is_icon_color_value_based" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "range_static_values_min" real[];--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "range_static_values_max" real[];--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "range_static_values_colors" text[];--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "range_static_values_logos" text[];--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "range_static_values_labels" text[];--> statement-breakpoint
ALTER TABLE "widget" ADD COLUMN IF NOT EXISTS "description" text;--> statement-breakpoint
ALTER TABLE "widget" ADD COLUMN IF NOT EXISTS "subheadline" text;
