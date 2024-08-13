DO $$ BEGIN
 CREATE TYPE "visibility" AS ENUM('public', 'protected', 'invisible');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "aggregation" AS ENUM('avg', 'min', 'max', 'sum', 'none');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "aggregation_period" AS ENUM('second', 'minute', 'hour', 'day', 'week', 'month', 'year');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "auth_data_type" AS ENUM('ngsi', 'ngsi-v2', 'ngsi-ld', 'api');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "threshold_trigger_type" AS ENUM('exceeding', 'falls below', 'equals');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "tab_component_sub_type" AS ENUM('180° Chart', '360° Chart', 'Pie Chart', 'Linien Chart', 'Balken Chart', 'Measurement', 'Pin', 'Parking');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "tab_component_type" AS ENUM('Text', 'Diagramm', 'Karte', 'Wert', 'iFrame', 'Bild');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "time_horizon_type" AS ENUM('shortterm', 'midterm', 'longterm', 'archive');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "timeframe" AS ENUM('live', 'hour', 'day', 'week', 'month');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "auth_data_type" DEFAULT 'api' NOT NULL,
	"client_id" text NOT NULL,
	"client_secret" text NOT NULL,
	"app_user" text,
	"app_user_password" text,
	"api_token" text,
	"auth_url" text NOT NULL,
	"live_url" text NOT NULL,
	"time_series_url" text NOT NULL,
	"api_url" text,
	"created_at" timestamp (6) DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "climate_project" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"link" text NOT NULL,
	"costs_in_cents" integer NOT NULL,
	"location" json NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"img_path" text,
	"start_at" timestamp (6) DEFAULT now(),
	"end_at" timestamp (6) DEFAULT now(),
	"locationText" text NOT NULL,
	"timeHorizon" "time_horizon_type" NOT NULL,
	"responsible" text NOT NULL,
	"visibility" "visibility",
	"read_roles" text[],
	"write_roles" text[],
	"created_at" timestamp (6) DEFAULT now(),
	"updated_at" timestamp (6) DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "corporate_info" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" text,
	"dashboard_font_color" text,
	"dashboard_primary_color" text,
	"dashboard_secondary_color" text,
	"font_color" text,
	"header_font_color" text,
	"header_logo_id" uuid,
	"header_primary_color" text,
	"header_secondary_color" text,
	"header_title_admin" text,
	"header_title_dashboards" text,
	"logo" text,
	"menu_active_color" text,
	"menu_font_color" text,
	"menu_hover_color" text,
	"menu_logo_id" uuid,
	"menu_primary_color" text,
	"menu_secondary_color" text,
	"panel_border_color" text,
	"panel_border_radius" text,
	"panel_border_size" text,
	"panel_font_color" text,
	"panel_primary_color" text,
	"panel_secondary_color" text,
	"show_header_logo" boolean,
	"show_menu_logo" boolean,
	"title_bar" text,
	"widget_border_color" text,
	"widget_border_radius" text,
	"widget_border_size" text,
	"widget_font_color" text,
	"widget_primary_color" text,
	"widget_secondary_color" text,
	CONSTRAINT "corporate_info_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dashboard_to_tenant" (
	"dashboard_id" uuid,
	"tenant_id" uuid,
	CONSTRAINT dashboard_to_tenant_dashboard_id_tenant_id PRIMARY KEY("dashboard_id","tenant_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "grouping_element" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_grouping_element_id" uuid,
	"name" text,
	"url" text,
	"color" text,
	"gradient" boolean,
	"icon" text,
	"is_dashboard" boolean,
	"position" smallint,
	"tenant_abbreviation" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "panel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dashboard_id" uuid,
	"name" text,
	"height" smallint,
	"width" smallint,
	"position" smallint
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dashboard" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"url" text,
	"icon" text,
	"type" text,
	"read_roles" text[],
	"write_roles" text[],
	"visibility" "visibility"
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tab" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"component_type" "tab_component_type",
	"component_sub_type" "tab_component_sub_type",
	"chart_minimum" real,
	"chart_maximum" real,
	"chart_unit" text,
	"chart_values" real[],
	"chart_labels" text[],
	"chart_x_axis_label" text,
	"chart_y_axis_label" text,
	"chart_static_values" real[],
	"chart_static_values_colors" text[],
	"is_stepline" boolean,
	"map_allow_popups" boolean,
	"map_allow_scroll" boolean,
	"map_allow_zoom" boolean,
	"map_min_zoom" smallint,
	"map_max_zoom" smallint,
	"map_standard_zoom" smallint,
	"map_marker_color" text,
	"map_active_marker_color" text,
	"map_marker_icon" text,
	"map_marker_icon_color" text,
	"map_longtitude" real,
	"map_latitude" real,
	"image_url" text,
	"image_src" text,
	"image_update_interval" smallint,
	"text_value" text,
	"decimal_places" smallint,
	"iframe_url" text,
	"widget_id" uuid,
	"data_model_id" uuid,
	"query_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "widget_to_panel" (
	"widget_id" uuid,
	"panel_id" uuid,
	"position" smallint,
	CONSTRAINT widget_to_panel_widget_id_panel_id PRIMARY KEY("widget_id","panel_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "widget" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"height" smallint,
	"width" smallint,
	"icon" text,
	"visibility" "visibility",
	"read_roles" text[],
	"write_roles" text[]
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_model" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "data_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_data_id" uuid,
	"name" text NOT NULL,
	"origin" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "defect" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location" json NOT NULL,
	"category" text NOT NULL,
	"imgPath" text NOT NULL,
	"description" text,
	"mail" text,
	"phone" text,
	"visibility" "visibility",
	"read_roles" text[],
	"write_roles" text[],
	"created_at" timestamp (6) DEFAULT now(),
	"updated_at" timestamp (6) DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "query_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"data_source_id" uuid,
	"interval" smallint NOT NULL,
	"fiware_service" text NOT NULL,
	"fiware_service_path" text NOT NULL,
	"fiware_type" text NOT NULL,
	"entity_ids" text[],
	"attributes" text[],
	"aggr_mode" "aggregation",
	"timeframe" "timeframe",
	"aggr_period" "aggregation_period",
	"is_reporting" boolean,
	"hash" text,
	"tenant_id" text,
	"created_at" timestamp (6) DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "query" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query_config_id" uuid,
	"query_data" json,
	"report_data" json,
	"update_message" text[],
	"created_at" timestamp (6) DEFAULT now(),
	"updated_at" timestamp (6) DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"link" text NOT NULL,
	"costs_in_cents" integer NOT NULL,
	"location" json NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"img_path" text NOT NULL,
	"start_at" timestamp (6) DEFAULT now(),
	"end_at" timestamp (6) DEFAULT now(),
	"contactPerson" text NOT NULL,
	"county" text NOT NULL,
	"comment" text NOT NULL,
	"adminComment" text NOT NULL,
	"lastModifiedBy" text NOT NULL,
	"redirection" text NOT NULL,
	"address" text NOT NULL,
	"referenceNumber" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"visibility" "visibility",
	"read_roles" text[],
	"write_roles" text[],
	"created_at" timestamp (6) DEFAULT now(),
	"updated_at" timestamp (6) DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sensor_report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query_id" uuid,
	"property_name" text NOT NULL,
	"threshold" text NOT NULL,
	"trigger" "threshold_trigger_type",
	"recipients" text[],
	"mail_text" text,
	"created_at" timestamp (6) DEFAULT now(),
	"updated_at" timestamp (6) DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tenant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"abbreviation" text,
	"logo" text,
	"logo_height" smallint,
	"logo_width" smallint,
	"logo_name" text,
	"format" text,
	"size" text,
	CONSTRAINT "tenant_abbreviation_unique" UNIQUE("abbreviation")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_abbreviation" text NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "system_user_tenant_abbreviation_unique" UNIQUE("tenant_abbreviation")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "widget_to_tenant" (
	"widget_id" uuid,
	"tenant_id" uuid,
	CONSTRAINT widget_to_tenant_widget_id_tenant_id PRIMARY KEY("widget_id","tenant_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "corporate_info" ADD CONSTRAINT "corporate_info_tenant_id_tenant_abbreviation_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "corporate_info" ADD CONSTRAINT "corporate_info_header_logo_id_tenant_id_fk" FOREIGN KEY ("header_logo_id") REFERENCES "tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "corporate_info" ADD CONSTRAINT "corporate_info_menu_logo_id_tenant_id_fk" FOREIGN KEY ("menu_logo_id") REFERENCES "tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboard_to_tenant" ADD CONSTRAINT "dashboard_to_tenant_dashboard_id_dashboard_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "dashboard"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dashboard_to_tenant" ADD CONSTRAINT "dashboard_to_tenant_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "grouping_element" ADD CONSTRAINT "grouping_element_parent_grouping_element_id_grouping_element_id_fk" FOREIGN KEY ("parent_grouping_element_id") REFERENCES "grouping_element"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "grouping_element" ADD CONSTRAINT "grouping_element_tenant_abbreviation_tenant_abbreviation_fk" FOREIGN KEY ("tenant_abbreviation") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "panel" ADD CONSTRAINT "panel_dashboard_id_dashboard_id_fk" FOREIGN KEY ("dashboard_id") REFERENCES "dashboard"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tab" ADD CONSTRAINT "tab_widget_id_widget_id_fk" FOREIGN KEY ("widget_id") REFERENCES "widget"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tab" ADD CONSTRAINT "tab_data_model_id_data_model_id_fk" FOREIGN KEY ("data_model_id") REFERENCES "data_model"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tab" ADD CONSTRAINT "tab_query_id_query_id_fk" FOREIGN KEY ("query_id") REFERENCES "query"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "widget_to_panel" ADD CONSTRAINT "widget_to_panel_widget_id_widget_id_fk" FOREIGN KEY ("widget_id") REFERENCES "widget"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "widget_to_panel" ADD CONSTRAINT "widget_to_panel_panel_id_panel_id_fk" FOREIGN KEY ("panel_id") REFERENCES "panel"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "data_source" ADD CONSTRAINT "data_source_auth_data_id_auth_data_id_fk" FOREIGN KEY ("auth_data_id") REFERENCES "auth_data"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "query_config" ADD CONSTRAINT "query_config_data_source_id_data_source_id_fk" FOREIGN KEY ("data_source_id") REFERENCES "data_source"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "query_config" ADD CONSTRAINT "query_config_tenant_id_tenant_abbreviation_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("abbreviation") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "query" ADD CONSTRAINT "query_query_config_id_query_config_id_fk" FOREIGN KEY ("query_config_id") REFERENCES "query_config"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sensor_report" ADD CONSTRAINT "sensor_report_query_id_query_id_fk" FOREIGN KEY ("query_id") REFERENCES "query"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "widget_to_tenant" ADD CONSTRAINT "widget_to_tenant_widget_id_widget_id_fk" FOREIGN KEY ("widget_id") REFERENCES "widget"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "widget_to_tenant" ADD CONSTRAINT "widget_to_tenant_tenant_id_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
