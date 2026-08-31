ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "split_calendar_day" boolean;
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "calendar_booked_color" text;
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "calendar_privat_booked_color" text;
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "calendar_organisation_booked_color" text;
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "calendar_month_after_current" real;
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "calendar_month_before_current" real;
ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "calendar_displayd_month_count" real;
ALTER TYPE "tab_component_type" ADD VALUE IF NOT EXISTS 'Belegungskalender';
ALTER TYPE "auth_data_type" ADD VALUE IF NOT EXISTS 'planbar';
