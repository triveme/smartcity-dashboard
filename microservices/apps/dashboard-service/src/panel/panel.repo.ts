import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewPanel,
  Panel,
  panels,
} from '@app/postgres-db/schemas/dashboard.panel.schema';

@Injectable()
export class PanelRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<Panel[]> {
    return this.db.select().from(panels);
  }

  async getById(id: string): Promise<Panel> {
    const result = await this.db.select().from(panels).where(eq(panels.id, id));

    return result.length > 0 ? result[0] : null;
  }

  async getPanelsByDashboardId(dashboardId: string): Promise<Panel[]> {
    return this.db
      .select()
      .from(panels)
      .where(eq(panels.dashboardId, dashboardId));
  }

  async create(row: NewPanel): Promise<Panel> {
    const result = await this.db.insert(panels).values(row).returning();

    return result.length > 0 ? result[0] : null;
  }

  async update(id: string, values: Partial<Panel>): Promise<Panel> {
    const result = await this.db
      .update(panels)
      .set(values)
      .where(eq(panels.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string, transaction?: DbType): Promise<Panel> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const deletedPanels = await dbActor
      .delete(panels)
      .where(eq(panels.id, id))
      .returning();

    return deletedPanels.length > 0 ? deletedPanels[0] : null;
  }
}
