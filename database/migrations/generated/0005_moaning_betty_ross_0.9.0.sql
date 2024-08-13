ALTER TABLE "auth_data" ALTER COLUMN "client_secret" SET DATA TYPE jsonb using to_jsonb(client_secret);--> statement-breakpoint
ALTER TABLE "auth_data" ALTER COLUMN "app_user_password" SET DATA TYPE jsonb using to_jsonb(app_user_password);--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "menu_active_font_color" text;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "use_color_transition_header" boolean;--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "use_color_transition_menu" boolean;
