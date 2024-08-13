-- SQL for inserting default data to postgres via the migrations container --

-- IMPORTANT: If a new column is created in a table, please remember to update the corresponding INSERT command with a default value for this column

-- NOTE FOR LOCAL DEPLOYMENT: if data is added or changed in this file, the dockerfile.migrations image must be rebuilt --

-- Insert default data into system_user if table is empty
INSERT INTO public.system_user (id, tenant_abbreviation, username, "password")
SELECT '5b928c4f-f882-493d-8ff9-6914cc1c51f7', 'edag', 'edag', '{"iv": "5eb4a254b23ee855a5f18951d569eb09", "content": "fd1d50d276ec6869e8ec33055128bd1c"}'
WHERE NOT EXISTS (SELECT 1 FROM public.system_user);

-- Insert default data into tenant if table is empty
INSERT INTO public.tenant (id, abbreviation)
SELECT '5f17a8b9-9241-40da-938e-03a50d48a7d1', 'edag'
WHERE NOT EXISTS (SELECT 1 FROM public.tenant);

-- Insert default data into corporate_info if table is empty
INSERT INTO public.corporate_info (id, tenant_id, dashboard_font_color, dashboard_primary_color, dashboard_secondary_color, font_color, header_font_color, header_logo_id, header_primary_color, header_secondary_color, header_title_admin, header_title_dashboards, logo, menu_active_color, menu_font_color, menu_hover_color, menu_logo_id, menu_primary_color, menu_secondary_color, panel_border_color, panel_border_radius, panel_border_size, panel_font_color, panel_primary_color, panel_secondary_color, show_header_logo, show_menu_logo, title_bar, widget_border_color, widget_border_radius, widget_border_size, widget_font_color, widget_primary_color, widget_secondary_color, scrollbar_background, scrollbar_color)
SELECT '1b23e0f7-01d9-4140-aac3-1466e06e4006', 'edag', '#FFF', '#2D3244', '#3D4760', '#FFF', '#FFF', NULL, '#2B3244', '#3D4760', 'Smart Region Dashboard', 'Dashboards', NULL, '#FFF', '#fff', '#3D4760', NULL, '#3D4760', '#1d2330', '#3D4760', '4px', 'px', '#FFF', '#3D4760', '#3D4760', false, false, 'edag', '#3D4760', '4px', '4px', '#FFF', '#3D4760', '#3D4760', '#3D4760', '#3D4760'
WHERE NOT EXISTS (SELECT 1 FROM public.corporate_info);

-- Insert default data into auth_data if table is empty
INSERT INTO public.auth_data (id, tenant_abbreviation, name, type, client_id, client_secret, app_user, app_user_password, api_token, auth_url, live_url, time_series_url, created_at, updated_at, read_roles, write_roles, visibility)
SELECT '1df13170-d7af-4771-9380-44f67081cb75', 'edag', 'Etteln', 'ngsi-v2', 'api-access', '{"iv": "feb55e873ca473fcd6622bc7d2a61d7e", "content": "ee703660ccfe46979123a98fc20239d91b7838987dafb9c71174f3800c83d46b8fbdb5a4bbfc08d9c6e774c63106059a"}', 'edag@technical.de', '{"iv": "4100e7a633d629b586577f22c4206222", "content": "bc4a8c68c405bffcef1a63fde5ad8ffeec4adb62075d59782c4dff69fbc92c1e"}', NULL, 'https://idm.staging.etteln.didoz.de/auth/realms/didoz/protocol/openid-connect/token', 'https://apim.staging.etteln.didoz.de/gateway/fiware/ngsi/v2/entities/', 'https://apim.staging.etteln.didoz.de/gateway/quantumleap/v2/', '2024-02-29 07:06:46.749271', '2024-02-29 07:06:46.749271', '{}', '{}', 'public'::public."visibility"
WHERE NOT EXISTS (SELECT 1 FROM public.auth_data);

-- Insert default data into data_source if table is empty
INSERT INTO public.data_source (id, name, auth_data_id, origin)
SELECT 'ed6f64bd-6029-4d29-a159-dd846c84d1c6', 'Etteln', '1df13170-d7af-4771-9380-44f67081cb75', 'ngsi-v2'
WHERE NOT EXISTS (SELECT 1 FROM public.data_source);

