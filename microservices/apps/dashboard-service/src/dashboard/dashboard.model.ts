import {
  Dashboard,
  EnrichedTab,
  Panel,
  Widget,
  WidgetData,
} from '@app/postgres-db/schemas';
import { WidgetToPanel } from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { Query } from '@app/postgres-db/schemas/query.schema';

export type FlatDashboardData = {
  dashboard: Dashboard;
  panel: Panel;
  widget_to_panel: WidgetToPanel;
  widget: Widget;
  widget_data?: WidgetData | null;
  tab: EnrichedTab;
  data_model: DataModel;
  query: Query;
};
