ALTER TYPE "tab_component_type" ADD VALUE IF NOT EXISTS 'Apotheke';--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "pharmacy_zip_code" integer;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "pharmacy_username" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "pharmacy_password" jsonb;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "pharmacy_details" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "pharmacy_last_update" text;--> statement-breakpoint
ALTER TABLE "widget" ADD COLUMN IF NOT EXISTS "uses_query_parameter" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "general_settings" ADD COLUMN IF NOT EXISTS "cookiebot_id" text;
ALTER TABLE "general_settings" ADD COLUMN IF NOT EXISTS "matomo_site_id" text;--> statement-breakpoint
ALTER TABLE "general_settings" ADD COLUMN IF NOT EXISTS "matomo_url" text;