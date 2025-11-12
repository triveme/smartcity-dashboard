ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Bar Chart - Horizontal';--> statement-breakpoint
ALTER TYPE "tab_component_type" ADD VALUE IF NOT EXISTS 'Sensorstatus';--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_hover_single_value" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_dynamic_show_only_hover" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_dynamic_noselection_displayall" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson_sensorcolors_nodatacolor" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_units_texts" text[];--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "set_sort_ascending" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "set_sort_descending" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "set_value_limit" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "user_defined_limit" real;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "sensor_status_light_count" smallint;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "sensor_status_min_threshold" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "sensor_status_max_threshold" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "sensor_status_default_color" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "sensor_status_color1" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "sensor_status_color2" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "sensor_status_color3" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "sensor_status_layout_vertical" boolean;