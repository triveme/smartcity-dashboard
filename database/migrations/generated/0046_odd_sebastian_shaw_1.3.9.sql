ALTER TYPE "auth_data_type" ADD VALUE IF NOT EXISTS 'planbar';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "header_logo_link_url" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_cluster_at_max_zoom" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "extended_timeframe" text;--> statement-breakpoint
ALTER TABLE "query_config" ADD COLUMN IF NOT EXISTS "extended_date_selection" boolean;