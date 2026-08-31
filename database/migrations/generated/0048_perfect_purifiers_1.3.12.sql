ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_value_color_mode" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_date_color_rules" json;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_value_color_default_color" text;--> statement-breakpoint
ALTER TABLE "query_config" ADD COLUMN IF NOT EXISTS "is_black_list" boolean;
--> statement-breakpoint
UPDATE "tab"
SET "map_value_color_mode" = CASE
  WHEN "chart_static_values_text" IS TRUE THEN 'text'
  ELSE 'numeric'
END
WHERE "component_type" = 'Karte'
  AND "map_value_color_mode" IS NULL;
