CREATE TABLE IF NOT EXISTS "corporate_info_sidebar_logos" (
	"corporate_info_id" uuid,
	"logo_id" uuid,
	"order" integer,
	CONSTRAINT corporate_info_sidebar_logos_corporate_info_id_logo_id PRIMARY KEY("corporate_info_id","logo_id")
);
--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "save_button_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "save_hover_button_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "cancel_button_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "cancel_hover_button_color" text;--> statement-breakpoint
ALTER TABLE "panel" ADD COLUMN IF NOT EXISTS "general_info" text;--> statement-breakpoint
ALTER TABLE "panel" ADD COLUMN IF NOT EXISTS "show_general_info" boolean;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "corporate_info_sidebar_logos" ADD CONSTRAINT "corporate_info_sidebar_logos_corporate_info_id_corporate_info_id_fk" FOREIGN KEY ("corporate_info_id") REFERENCES "corporate_info"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "corporate_info_sidebar_logos" ADD CONSTRAINT "corporate_info_sidebar_logos_logo_id_logo_id_fk" FOREIGN KEY ("logo_id") REFERENCES "logo"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
