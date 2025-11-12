ALTER TYPE "chart_date_representation" ADD VALUE IF NOT EXISTS 'Only Labels';--> statement-breakpoint
ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Linien Chart (dynamisch)';--> statement-breakpoint
ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Balken Chart (dynamisch)';--> statement-breakpoint
ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Table';--> statement-breakpoint
ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Table (dynamisch)';--> statement-breakpoint
ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Chart Datum Selektor';--> statement-breakpoint
ALTER TYPE "tab_component_type" ADD VALUE IF NOT EXISTS 'Interaktive Komponente';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "table_font_color" text DEFAULT '#000000';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "table_header_color" text DEFAULT '#005b9e';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "table_even_row_color" text DEFAULT '#FFFFFF';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "table_odd_row_color" text DEFAULT '#2D3244';--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "dynamic_highlight_color" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "dynamic_unhighlight_color" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_geojson_feature_identifier" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "table_font_color" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "table_header_color" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "table_odd_row_color" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "table_even_row_color" text;