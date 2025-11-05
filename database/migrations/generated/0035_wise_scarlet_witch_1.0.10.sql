ALTER TYPE "timeframe" ADD VALUE IF NOT EXISTS 'year2';--> statement-breakpoint
ALTER TYPE "timeframe" ADD VALUE IF NOT EXISTS 'year3';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "dateselector_border_color" text DEFAULT '#3D4760';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "dateselector_background_color_selected" text DEFAULT '#3D4760';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "dateselector_font_color_selected" text DEFAULT '#2D3244';--> statement-breakpoint
ALTER TABLE "corporate_info" ADD COLUMN IF NOT EXISTS "dateselector_font_color_unselected" text DEFAULT '#3D4760';