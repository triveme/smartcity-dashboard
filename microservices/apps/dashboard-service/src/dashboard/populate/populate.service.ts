/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { DashboardWithContent } from '../dashboard.service';
import { Dashboard, Panel, Tab, Widget } from '@app/postgres-db/schemas';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { WidgetToPanel } from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';
import { WidgetToPanelService } from '../../widget-to-panel/widget-to-panel.service';
import { reduceDashboard } from './populate.util';
import { FlatDashboardData } from '../dashboard.model';

@Injectable()
export class PopulateService {
  private readonly logger = new Logger(PopulateService.name);

  constructor(private readonly widgetToPanelService: WidgetToPanelService) {}

  async populateDashboardsWithContent(
    flatDashboardData: FlatDashboardData[],
  ): Promise<DashboardWithContent[]> {
    if (flatDashboardData.length === 0) {
      this.logger.warn('No Dashboards Found in Database');
      return [];
    }
    const dashboardsWithContent =
      await this.reduceRowsToDashboardsWithContent(flatDashboardData);

    return dashboardsWithContent;
  }

  async reduceRowsToDashboardsWithContent(
    rows: FlatDashboardData[],
  ): Promise<DashboardWithContent[]> {
    // Define Maps to store each dashboard component by their ID
    const dashboardMap = new Map<string, Dashboard>();
    const panelMap = new Map<string, Panel>();
    const widgetToPanelMap = new Map<string, WidgetToPanel>();
    const widgetMap = new Map<string, Widget>();
    const tabMap = new Map<string, Tab>();
    const dataModelMap = new Map<string, DataModel>();
    const queryMap = new Map<string, Query>();

    // Iterate through each row retrieved from the query
    // adding each dashboard component to their resepctive HashMaps
    rows.forEach((row) => {
      if (row.dashboard) {
        dashboardMap.set(row.dashboard.id, row.dashboard);
      }
      if (row.panel) {
        panelMap.set(row.panel.id, row.panel);
      }
      if (row.widget_to_panel) {
        widgetToPanelMap.set(
          row.widget_to_panel.panelId + row.widget_to_panel.widgetId,
          row.widget_to_panel,
        );
      }
      if (row.widget) {
        widgetMap.set(row.widget.id, {
          ...row.widget,
          widgetData: row.widget_data,
        });
      }
      if (row.tab) {
        tabMap.set(row.tab.id, row.tab);
      }
      if (row.data_model) {
        dataModelMap.set(row.data_model.id, row.data_model);
      }
      if (row.query) {
        queryMap.set(row.query.id, row.query);
      }
    });

    // Returning and array of the reduced dashboard object: DashboardWithContent
    const dashboardsWithContent: DashboardWithContent[] = Array.from(
      dashboardMap.values(),
    ).map((dashboard) => {
      return reduceDashboard(
        {
          ...dashboard,
          panels: [],
        },
        panelMap,
        widgetToPanelMap,
        widgetMap,
        tabMap,
        dataModelMap,
        queryMap,
      );
    });

    return dashboardsWithContent;
  }
}
