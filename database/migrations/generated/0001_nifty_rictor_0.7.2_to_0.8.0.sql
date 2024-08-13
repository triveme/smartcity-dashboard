ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Text';--> statement-breakpoint
ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Icon mit Link';--> statement-breakpoint
ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Stageable Chart';--> statement-breakpoint
ALTER TYPE "tab_component_type" ADD VALUE IF NOT EXISTS 'Informationen';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "logo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"logo" text,
	"logo_height" smallint,
	"logo_width" smallint,
	"logo_name" text,
	"format" text,
	"size" text
);
--> statement-breakpoint
ALTER TABLE "corporate_info" DROP CONSTRAINT "corporate_info_header_logo_id_tenant_id_fk";
--> statement-breakpoint
ALTER TABLE "corporate_info" DROP CONSTRAINT "corporate_info_menu_logo_id_tenant_id_fk";
--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "scrollbar_background" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "scrollbar_color" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "icon" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "icon_color" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "icon_text" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "icon_url" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_display_mode" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_shape_color" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_shape_option" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "show_legend" boolean;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "corporate_info" ADD CONSTRAINT "corporate_info_header_logo_id_logo_id_fk" FOREIGN KEY ("header_logo_id") REFERENCES "logo"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "corporate_info" ADD CONSTRAINT "corporate_info_menu_logo_id_logo_id_fk" FOREIGN KEY ("menu_logo_id") REFERENCES "logo"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "tenant" DROP COLUMN IF EXISTS "logo";--> statement-breakpoint
ALTER TABLE "tenant" DROP COLUMN IF EXISTS "logo_height";--> statement-breakpoint
ALTER TABLE "tenant" DROP COLUMN IF EXISTS "logo_width";--> statement-breakpoint
ALTER TABLE "tenant" DROP COLUMN IF EXISTS "logo_name";--> statement-breakpoint
ALTER TABLE "tenant" DROP COLUMN IF EXISTS "format";--> statement-breakpoint
ALTER TABLE "tenant" DROP COLUMN IF EXISTS "size";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logo" ADD CONSTRAINT "logo_tenant_id_tenant_abbreviation_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
