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
INSERT INTO public.corporate_info (id,tenant_id,dashboard_font_color,dashboard_primary_color,dashboard_secondary_color,font_color,header_font_color,header_logo_id,header_primary_color,header_secondary_color,header_title_admin,header_title_dashboards,logo,menu_active_color,menu_font_color,menu_hover_color,menu_logo_id,menu_primary_color,menu_secondary_color,panel_border_color,panel_border_radius,panel_border_size,panel_font_color,panel_primary_color,panel_secondary_color,show_header_logo,show_menu_logo,widget_border_color,widget_border_radius,widget_border_size,widget_font_color,widget_primary_color,widget_secondary_color,scrollbar_background,scrollbar_color,menu_active_font_color,use_color_transition_header,use_color_transition_menu,save_button_color,save_hover_button_color,cancel_button_color,cancel_hover_button_color,title_bar,font_family,bar_chart_axis_label_size,bar_chart_axis_line_color,bar_chart_axis_ticks_font_size,bar_chart_current_values_colors,bar_chart_grid_color,bar_chart_legend_font_size,bar_chart_ticks_font_color,colored_slider_arrow_color,colored_slider_big_value_font_color,colored_slider_big_value_font_size,colored_slider_label_font_color,colored_slider_label_font_size,colored_slider_unit_font_size,dashboard_headline_font_size,degree_chart_180_bg_color,degree_chart_180_fill_color,degree_chart_180_font_color,degree_chart_180_font_size,degree_chart_180_unit_font_size,degree_chart_360_bg_color,degree_chart_360_fill_color,degree_chart_360_font_color,degree_chart_360_font_size,degree_chart_360_unit_font_size,icon_with_link_font_color,icon_with_link_font_size,icon_with_link_icon_color,icon_with_link_icon_size,information_text_font_color,information_text_font_size,line_chart_axis_label_font_color,line_chart_axis_label_size,line_chart_axis_line_color,line_chart_axis_ticks_font_size,line_chart_current_values_colors,line_chart_grid_color,line_chart_legend_font_size,line_chart_legend_font_color,line_chart_ticks_font_color,measurement_chart_axis_label_font_color,measurement_chart_axis_line_color,measurement_chart_axis_ticks_font_color,measurement_chart_bar_color,measurement_chart_big_value_font_color,measurement_chart_big_value_font_size,measurement_chart_cards_bg_color,measurement_chart_cards_font_color,measurement_chart_cards_icon_colors,measurement_chart_current_values_colors,measurement_chart_grid_color,measurement_chart_label_font_color,measurement_chart_top_button_bg_color,measurement_chart_top_button_font_color,measurement_chart_top_button_hover_color,measurement_chart_top_button_inactive_bg_color,panel_headline_font_size,pie_chart_font_color,pie_chart_font_size,pie_chart_current_values_colors,stageable_chart_font_color,stageable_chart_font_size,stageable_chart_ticks_font_color,stageable_chart_ticks_font_size,wert_font_color,widget_headline_font_size,widget_subheadline_font_size,wert_font_size,wert_unit_font_size,bar_chart_axis_label_color,bar_chart_legend_font_color,bar_chart_filter_color,bar_chart_filter_text_color,line_chart_filter_color,line_chart_filter_text_color,bar_chart_axis_label_font_color)
SELECT '155c75e1-5e13-4037-9fb7-b74a71458964','edag','#FFF','#2D3244','#3D4760','#FFF','#FFF',NULL,'#3d4760','#3d4760','Smart Region Dashboard','Dashboards',NULL,'#FFF','#fff','#99a4c3ff',NULL,'#3D4760','#1d2330','#3D4760','4px','4px','#FFF','#3D4760','#3D4760',true,true,'#3D4760','4px','4px','#FFF','#3D4760','#3D4760','#b9c2ee','#3D4760','#1d2330',false,false,'#f5c442','#f7c543','#803535ff','#ffffffff','Dark','Arial','14','#ffffffff','14','{#FFA500,#FF4500,#00FF00,#6f3939ff,#d61010ff,#a28d8dff,#618369ff,#7e6969ff,#3d2f2fff,#ecddddff}','#ffffffff','14','#ffffffff',NULL,NULL,NULL,NULL,NULL,NULL,'24px','#190f50ff','#ffffffff','#ffffffff','20','15','#004cafff','#ffffffff','#ffffffff','20','15','#ffffffff','20','#ffffffff','xl','#ffffffff','20','#ffffffff','14','#ffffffff','14','{#4f94dbff,#755b5bff,#971b1bff,#31586fff,#4bc771ff,#b9c58bff,#2534afb2,#b21dc2ff,#b1a2a2ff,#ce3388ff}','#ffffffff','14','#ffffffff','#ffffffff','#ffffffff','#ffffffff','#ffffffff','#00adffff','#0066ffd5','60','#ffffff00','#ffffffff','{#68aff0ff,#dd4bc0ff,#d88935ff,#e71010ff}','{#00c8ffff}','#ffffffff','#ffffffff','#ffffff00','#ffffffff','#000152ff','#ffffff00','24px','#ffffffff','20','{#4f94dbff,#755b5bff,#971b1bff,#31586fff,#4bc771ff,#b9c58bff,#2534afb2,#b21dc2ff,#b1a2a2ff,#ce3388ff}','#ffffffff','20','#ffffffff','10','20','16px','14px','20','15','#ffffffff','#FFFFFF','#F1B434','#1D2330','#F1B434','#1D2330','#FFFFF'
WHERE NOT EXISTS (SELECT 1 FROM public.corporate_info WHERE id = '155c75e1-5e13-4037-9fb7-b74a71458964');
INSERT INTO public.corporate_info (id,tenant_id,dashboard_font_color,dashboard_primary_color,dashboard_secondary_color,font_color,header_font_color,header_logo_id,header_primary_color,header_secondary_color,header_title_admin,header_title_dashboards,logo,menu_active_color,menu_font_color,menu_hover_color,menu_logo_id,menu_primary_color,menu_secondary_color,panel_border_color,panel_border_radius,panel_border_size,panel_font_color,panel_primary_color,panel_secondary_color,show_header_logo,show_menu_logo,widget_border_color,widget_border_radius,widget_border_size,widget_font_color,widget_primary_color,widget_secondary_color,scrollbar_background,scrollbar_color,menu_active_font_color,use_color_transition_header,use_color_transition_menu,save_button_color,save_hover_button_color,cancel_button_color,cancel_hover_button_color,title_bar,font_family,bar_chart_axis_label_size,bar_chart_axis_line_color,bar_chart_axis_ticks_font_size,bar_chart_current_values_colors,bar_chart_grid_color,bar_chart_legend_font_size,bar_chart_ticks_font_color,colored_slider_arrow_color,colored_slider_big_value_font_color,colored_slider_big_value_font_size,colored_slider_label_font_color,colored_slider_label_font_size,colored_slider_unit_font_size,dashboard_headline_font_size,degree_chart_180_bg_color,degree_chart_180_fill_color,degree_chart_180_font_color,degree_chart_180_font_size,degree_chart_180_unit_font_size,degree_chart_360_bg_color,degree_chart_360_fill_color,degree_chart_360_font_color,degree_chart_360_font_size,degree_chart_360_unit_font_size,icon_with_link_font_color,icon_with_link_font_size,icon_with_link_icon_color,icon_with_link_icon_size,information_text_font_color,information_text_font_size,line_chart_axis_label_font_color,line_chart_axis_label_size,line_chart_axis_line_color,line_chart_axis_ticks_font_size,line_chart_current_values_colors,line_chart_grid_color,line_chart_legend_font_size,line_chart_legend_font_color,line_chart_ticks_font_color,measurement_chart_axis_label_font_color,measurement_chart_axis_line_color,measurement_chart_axis_ticks_font_color,measurement_chart_bar_color,measurement_chart_big_value_font_color,measurement_chart_big_value_font_size,measurement_chart_cards_bg_color,measurement_chart_cards_font_color,measurement_chart_cards_icon_colors,measurement_chart_current_values_colors,measurement_chart_grid_color,measurement_chart_label_font_color,measurement_chart_top_button_bg_color,measurement_chart_top_button_font_color,measurement_chart_top_button_hover_color,measurement_chart_top_button_inactive_bg_color,panel_headline_font_size,pie_chart_font_color,pie_chart_font_size,pie_chart_current_values_colors,stageable_chart_font_color,stageable_chart_font_size,stageable_chart_ticks_font_color,stageable_chart_ticks_font_size,wert_font_color,widget_headline_font_size,widget_subheadline_font_size,wert_font_size,wert_unit_font_size,bar_chart_axis_label_color,bar_chart_legend_font_color,bar_chart_filter_color,bar_chart_filter_text_color,line_chart_filter_color,line_chart_filter_text_color,bar_chart_axis_label_font_color)
SELECT '1e890844-55c7-40f6-ba9a-1a69ae58355d','edag','#FFF','#2D3244','#3D4760','#FFF','#FFF',NULL,'#3d4760','#3d4760','Smart Region Dashboard','Dashboards',NULL,'#FFF','#fff','#99a4c3ff',NULL,'#3D4760','#1d2330','#3D4760','4px','4px','#FFF','#3D4760','#3D4760',true,true,'#3D4760','4px','4px','#FFF','#3D4760','#3D4760','#b9c2ee','#3D4760','#1d2330',false,false,'#f5c442','#f7c543','#803535ff','#ffffffff','Dark','Arial','14','#ffffffff','14','{#FFA500,#FF4500,#00FF00,#6f3939ff,#d61010ff,#a28d8dff,#618369ff,#7e6969ff,#3d2f2fff,#ecddddff}','#ffffffff','14','#ffffffff',NULL,NULL,NULL,NULL,NULL,NULL,'24px','#190f50ff','#ffffffff','#ffffffff','20','15','#004cafff','#ffffffff','#ffffffff','20','15','#ffffffff','20','#ffffffff','xl','#ffffffff','20','#ffffffff','14','#ffffffff','14','{#4f94dbff,#755b5bff,#971b1bff,#31586fff,#4bc771ff,#b9c58bff,#2534afb2,#b21dc2ff,#b1a2a2ff,#ce3388ff}','#ffffffff','14','#ffffffff','#ffffffff','#ffffffff','#ffffffff','#ffffffff','#00adffff','#0066ffd5','60','#ffffff00','#ffffffff','{#68aff0ff,#dd4bc0ff,#d88935ff,#e71010ff}','{#00c8ffff}','#ffffffff','#ffffffff','#ffffff00','#ffffffff','#000152ff','#ffffff00','24px','#ffffffff','20','{#4f94dbff,#755b5bff,#971b1bff,#31586fff,#4bc771ff,#b9c58bff,#2534afb2,#b21dc2ff,#b1a2a2ff,#ce3388ff}','#ffffffff','20','#ffffffff','10','20','16px','14px','20','15','#ffffffff','#FFFFFF','#F1B434','#1D2330','#F1B434','#1D2330','#FFFFF'
WHERE NOT EXISTS (SELECT 1 FROM public.corporate_info WHERE id = '1e890844-55c7-40f6-ba9a-1a69ae58355d');

