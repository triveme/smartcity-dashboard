ALTER TABLE "auth_data" ADD COLUMN IF NOT EXISTS "collections" text[];--> statement-breakpoint
ALTER TABLE "auth_data" ADD COLUMN IF NOT EXISTS "fiware_services" text[];--> statement-breakpoint
ALTER TABLE "data_source" ADD COLUMN IF NOT EXISTS "collections" text[];