-- Insert default data into dashboard if table is empty
INSERT INTO public.dashboard (id, name, url, icon, "type", read_roles, write_roles, visibility)
SELECT 'a97c08d9-58c0-4df8-9a7b-e26a45c6a62b'::uuid, 'Default Dashboard', 'defaultURL', 'Building', '', '{}', '{}', 'public'::public.visibility
WHERE NOT EXISTS (SELECT 1 FROM public.dashboard);

-- Insert default data into panel if table is empty
INSERT INTO public.panel (id, dashboard_id, "name", height, width, "position")
SELECT 'ce68b906-333a-4967-99b0-6ca2bb4c8801'::uuid, 'a97c08d9-58c0-4df8-9a7b-e26a45c6a62b'::uuid, 'Default Panel', 400, 12, 1
WHERE NOT EXISTS (SELECT 1 FROM public.panel);

-- Insert default data into widget if table is empty
INSERT INTO public.widget (id, "name", height, width, icon, "visibility", read_roles, write_roles)
SELECT '70941767-96a2-417f-8c9b-35c3fd9e9233'::uuid, 'Default Widget', 400, 4, 'Gear', 'public'::public."visibility", '{}', '{}'
WHERE NOT EXISTS (SELECT 1 FROM public.widget);

-- Insert default data into tab if table is empty
INSERT INTO public.tab (id, component_type, component_sub_type, chart_minimum, chart_maximum, chart_unit, chart_values, chart_labels, chart_x_axis_label, chart_y_axis_label, chart_static_values, chart_static_values_colors, is_stepline, map_allow_popups, map_allow_scroll, map_allow_zoom, map_min_zoom, map_max_zoom, map_standard_zoom, map_marker_color, map_active_marker_color, map_marker_icon, map_marker_icon_color, map_longtitude, map_latitude, image_url, image_src, image_update_interval, text_value, decimal_places, iframe_url, widget_id, data_model_id, query_id, icon, icon_color, icon_text, icon_url, map_display_mode, map_shape_color, map_shape_option, show_legend)
SELECT 'eac01bad-296b-4afc-8803-5461e64a7fe3'::uuid, 'Informationen'::public."tab_component_type", 'Text'::public."tab_component_sub_type", NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, -1, '<h2><strong class="ql-size-large">Customize Your Widget</strong><span class="ql-size-large"><span class="ql-cursor">﻿</span></span></h2>', NULL, NULL, '70941767-96a2-417f-8c9b-35c3fd9e9233'::uuid, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM public.tab);

-- Insert default data into dashboard_to_tenant if table is empty
INSERT INTO public.dashboard_to_tenant (dashboard_id, tenant_id)
SELECT 'a97c08d9-58c0-4df8-9a7b-e26a45c6a62b'::uuid, '5f17a8b9-9241-40da-938e-03a50d48a7d1'::uuid
WHERE NOT EXISTS (SELECT 1 FROM public.dashboard_to_tenant);

-- Insert default data into widget_to_tenant if table is empty
INSERT INTO public.widget_to_tenant (widget_id, tenant_id)
SELECT '70941767-96a2-417f-8c9b-35c3fd9e9233'::uuid, '5f17a8b9-9241-40da-938e-03a50d48a7d1'::uuid
WHERE NOT EXISTS (SELECT 1 FROM public.widget_to_tenant);

-- Insert default data into widget_to_panel if table is empty
INSERT INTO public.widget_to_panel (widget_id, panel_id, "position")
SELECT '70941767-96a2-417f-8c9b-35c3fd9e9233'::uuid, 'ce68b906-333a-4967-99b0-6ca2bb4c8801'::uuid, 0
WHERE NOT EXISTS (SELECT 1 FROM public.widget_to_panel);


-- Insert default data into grouping_element if table is empty
INSERT INTO public.grouping_element (id, parent_grouping_element_id, "name", url, color, gradient, icon, is_dashboard, "position", tenant_abbreviation)
SELECT '112d4eea-8deb-4210-b7a0-fac55d9bb75a'::uuid, NULL, 'Default Group', 'defaultGroup', '#3a4691', false, 'Menu', false, 0, 'edag'
WHERE NOT EXISTS (SELECT 1 FROM public.grouping_element);
