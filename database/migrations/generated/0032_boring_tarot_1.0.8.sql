ALTER TYPE "auth_data_type" ADD VALUE IF NOT EXISTS 'internal';--> statement-breakpoint
ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Pie Chart (dynamisch)';--> statement-breakpoint
ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'GeoJSON';--> statement-breakpoint
ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'GeoJSON (dynamisch)';--> statement-breakpoint
ALTER TYPE "tab_component_type" ADD VALUE IF NOT EXISTS 'Listview';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "internal_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection" text NOT NULL,
	"type" text NOT NULL,
	"data" text NOT NULL,
	"source" text NOT NULL,
	"firstDataColIndex" smallint DEFAULT 0,
	"firstDataRowIndex" smallint DEFAULT 1,
	"timeGroupRowCount" smallint DEFAULT 1,
	"tenant_abbreviation" text,
	CONSTRAINT "internal_data_source_unique" UNIQUE("source")
);
--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_background_color" text DEFAULT '#2D3244';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_item_background_color" text DEFAULT '#3D4760';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_item_border_color" text DEFAULT '#4B5563';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_item_border_radius" text DEFAULT '8px';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_item_border_size" text DEFAULT '1px';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_title_font_color" text DEFAULT '#FCD34D';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_title_font_size" text DEFAULT '18px';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_title_font_weight" text DEFAULT 'bold';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_description_font_color" text DEFAULT '#D1D5DB';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_description_font_size" text DEFAULT '14px';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_counter_font_color" text DEFAULT '#9CA3AF';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_counter_font_size" text DEFAULT '14px';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_filter_button_background_color" text DEFAULT '#4B5563';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_filter_button_border_color" text DEFAULT '#6B7280';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_filter_button_font_color" text DEFAULT '#E5E7EB';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_filter_button_hover_background_color" text DEFAULT '#5B6478';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_arrow_icon_color" text DEFAULT '#E5E7EB';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_back_button_background_color" text DEFAULT '#6B7280';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_back_button_hover_background_color" text DEFAULT '#4B5563';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_back_button_font_color" text DEFAULT '#FFFFFF';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_map_button_background_color" text DEFAULT '#3B82F6';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_map_button_hover_background_color" text DEFAULT '#2563EB';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "listview_map_button_font_color" text DEFAULT '#FFFFFF';--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson" json;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson_sensorcolors" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson_bordercolor" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson_fillcolor" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson_fillopacity" real;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson_selection_bordercolor" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson_selection_fillcolor" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson_selection_fillopacity" real;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson_hover_bordercolor" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson_hover_fillcolor" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson_hover_fillopacity" real;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_name" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_is_filtering_allowed" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_filter_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_show_address" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_address_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_show_contact" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_contact_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_show_image" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_image_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_show_category" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_category_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_show_name" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_name_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_show_contact_name" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_contact_name_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_show_contact_phone" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_contact_phone_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_show_participants" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_participants_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_show_supporter" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_supporter_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_show_email" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_email_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_show_website" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_website_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_show_description" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "listview_description_attribute" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "internal_data" ADD CONSTRAINT "internal_data_tenant_abbreviation_tenant_abbreviation_fk" FOREIGN KEY ("tenant_abbreviation") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
