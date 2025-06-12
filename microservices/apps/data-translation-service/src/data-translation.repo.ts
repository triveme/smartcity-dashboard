import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Tab, tabs, Widget, widgets } from '@app/postgres-db/schemas';
import { widgetData } from '@app/postgres-db/schemas/dashboard.widget.schema';
import { dataModels } from '@app/postgres-db/schemas/data-model.schema';
import {
  dataSources,
  DataSource,
} from '@app/postgres-db/schemas/data-source.schema';
import {
  queryConfigs,
  QueryConfig,
} from '@app/postgres-db/schemas/query-config.schema';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { Inject, Injectable } from '@nestjs/common';
import { FlatWidgetData } from 'apps/dashboard-service/src/widget/widget.model';
import { eq } from 'drizzle-orm';

@Injectable()
export class DataTranslationRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAllTabs(): Promise<Tab[]> {
    return this.db.select().from(tabs);
  }

  async setWidgetData(widgetId, data): Promise<void> {
    // Update if exists
    const updated = await this.db
      .update(widgetData)
      .set({ data })
      .where(eq(widgetData.widgetId, widgetId));

    // Insert if update did not affect any rows
    if (updated.rowCount === 0) {
      await this.db.insert(widgetData).values({ widgetId, data });
    }
  }

  async getQueryById(id: string): Promise<Query> {
    const result = await this.db
      .select()
      .from(queries)
      .where(eq(queries.id, id));

    return result.length > 0 ? result[0] : null;
  }

  async getQueryConfigById(id: string): Promise<QueryConfig> {
    const result = await this.db
      .select()
      .from(queryConfigs)
      .where(eq(queryConfigs.id, id));

    return result.length > 0 ? result[0] : null;
  }

  async getDatasourceById(id: string): Promise<DataSource> {
    const result = await this.db
      .select()
      .from(dataSources)
      .where(eq(dataSources.id, id));

    return result.length > 0 ? result[0] : null;
  }

  async getWidgetById(id: string): Promise<Widget> {
    const widgetArr = await this.db
      .select()
      .from(widgets)
      .where(eq(widgets.id, id));

    return widgetArr.length > 0 ? widgetArr[0] : null;
  }

  async getWidgetWithContentById(id: string): Promise<FlatWidgetData[]> {
    return this.db
      .select()
      .from(widgets)
      .leftJoin(tabs, eq(widgets.id, tabs.widgetId))
      .leftJoin(dataModels, eq(tabs.dataModelId, dataModels.id))
      .leftJoin(queries, eq(tabs.queryId, queries.id))
      .where(eq(widgets.id, id));
  }
}
