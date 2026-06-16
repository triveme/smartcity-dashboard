ALTER TYPE "timeframe" ADD VALUE IF NOT EXISTS 'user_defined';--> statement-breakpoint
ALTER TABLE "query_config" ADD COLUMN IF NOT EXISTS "data_start_date" timestamp (6);--> statement-breakpoint
ALTER TABLE "query_config" ADD COLUMN IF NOT EXISTS "data_until_date" timestamp (6);