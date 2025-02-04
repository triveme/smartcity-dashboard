CREATE TABLE IF NOT EXISTS "general_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant" text,
	"information" text,
	"imprint" text,
	"privacy" text
);
--> statement-breakpoint
ALTER TABLE "dashboard" ADD COLUMN IF NOT EXISTS "allow_data_export" boolean;--> statement-breakpoint
ALTER TABLE "widget" ADD COLUMN IF NOT EXISTS "allow_data_export" boolean;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "general_settings" ADD CONSTRAINT "general_settings_tenant_tenant_abbreviation_fk" FOREIGN KEY ("tenant") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
