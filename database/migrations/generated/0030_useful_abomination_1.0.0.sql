CREATE TABLE IF NOT EXISTS "widget_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"widget_id" uuid,
	"data" json
);
--> statement-breakpoint
ALTER TABLE "tab" DROP COLUMN IF EXISTS "chart_static_values_max_ticks";--> statement-breakpoint
ALTER TABLE "widget" DROP COLUMN IF EXISTS "widget_data";--> statement-breakpoint

DO $$ BEGIN
 ALTER TABLE "widget_data" ADD CONSTRAINT "widget_data_widget_id_widget_id_fk" FOREIGN KEY ("widget_id") REFERENCES "widget"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- MIGRATION for child_widgets column from jsonb to text[]
-- Step 1: Add a temporary column of type text[]
ALTER TABLE "tab" ADD COLUMN "temp_child_widgets" text[];

-- Step 2: Populate the temporary column using a more reliable conversion method
UPDATE "tab"
SET "temp_child_widgets" = ARRAY(
  SELECT jsonb_array_elements_text("child_widgets")
  WHERE jsonb_typeof("child_widgets") = 'array'
)
WHERE "child_widgets" IS NOT NULL;

-- Step 3: Drop the original column
ALTER TABLE "tab" DROP COLUMN "child_widgets";

-- Step 4: Rename the temporary column to the original column name
ALTER TABLE "tab" RENAME COLUMN "temp_child_widgets" TO "child_widgets";--> statement-breakpoint

ALTER TABLE "tab" ADD COLUMN IF NOT EXISTS "is_stacked_chart" boolean;
ALTER TABLE "auth_data" ADD COLUMN IF NOT EXISTS "ngsild_tenant" text;
ALTER TABLE "auth_data" ADD COLUMN IF NOT EXISTS "ngsild_context_url" text;
