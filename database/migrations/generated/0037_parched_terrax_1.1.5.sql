ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Eigene Karte';--> statement-breakpoint
ALTER TYPE "tab_component_type" ADD VALUE IF NOT EXISTS 'Ampelstatus';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "custom_map_sensor_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tab_id" uuid,
	"entity_id" text,
	"attribute_id" text,
	"position_x" real,
	"position_y" real
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tab_custom_map_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"image_base64" text,
	"image_name" text,
	"image_widgth" real,
	"image_height" real
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tab_values_to_image" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tab_id" uuid,
	"image_id" uuid,
	"min" text,
	"max" text
);
--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "css_style_injection_value" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "widget_preview_background_color" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_aggregation_mode" "aggregation";--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "value_font_size" smallint;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "value_unit_font_size" smallint;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_search" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "custom_map_image_id" uuid;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "bar_chart_show_timestamp_on_hover" boolean;--> statement-breakpoint
ALTER TABLE "query_config" ADD COLUMN IF NOT EXISTS "rounding_mode" text;--> statement-breakpoint
ALTER TABLE "query_config" ADD COLUMN IF NOT EXISTS "rounding_target" smallint;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tab" ADD CONSTRAINT "tab_custom_map_image_id_tab_custom_map_images_id_fk" FOREIGN KEY ("custom_map_image_id") REFERENCES "tab_custom_map_images"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "tab" DROP COLUMN IF EXISTS "values_to_images";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "custom_map_sensor_data" ADD CONSTRAINT "custom_map_sensor_data_tab_id_tab_id_fk" FOREIGN KEY ("tab_id") REFERENCES "tab"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tab_custom_map_images" ADD CONSTRAINT "tab_custom_map_images_tenant_id_tenant_abbreviation_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tab_values_to_image" ADD CONSTRAINT "tab_values_to_image_tab_id_tab_id_fk" FOREIGN KEY ("tab_id") REFERENCES "tab"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tab_values_to_image" ADD CONSTRAINT "tab_values_to_image_image_id_tab_images_id_fk" FOREIGN KEY ("image_id") REFERENCES "tab_images"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
