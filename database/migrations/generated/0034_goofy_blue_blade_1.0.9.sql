ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Pin (dynamisch)';--> statement-breakpoint
ALTER TYPE "tab_component_type" ADD VALUE IF NOT EXISTS 'Werte zu Bildern';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tab_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"image_base64" text,
	"image_name" text
);
--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_static_values_text" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "values_to_images" jsonb;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tab_images" ADD CONSTRAINT "tab_images_tenant_id_tenant_abbreviation_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
