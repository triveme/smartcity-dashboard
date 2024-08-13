ALTER TYPE "tab_component_sub_type" ADD VALUE IF NOT EXISTS 'Farbiger Slider';--> statement-breakpoint
ALTER TYPE "tab_component_type" ADD VALUE IF NOT EXISTS 'Slider';--> statement-breakpoint
ALTER TABLE "system_user" ALTER COLUMN "password" SET DATA TYPE jsonb using to_jsonb(password);;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_static_values_ticks" real[];--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_static_values_logos" text[];--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_static_values_texts" text[];--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "label_color" text;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "map_widget_values" json;
