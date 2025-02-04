import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';

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
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { Tab, tabs } from '@app/postgres-db/schemas/dashboard.tab.schema';
import {
  DataModel,
  dataModels,
} from '@app/postgres-db/schemas/data-model.schema';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';

export type WidgetWithChildren = {
  widget: Widget;
  tab: Tab;
  queryConfig: QueryConfig;
};

export type FlatWidgetData = {
  widget: Widget;
  tab: Tab;
  data_model: DataModel;
  query: Query;
};

@Injectable()
export class WidgetRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<Widget[]> {
    return this.db.select().from(widgets);
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