INSERT INTO public.general_settings (id, tenant, information, imprint, privacy)
SELECT 'e0c83789-f400-4f54-8855-9eca0c467043'::uuid, 'edag', 'https://smartcity.edag.com/', 'https://smartcity.edag.com/impressum/', 'https://smartcity.edag.com/datenschutz/'
WHERE NOT EXISTS (SELECT 1 FROM public.general_settings);

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
INSERT INTO public.grouping_element (id, parent_grouping_element_id, "name", url, background_color, gradient, font_color, icon, is_dashboard, "position", tenant_abbreviation)
SELECT '112d4eea-8deb-4210-b7a0-fac55d9bb75a'::uuid, NULL, 'Default Group', 'defaultGroup', '#3a4691', false, '#000', 'Menu', false, 0, 'edag'
WHERE NOT EXISTS (SELECT 1 FROM public.grouping_element);

-- Insert default dashboard if it doesn't already exist
INSERT INTO public.grouping_element (id, parent_grouping_element_id, "name", url, background_color, gradient, font_color, icon, is_dashboard, "position", tenant_abbreviation)
SELECT '5af4f990-8b51-4d2e-ad7a-07e422ae7136'::uuid, '112d4eea-8deb-4210-b7a0-fac55d9bb75a'::uuid, 'Default Dashboard', 'defaultURL', NULL, NULL, NULL, 'Building', true, 0, 'edag'
WHERE NOT EXISTS (SELECT 1 FROM public.grouping_element WHERE id = '5af4f990-8b51-4d2e-ad7a-07e422ae7136');
