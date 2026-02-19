ALTER TYPE "auth_data_type" ADD VALUE IF NOT EXISTS 'sql';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_picture" (
	"id" uuid PRIMARY KEY NOT NULL,
	"data" text NOT NULL,
	"project_id" uuid NOT NULL,
	"created_at" timestamp (6) DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category_id" uuid NOT NULL,
	"status" text NOT NULL,
	"cost" integer,
	"district" text,
	"street_name" text,
	"location" json NOT NULL,
	"line_locations" json,
	"contact_person" text NOT NULL,
	"is_public" boolean DEFAULT false,
	"start_date" timestamp (6),
	"end_date" timestamp (6),
	"tenant_abbreviation" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_category" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp (6),
	CONSTRAINT "project_category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_picture" ADD CONSTRAINT "project_picture_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project" ADD CONSTRAINT "project_category_id_project_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "project_category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project" ADD CONSTRAINT "project_tenant_abbreviation_tenant_abbreviation_fk" FOREIGN KEY ("tenant_abbreviation") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

INSERT INTO project_category (id, name, created_at)
VALUES (gen_random_uuid(), 'Hochbau', now())
ON CONFLICT (name) DO NOTHING;
--> statement-breakpoint

INSERT INTO project_category (id, name, created_at)
VALUES (gen_random_uuid(), 'Tiefbau', now())
ON CONFLICT (name) DO NOTHING;
--> statement-breakpoint

INSERT INTO project_category (id, name, created_at)
VALUES (gen_random_uuid(), 'Sonstiges', now())
ON CONFLICT (name) DO NOTHING;
--> statement-breakpoint

CREATE VIEW project_view AS
SELECT project.id,
    project.title,
    project.status,
    project.cost,
    project.district,
    project.street_name,
    project.location,
    project.line_locations,
    project.contact_person,
    project.start_date,
    project.end_date,
    project.tenant_abbreviation,
    project.is_public,
    project.description,
    pc.name AS category
   FROM project
     JOIN project_category pc ON project.category_id = pc.id;
