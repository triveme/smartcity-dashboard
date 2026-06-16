ALTER TYPE "chart_date_representation" ADD VALUE IF NOT EXISTS 'Default Without Month';--> statement-breakpoint
ALTER TYPE "chart_date_representation" ADD VALUE IF NOT EXISTS 'Weekdays';--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_hide_x_axis" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "chart_hide_y_axis" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "hide_thousands_separator" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "use_dashboard_font_color" boolean;--> statement-breakpoint
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "normalize_x_axis_by_time_frame_period" boolean;