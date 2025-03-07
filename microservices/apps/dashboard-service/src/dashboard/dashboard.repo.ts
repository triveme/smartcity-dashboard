/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  arrayOverlaps,
  asc,
  eq,
  ilike,
  inArray,
  or,
  sql,
} from 'drizzle-orm';

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
import { PaginatedResult, PaginationMeta } from '../widget/widget.model';

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

  async getDashboardWithContent(
    id: string,
    tenantId: string,
    rolesFromRequest: string[],
  ): Promise<FlatDashboardData[]> {
    const tenantSubSelect = this.db
      .select({
        dashboardId: dashboardsToTenants.dashboardId,
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
          eq(dashboards.id, id),
          inArray(dashboards.id, tenantSubSelect),
          or(
            eq(dashboards.visibility, 'public'),
            rolesFromRequest.length > 0
              ? arrayOverlaps(dashboards.readRoles, rolesFromRequest)
              : undefined,
            rolesFromRequest.length > 0
              ? arrayOverlaps(dashboards.writeRoles, rolesFromRequest)
              : undefined,
          ),
        ),
      )
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

  async searchDashboards(
    rolesFromRequest: string[],
    searchTerm?: string,
    page: number = 1,
    pageSize: number = 10,
    tenantId?: string,
  ): Promise<PaginatedResult<Dashboard>> {
    const offset = (page - 1) * pageSize;

    const dashboardIdsOfTenant = this.db
      .select({
        dashboardId: dashboardsToTenants.dashboardId,
      })
      .from(dashboardsToTenants)
      .where(eq(dashboardsToTenants.tenantId, tenantId));

    const whereClause = and(
      searchTerm
        ? or(
            ilike(dashboards.name, `%${searchTerm}%`),
            ilike(dashboards.url, `%${searchTerm}%`),
          )
        : undefined,
      or(
        eq(dashboards.visibility, 'public'),
        rolesFromRequest.length > 0
          ? arrayOverlaps(dashboards.readRoles, rolesFromRequest)
          : undefined,
        rolesFromRequest.length > 0
          ? arrayOverlaps(dashboards.writeRoles, rolesFromRequest)
          : undefined,
      ),
      inArray(dashboards.id, dashboardIdsOfTenant),
    );

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(dashboards)
      .where(whereClause)
      .execute();

    const totalItems = Number(count);
    const totalPages = Math.ceil(totalItems / pageSize);

    const query = this.db
      .select()
      .from(dashboards)
      .where(whereClause)
      .limit(pageSize)
      .offset(offset)
      .orderBy(dashboards.name);
    const data = await query.execute();

    const meta: PaginationMeta = {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
    };

    return { data, meta };
  }

  async getById(id: string, rolesFromRequest: string[]): Promise<Dashboard> {
    const dbDashboards = await this.db
      .select()
      .from(dashboards)
      .where(
        and(
          eq(dashboards.id, id),
          or(
            eq(dashboards.visibility, 'public'),
            rolesFromRequest.length > 0
              ? arrayOverlaps(dashboards.readRoles, rolesFromRequest)
              : undefined,
            rolesFromRequest.length > 0
              ? arrayOverlaps(dashboards.writeRoles, rolesFromRequest)
              : undefined,
          ),
        ),
      );

    return dbDashboards.length > 0 ? dbDashboards[0] : null;
  }

  async getByIds(ids: string[]): Promise<Dashboard[]> {
    return this.db.select().from(dashboards).where(inArray(dashboards.id, ids));
  }

  async getByUrl(
    url: string,
    rolesFromRequest: string[],
  ): Promise<Dashboard[]> {
    const dbDashboards = await this.db
      .select()
      .from(dashboards)
      .where(
        and(
          eq(dashboards.url, url),
          or(
            eq(dashboards.visibility, 'public'),
            and(
              or(
                rolesFromRequest.length > 0
                  ? arrayOverlaps(dashboards.readRoles, rolesFromRequest)
                  : undefined,
                rolesFromRequest.length > 0
                  ? arrayOverlaps(dashboards.writeRoles, rolesFromRequest)
                  : undefined,
              ),
            ),
          ),
        ),
      );

    return dbDashboards;
  }

  async getByUrlAndTenant(
    url: string,
    tenantId: string,
    rolesFromRequest: string[],
  ): Promise<FlatDashboardData[]> {
    const tenantSubSelect = this.db
      .select({
        dashboardId: dashboardsToTenants.dashboardId,
      })
      .from(dashboardsToTenants)
      .where(eq(dashboardsToTenants.tenantId, tenantId));

    const dbDashboards = await this.db
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
          eq(dashboards.url, url),
          inArray(dashboards.id, tenantSubSelect),
          or(
            eq(dashboards.visibility, 'public'),
            and(
              or(
                rolesFromRequest.length > 0
                  ? arrayOverlaps(dashboards.readRoles, rolesFromRequest)
                  : undefined,
                rolesFromRequest.length > 0
                  ? arrayOverlaps(dashboards.writeRoles, rolesFromRequest)
                  : undefined,
              ),
            ),
          ),
        ),
      )
      .orderBy((data) => [
        asc(data.panel.position),
        asc(data.widget_to_panel.position),
      ]);

    return dbDashboards;
  }

  async getByUrls(
    urls: string[],
    rolesFromRequest: string[],
    tenantFromRequestId?: string,
  ): Promise<Dashboard[]> {
    if (urls.length === 0) return [];
    const dashboardIdsOfTenant = this.db
      .select({
        dashboardId: dashboardsToTenants.dashboardId,
      })
      .from(dashboardsToTenants)
      .where(eq(dashboardsToTenants.tenantId, tenantFromRequestId));

    return this.db
      .select()
      .from(dashboards)
      .where(
        and(
          inArray(dashboards.url, urls),
          or(
            eq(dashboards.visibility, 'public'),
            and(
              or(
                rolesFromRequest.length > 0
                  ? arrayOverlaps(dashboards.readRoles, rolesFromRequest)
                  : undefined,
                rolesFromRequest.length > 0
                  ? arrayOverlaps(dashboards.writeRoles, rolesFromRequest)
                  : undefined,
              ),
              inArray(dashboards.id, dashboardIdsOfTenant),
            ),
          ),
        ),
      );
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

  async existsByNameOrUrl(name: string, url: string): Promise<boolean> {
    const existingDashboard = await this.db
      .select()
      .from(dashboards)
      .where(or(eq(dashboards.name, name), eq(dashboards.url, url)))
      .limit(1);

    return existingDashboard.length > 0;
  }

  async generateUniqueNameAndUrl(
    baseName: string,
    baseUrl: string,
  ): Promise<{ uniqueName: string; uniqueUrl: string }> {
    let counter = 1;
    let uniqueName = `${baseName} (Copy)`;
    let uniqueUrl = `${baseUrl}_copy`;

    while (await this.existsByNameOrUrl(uniqueName, uniqueUrl)) {
      uniqueName = `${baseName} (Copy ${counter})`;
      uniqueUrl = `${baseUrl}_copy_${counter}`;
      counter++;
    }

    return { uniqueName, uniqueUrl };
  }
}
