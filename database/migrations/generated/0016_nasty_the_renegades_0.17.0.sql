DO $$ BEGIN
 CREATE TYPE "menu_arrow_direction_enum" AS ENUM('Oben | Oben', 'Oben | Unten', 'Links | Links', 'Links | Rechts', 'Unten | Unten', 'Unten | Oben', 'Rechts | Rechts', 'Rechts | Links');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "is_panel_headline_bold" boolean;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "is_widget_headline_bold" boolean;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "menu_arrow_direction" "menu_arrow_direction_enum";--> statement-breakpoint
ALTER TABLE "panel" ADD COLUMN IF NOT EXISTS "open_jumpoff_link_in_new_tab" boolean;
