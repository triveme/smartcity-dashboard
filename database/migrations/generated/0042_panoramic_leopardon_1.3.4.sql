ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "allow_map_popup_width_change" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_popup_width" smallint;--> statement-breakpoint
ALTER TABLE "general_settings" ADD COLUMN IF NOT EXISTS "link_with_icon_values" jsonb;