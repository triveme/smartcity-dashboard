ALTER TABLE "auth_data" ADD COLUMN IF NOT EXISTS "tenant_abbreviation" text;--> statement-breakpoint
ALTER TABLE "auth_data" ADD COLUMN IF NOT EXISTS "read_roles" text[];--> statement-breakpoint
ALTER TABLE "auth_data" ADD COLUMN IF NOT EXISTS "write_roles" text[];--> statement-breakpoint
ALTER TABLE "auth_data" ADD COLUMN IF NOT EXISTS "visibility" "visibility";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_data" ADD CONSTRAINT "auth_data_tenant_abbreviation_tenant_abbreviation_fk" FOREIGN KEY ("tenant_abbreviation") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
