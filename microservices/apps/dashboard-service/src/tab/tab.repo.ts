import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray, and } from 'drizzle-orm';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewTab,
  Tab,
  tabs,
} from '@app/postgres-db/schemas/dashboard.tab.schema';

@Injectable()
export class TabRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<Tab[]> {
    return this.db.select().from(tabs);
  }

  async getById(id: string): Promise<Tab> {
    const result = await this.db.select().from(tabs).where(eq(tabs.id, id));

    return result.length > 0 ? result[0] : null;
  }

  async getTabsByWidgetId(widgetId: string): Promise<Tab[]> {
    return this.db.select().from(tabs).where(eq(tabs.widgetId, widgetId));
  }

  async getTabsByWidgetIds(widgetIds: string[]): Promise<Tab[]> {
    return this.db.select().from(tabs).where(inArray(tabs.widgetId, widgetIds));
  }

  async getTabsByWidgetIdsAndComponentType(
    widgetIds: string[],
    componentType: string,
  ): Promise<Tab[]> {
    return this.db
      .select()
      .from(tabs)
      .where(
        and(
          inArray(tabs.widgetId, widgetIds),
          eq(
            tabs.componentType,
            componentType as
              | 'Informationen'
              | 'Diagramm'
              | 'Slider'
              | 'Karte'
              | 'Kombinierte Komponente'
              | 'Wetterwarnungen'
              | 'Wert'
              | 'iFrame'
              | 'Bild',
          ),
        ),
      );
  }

  async create(row: NewTab, transaction?: DbType): Promise<Tab> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor.insert(tabs).values(row).returning();

    return result.length > 0 ? result[0] : null;
  }

  async update(
    id: string,
    values: Partial<Tab>,
    transaction?: DbType,
  ): Promise<Tab> {
    const dbActor = transaction === undefined ? this.db : transaction;
    const result = await dbActor
      .update(tabs)
      .set(values)
      .where(eq(tabs.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string, transaction?: DbType): Promise<Tab> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .delete(tabs)
      .where(eq(tabs.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }
}
