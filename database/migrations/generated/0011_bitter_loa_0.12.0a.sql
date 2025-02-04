ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Slider Übersicht';--> statement-breakpoint
ALTER TYPE "tab_component_type" ADD VALUE IF NOT EXISTS 'Kombinierte Komponente';--> statement-breakpoint
-- ALTER TABLE "grouping_element" RENAME COLUMN "color" TO "background_color";--> statement-breakpoint
ALTER TABLE "grouping_element" DROP COLUMN IF EXISTS "color";--> statement-breakpoint
ALTER TABLE "grouping_element" ADD COLUMN IF NOT EXISTS "background_color" text;--> statement-breakpoint
ALTER TABLE "grouping_element" ADD COLUMN IF NOT EXISTS "font_color" text;--> statement-breakpoint
ALTER TABLE "panel" ADD COLUMN IF NOT EXISTS "headline_color" text;--> statement-breakpoint
ALTER TABLE "dashboard" ADD COLUMN IF NOT EXISTS "headline_color" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "child_widgets" jsonb;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "slider_current_attribute" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "slider_maximum_attribute" text;--> statement-breakpoint
ALTER TABLE "widget" ADD COLUMN IF NOT EXISTS "headline_color" text;
