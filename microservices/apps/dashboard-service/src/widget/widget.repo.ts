import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray, and, sql, or, arrayOverlaps, ilike } from 'drizzle-orm';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewWidget,
  Widget,
  widgets,
} from '@app/postgres-db/schemas/dashboard.widget.schema';
import {
  widgetsToPanels,
  WidgetToPanel,
} from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';
import { tabs } from '@app/postgres-db/schemas/dashboard.tab.schema';
import { dataModels } from '@app/postgres-db/schemas/data-model.schema';
import { queries } from '@app/postgres-db/schemas/query.schema';
import {
  FlatWidgetData,
  PaginatedResult,
  PaginationMeta,
  TabComponentType,
  TabSubComponentType,
  WidgetWithComponentTypes,
} from './widget.model';
import { widgetsToTenants } from '@app/postgres-db/schemas/widget-to-tenant.schema';
import {
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
} from '@app/postgres-db/schemas/enums.schema';

@Injectable()
export class WidgetRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<Widget[]> {
    return this.db.select().from(widgets);
  }

  async getWidgetDataById(widgetId: string): Promise<Widget[]> {
    return this.db
      .select()
      .from(widgets)
      .where(eq(widgets.id, widgetId))
      .catch(() => null);
  }

  async getById(id: string): Promise<Widget> {
    const widgetArr = await this.db
      .select()
      .from(widgets)
      .where(eq(widgets.id, id));

    return widgetArr.length > 0 ? widgetArr[0] : null;
  }

  async getByIds(ids: string[]): Promise<Widget[]> {
    return this.db.select().from(widgets).where(inArray(widgets.id, ids));
  }

  async getWidgetWithContent(id: string): Promise<FlatWidgetData[]> {
    return this.db
      .select()
      .from(widgets)
      .leftJoin(tabs, eq(widgets.id, tabs.widgetId))
      .leftJoin(dataModels, eq(tabs.dataModelId, dataModels.id))
      .leftJoin(queries, eq(tabs.queryId, queries.id))
      .where(eq(widgets.id, id));
  }

  async getWidgetsByPanelId(
    panelId: string,
  ): Promise<{ widget: Widget; widget_to_panel: WidgetToPanel }[]> {
    return this.db
      .select()
      .from(widgets)
      .leftJoin(widgetsToPanels, eq(widgets.id, widgetsToPanels.widgetId))
      .where(eq(widgetsToPanels.panelId, panelId));
  }

  async searchWidgets(
    rolesFromRequest: string[],
    searchTerm?: string,
    componentType?: string,
    componentSubType?: string,
    page: number = 1,
    pageSize: number = 10,
    tenantId?: string,
  ): Promise<PaginatedResult<WidgetWithComponentTypes>> {
    const offset = (page - 1) * pageSize;

    const tenantSubQuery = tenantId
      ? this.db
          .select({ widgetId: widgetsToTenants.widgetId })
          .from(widgetsToTenants)
          .where(eq(widgetsToTenants.tenantId, tenantId))
      : undefined;

    const whereClause = and(
      // Search condition
      searchTerm
        ? or(
            ilike(widgets.name, `%${searchTerm}%`),
            ilike(widgets.description, `%${searchTerm}%`),
          )
        : undefined,
      or(
        eq(widgets.visibility, 'public'),
        rolesFromRequest.length > 0
          ? arrayOverlaps(widgets.readRoles, rolesFromRequest)
          : undefined,
        rolesFromRequest.length > 0
          ? arrayOverlaps(widgets.writeRoles, rolesFromRequest)
          : undefined,
      ),
      and(
        componentType &&
          Object.values(tabComponentTypeEnum)[1].includes(componentType)
          ? eq(tabs.componentType, componentType as TabComponentType)
          : undefined,
        componentSubType &&
          Object.values(tabComponentSubTypeEnum)[1].includes(componentSubType)
          ? eq(tabs.componentSubType, componentSubType as TabSubComponentType)
          : undefined,
      ),

      // Tenant filter condition
      tenantId ? inArray(widgets.id, tenantSubQuery) : undefined,
    );

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(widgets)
      .leftJoin(tabs, eq(widgets.id, tabs.widgetId))
      .where(whereClause)
      .execute();

    const totalItems = Number(count);
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get paginated results
    const query = this.db
      .select({
        id: widgets.id,
        name: widgets.name,
        description: widgets.description,
        visibility: widgets.visibility,
        componentType: tabs.componentType,
        componentSubType: tabs.componentSubType,
      })
      .from(widgets)
      .leftJoin(tabs, eq(widgets.id, tabs.widgetId))
      .where(whereClause)
      .limit(pageSize)
      .offset(offset)
      .orderBy(widgets.name);
    const data = await query.execute();

    const meta: PaginationMeta = {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
    };

    return { data, meta };
  }

  async create(row: NewWidget, transaction?: DbType): Promise<Widget> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const newWidgetArr = await dbActor.insert(widgets).values(row).returning();

    return newWidgetArr.length > 0 ? newWidgetArr[0] : null;
  }

  async update(
    id: string,
    values: Partial<Widget>,
    transaction?: DbType,
  ): Promise<Widget> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const updatedWidgetArr = await dbActor
      .update(widgets)
      .set(values)
      .where(eq(widgets.id, id))
      .returning();

    return updatedWidgetArr.length > 0 ? updatedWidgetArr[0] : null;
  }

  async delete(id: string, transaction?: DbType): Promise<Widget> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .delete(widgets)
      .where(eq(widgets.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async existsByName(name: string): Promise<boolean> {
    const existingDashboard = await this.db
      .select()
      .from(widgets)
      .where(eq(widgets.name, name))
      .limit(1);

    return existingDashboard.length > 0;
  }

  async generateUniqueName(baseName: string): Promise<string> {
    let counter = 1;
    let uniqueName = `${baseName} (Copy)`;

    while (await this.existsByName(uniqueName)) {
      uniqueName = `${baseName} (Copy ${counter})`;
      counter++;
    }

    return uniqueName;
  }
}
