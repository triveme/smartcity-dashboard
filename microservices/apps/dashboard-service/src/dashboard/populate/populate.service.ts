/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import {
  ChartData,
  DashboardWithContent,
  MapObject,
  WidgetWithContent,
} from '../dashboard.service';
import { Dashboard, Panel, Tab, Widget } from '@app/postgres-db/schemas';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { WidgetToPanel } from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';
import { WidgetToPanelService } from '../../widget-to-panel/widget-to-panel.service';
import { FlatDashboardData } from '../dashboard.repo';
import { PopulateValueService } from './populate-value.service';
import { PopulateChartService } from './populate-chart.service';
import { PopulateCombinedWidgetService } from './populate-combined-widget.service';
import {
  isCombinedWidgetTab,
  isSingleValueTab,
  reduceDashboard,
} from './populate.util';

@Injectable()
export class PopulateService {
  private readonly logger = new Logger(PopulateService.name);

  constructor(
    private readonly widgetToPanelService: WidgetToPanelService,
    private readonly populateValueService: PopulateValueService,
    private readonly populateChartService: PopulateChartService,
    private readonly populateCombinedWidgetService: PopulateCombinedWidgetService,
  ) {}

  async populateDashboardsWithContent(
    flatDashboardData: FlatDashboardData[],
    rolesFromRequest: string[],
  ): Promise<DashboardWithContent[]> {
    if (flatDashboardData.length === 0) {
      this.logger.warn('No Dashboards Found in Database');
      return [];
    }
    const dashboardsWithContent = await this.reduceRowsToDashboardsWithContent(
      flatDashboardData,
      true,
    );

    // Order the widgets within each panel for each dashboard
    for (const dashboard of dashboardsWithContent) {
      await this.sortWidgets(dashboard);
    }

    // If user is unauthenticated, exclude role properties from returned dashboards
    if (rolesFromRequest.length === 0) {
      dashboardsWithContent.forEach((dashboard) => {
        // Hide dashboard roles
        delete dashboard.readRoles;
        delete dashboard.writeRoles;
        // Hide widget roles
        dashboard.panels.forEach((panel) => {
          panel.widgets.forEach((widget) => {
            delete widget.readRoles;
            delete widget.writeRoles;
          });
        });
      });
    }

    return dashboardsWithContent;
  }

  async reduceRowsToDashboardsWithContent(
    rows: FlatDashboardData[],
    includeData: boolean,
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
        widgetMap.set(row.widget.id, row.widget);
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
    let dashboardsWithContent: DashboardWithContent[] = Array.from(
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

    if (includeData) {
      dashboardsWithContent = await this.populateDashboardsWithData(
        dashboardsWithContent,
      );
    }

    return dashboardsWithContent;
  }

  private async populateDashboardsWithData(
    dashboardsWithContent: DashboardWithContent[],
  ): Promise<DashboardWithContent[]> {
    return await Promise.all(
      dashboardsWithContent.map(async (dashboard) => {
        const panels = dashboard.panels;

        for (const panel of panels) {
          const widgets = panel.widgets;

          for (const widget of widgets) {
            const tabs = widget.tabs;

            for (const tab of tabs) {
              await this.populateTabWithContents(tab);
            }
          }
        }

        return dashboard;
      }),
    );
  }

  private async populateTabWithContents(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
    } & { mapObject: MapObject[] } & { combinedWidgets: WidgetWithContent[] },
  ): Promise<void> {
    if (
      tab.componentType !== 'Informationen' &&
      tab.componentType !== 'Bild' &&
      tab.componentType !== 'iFrame'
    ) {
      if (isSingleValueTab(tab)) {
        await this.populateValueService.populateTab(tab);
      } else if (isCombinedWidgetTab(tab)) {
        await this.populateCombinedWidgetService.populateTab(tab);
      } else {
        await this.populateChartService.populateTab(tab);
      }
    }
  }

  async sortWidgets(dashboard: DashboardWithContent): Promise<void> {
    // Order the widgets within each panel
    for (const panel of dashboard.panels) {
      const widgetsToPanels = [];

      for (const widget of panel.widgets) {
        const widgetToPanel = await this.widgetToPanelService.getById(
          widget.id,
          panel.id,
        );
        widgetsToPanels.push({
          widgetId: widget.id,
          position: widgetToPanel?.position,
        });
      }

      // Sort widgets based on the position from widgetsToPanels
      // prettier-ignore
      panel.widgets.sort((a, b) => {
        const positionA = widgetsToPanels.find((w) => w.widgetId === a.id)
          ?.position;
        const positionB = widgetsToPanels.find((w) => w.widgetId === b.id)
          ?.position;

        return positionA - positionB;
      });
    }
  }
}
