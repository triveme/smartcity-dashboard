ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "favicon_logo_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "corporate_info" ADD CONSTRAINT "corporate_info_favicon_logo_id_logo_id_fk" FOREIGN KEY ("favicon_logo_id") REFERENCES "logo"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "corporate_info" DROP COLUMN IF EXISTS "favicon";
