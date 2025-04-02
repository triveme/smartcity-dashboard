DO $$ BEGIN
 CREATE TYPE "chart_date_representation" AS ENUM('Default', 'Only Year', 'Only Month');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_date_representation" "chart_date_representation";--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_has_automatic_zoom" boolean;
