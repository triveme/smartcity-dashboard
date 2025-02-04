DO $$ BEGIN
 CREATE TYPE "corporate_info_font_families_type" AS ENUM('Helvetica', 'Arial', 'Verdana', 'Tahoma', 'Gill Sans', 'Times New Roman', 'Georgia', 'Palatino', 'Courier', 'Lucida', 'Monaco');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "title_bar_theme" AS ENUM('Dark', 'Light');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$
BEGIN
    -- Check if the constraint "corporate_info_tenant_id_unique" exists and drop it
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'corporate_info_tenant_id_unique'
        AND conrelid = 'corporate_info'::regclass
    ) THEN
        ALTER TABLE "corporate_info" DROP CONSTRAINT "corporate_info_tenant_id_unique";
    END IF;

    -- Check if the constraint "corporate_info_tenant_id_tenant_abbreviation_fk" exists and drop it
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'corporate_info_tenant_id_tenant_abbreviation_fk'
        AND conrelid = 'corporate_info'::regclass
    ) THEN
        ALTER TABLE "corporate_info" DROP CONSTRAINT "corporate_info_tenant_id_tenant_abbreviation_fk";
    END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "logo" DROP CONSTRAINT "logo_tenant_id_tenant_abbreviation_fk";
--> statement-breakpoint
ALTER TABLE "corporate_info" ALTER COLUMN "font_color" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "corporate_info" DROP COLUMN "title_bar";
ALTER TABLE "corporate_info" ADD COLUMN "title_bar" title_bar_theme;
UPDATE "corporate_info"
SET "title_bar" = 'Light';
--> statement-breakpoint
ALTER TABLE "corporate_info" ALTER COLUMN "title_bar" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "font_family" "corporate_info_font_families_type" DEFAULT 'Arial' NOT NULL;--> statement-breakpoint
ALTER TABLE "panel" ADD COLUMN IF NOT EXISTS "show_jumpoff_button" boolean;--> statement-breakpoint
ALTER TABLE "panel" ADD COLUMN IF NOT EXISTS "jumpoff_label" text;--> statement-breakpoint
ALTER TABLE "panel" ADD COLUMN IF NOT EXISTS "jumpoff_icon" text;--> statement-breakpoint
ALTER TABLE "panel" ADD COLUMN IF NOT EXISTS "jumpoff_url" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "tiles" real;--> statement-breakpoint
ALTER TABLE "widget" ADD COLUMN IF NOT EXISTS "show_name" boolean;--> statement-breakpoint
ALTER TABLE "widget" ADD COLUMN IF NOT EXISTS "allow_share" boolean;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "corporate_info" ADD CONSTRAINT "corporate_info_tenant_id_tenant_abbreviation_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logo" ADD CONSTRAINT "logo_tenant_id_tenant_abbreviation_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
