/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import { and, arrayOverlaps, asc, eq, inArray, or } from 'drizzle-orm';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  Dashboard,
  dashboards,
  NewDashboard,
} from '@app/postgres-db/schemas/dashboard.schema';
import {
  Widget,
  widgets,
} from '@app/postgres-db/schemas/dashboard.widget.schema';
import { Tab, tabs } from '@app/postgres-db/schemas/dashboard.tab.schema';
import { Panel, panels } from '@app/postgres-db/schemas/dashboard.panel.schema';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import {
  widgetsToPanels,
  WidgetToPanel,
} from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';
import {
  DataModel,
  dataModels,
} from '@app/postgres-db/schemas/data-model.schema';
import { dashboardsToTenants } from '@app/postgres-db/schemas/dashboard-to-tenant.schema';

export type FlatDashboardData = {
  dashboard: Dashboard;
  panel: Panel;
  widget_to_panel: WidgetToPanel;
  widget: Widget;
  tab: Tab;
  data_model: DataModel;
  query: Query;
};

@Injectable()
export class DashboardRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getDashboardsWithContent(
    rolesFromRequest: string[],
  ): Promise<FlatDashboardData[]> {
    return this.db
      .select()
      .from(dashboards)
      .leftJoin(panels, eq(dashboards.id, panels.dashboardId))
      .leftJoin(widgetsToPanels, eq(panels.id, widgetsToPanels.panelId))
      .leftJoin(widgets, eq(widgetsToPanels.widgetId, widgets.id))
      .leftJoin(tabs, eq(widgets.id, tabs.widgetId))
      .leftJoin(dataModels, eq(tabs.dataModelId, dataModels.id))
      .leftJoin(queries, eq(tabs.queryId, queries.id))
      .where(
        or(
          eq(dashboards.visibility, 'public'),
          rolesFromRequest.length > 0
            ? arrayOverlaps(dashboards.readRoles, rolesFromRequest)
            : undefined,
          rolesFromRequest.length > 0
            ? arrayOverlaps(dashboards.writeRoles, rolesFromRequest)
            : undefined,
        ),
      );
  }

  async getDashboardWithContent(id: string): Promise<FlatDashboardData[]> {
    return this.db
      .select()
      .from(dashboards)
      .leftJoin(panels, eq(dashboards.id, panels.dashboardId))
      .leftJoin(widgetsToPanels, eq(panels.id, widgetsToPanels.panelId))
      .leftJoin(widgets, eq(widgetsToPanels.widgetId, widgets.id))
      .leftJoin(tabs, eq(widgets.id, tabs.widgetId))
      .leftJoin(dataModels, eq(tabs.dataModelId, dataModels.id))
      .leftJoin(queries, eq(tabs.queryId, queries.id))
      .where(eq(dashboards.id, id))
      .orderBy((data) => asc(data.panel.position));
  }

  async getAll(rolesFromRequest: string[]): Promise<Dashboard[]> {
    return this.db
      .select()
      .from(dashboards)
      .where(
        or(
          eq(dashboards.visibility, 'public'),
          rolesFromRequest.length > 0
            ? arrayOverlaps(dashboards.readRoles, rolesFromRequest)
            : undefined,
          rolesFromRequest.length > 0
            ? arrayOverlaps(dashboards.writeRoles, rolesFromRequest)
            : undefined,
        ),
      );
  }

  async getById(id: string): Promise<Dashboard> {
    const dbDashboards = await this.db
      .select()
      .from(dashboards)
      .where(eq(dashboards.id, id));

    return dbDashboards.length > 0 ? dbDashboards[0] : null;
  }

  async getByUrl(url: string): Promise<Dashboard> {
    const dbDashboards = await this.db
      .select()
      .from(dashboards)
      .where(and(eq(dashboards.url, url)));

    return dbDashboards.length > 0 ? dbDashboards[0] : null;
  }

  async getDashboardsWithContentByAbbreviation(
    tenantId: string,
    rolesFromRequest: string[],
  ): Promise<FlatDashboardData[]> {
    const tenantSubSelect = this.db
      .select({
        id: dashboardsToTenants.dashboardId,
      })
      .from(dashboardsToTenants)
      .where(eq(dashboardsToTenants.tenantId, tenantId));

    return this.db
      .select()
      .from(dashboards)
      .leftJoin(panels, eq(dashboards.id, panels.dashboardId))
      .leftJoin(widgetsToPanels, eq(panels.id, widgetsToPanels.panelId))
      .leftJoin(widgets, eq(widgetsToPanels.widgetId, widgets.id))
      .leftJoin(tabs, eq(widgets.id, tabs.widgetId))
      .leftJoin(dataModels, eq(tabs.dataModelId, dataModels.id))
      .leftJoin(queries, eq(tabs.queryId, queries.id))
      .where(
        and(
          or(
            eq(dashboards.visibility, 'public'),
            rolesFromRequest.length > 0
              ? arrayOverlaps(dashboards.readRoles, rolesFromRequest)
              : undefined,
            rolesFromRequest.length > 0
              ? arrayOverlaps(dashboards.writeRoles, rolesFromRequest)
              : undefined,
          ),
          inArray(dashboards.id, tenantSubSelect),
        ),
      );
  }

  async create(row: NewDashboard): Promise<Dashboard> {
    const newDashboardArr = await this.db
      .insert(dashboards)
      .values(row)
      .returning();

    return newDashboardArr.length > 0 ? newDashboardArr[0] : null;
  }

  async update(
    id: string,
    values: Partial<Dashboard>,
    transaction?: DbType,
  ): Promise<Dashboard> {
    const dbActor = transaction ? transaction : this.db;

    const updatedDashboardArr = await dbActor
      .update(dashboards)
      .set(values)
      .where(eq(dashboards.id, id))
      .returning();

    return updatedDashboardArr.length > 0 ? updatedDashboardArr[0] : null;
  }

  async delete(id: string, transaction?: DbType): Promise<Dashboard> {
    const dbActor = transaction ? transaction : this.db;

    const deletedDashboard = await dbActor
      .delete(dashboards)
      .where(eq(dashboards.id, id))
      .execute();

    return deletedDashboard[0];
  }
}
