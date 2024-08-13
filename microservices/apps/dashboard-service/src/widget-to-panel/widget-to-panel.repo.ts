import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewWidgetToPanel,
  widgetsToPanels,
  WidgetToPanel,
} from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class WidgetToPanelRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<WidgetToPanel[]> {
    return this.db.select().from(widgetsToPanels);
  }

  async getById(widgetId: string, panelId: string): Promise<WidgetToPanel> {
    const result = await this.db
      .select()
      .from(widgetsToPanels)
      .where(
        and(
          eq(widgetsToPanels.widgetId, widgetId),
          eq(widgetsToPanels.panelId, panelId),
        ),
      );

    return result.length > 0 ? result[0] : null;
  }

  async getByPanelId(panelId: string): Promise<WidgetToPanel[]> {
    const result = await this.db
      .select()
      .from(widgetsToPanels)
      .where(eq(widgetsToPanels.panelId, panelId))
      .orderBy(widgetsToPanels.position);

    return result.length > 0 ? result : [];
  }

  async create(row: NewWidgetToPanel): Promise<WidgetToPanel> {
    const result = await this.db
      .insert(widgetsToPanels)
      .values(row)
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async update(
    widgetId: string,
    panelId: string,
    values: Partial<WidgetToPanel>,
    transaction?: DbType,
  ): Promise<WidgetToPanel> {
    const dbActor = transaction ? transaction : this.db;

    const result = await dbActor
      .update(widgetsToPanels)
      .set(values)
      .where(
        and(
          eq(widgetsToPanels.widgetId, widgetId),
          eq(widgetsToPanels.panelId, panelId),
        ),
      )
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(widgetId: string, panelId: string): Promise<WidgetToPanel> {
    const result = await this.db
      .delete(widgetsToPanels)
      .where(
        and(
          eq(widgetsToPanels.widgetId, widgetId),
          eq(widgetsToPanels.panelId, panelId),
        ),
      )
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async deleteByPanelId(panelId: string): Promise<WidgetToPanel[]> {
    return this.db
      .delete(widgetsToPanels)
      .where(eq(widgetsToPanels.panelId, panelId))
      .returning();
  }

  async deleteByWidgetId(widgetId: string): Promise<WidgetToPanel[]> {
    return this.db
      .delete(widgetsToPanels)
      .where(eq(widgetsToPanels.widgetId, widgetId))
      .returning();
  }
}
