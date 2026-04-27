CREATE TABLE IF NOT EXISTS "tab_multi_attribute_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tab_id" uuid,
	"attribute" text,
	"error_color" text,
	"default_range" text,
	"default_color" text,
	"warn_range" text,
	"warn_color" text
);
--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_show_percent" boolean DEFAULT TRUE;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "is_table_header_visible" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "pin_mode" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tab_multi_attribute_configs" ADD CONSTRAINT "tab_multi_attribute_configs_tab_id_tab_id_fk" FOREIGN KEY ("tab_id") REFERENCES "tab"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
