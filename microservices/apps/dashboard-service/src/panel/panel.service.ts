import { Inject, Injectable, Logger } from '@nestjs/common';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewPanel,
  Panel,
} from '@app/postgres-db/schemas/dashboard.panel.schema';
import { PanelRepo } from './panel.repo';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';

@Injectable()
export class PanelService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly panelRepo: PanelRepo,
    private readonly widgetsToPanelsRepo: WidgetToPanelRepo,
  ) {}

  private readonly logger = new Logger(PanelService.name);

  async getAll(): Promise<Panel[]> {
    return this.panelRepo.getAll();
  }

  async getById(id: string): Promise<Panel> {
    return this.panelRepo.getById(id);
  }

  async getPanelsByDashboardId(dashboardId: string): Promise<Panel[]> {
    const dashboardPanels =
      await this.panelRepo.getPanelsByDashboardId(dashboardId);

    if (dashboardPanels.length === 0) {
      this.logger.warn(
        'No Panels Found in Database with DashboardId: ',
        dashboardId,
      );
      return [];
    }

    return dashboardPanels;
  }

  async create(row: NewPanel): Promise<Panel> {
    return this.panelRepo.create(row);
  }

  async update(id: string, values: Partial<Panel>): Promise<Panel> {
    try {
      return this.panelRepo.update(id, values);
    } catch (error) {
      console.error('Error patching panel');
      console.error(error);
      console.error(values);
    }
  }

  async delete(id: string): Promise<Panel> {
    return this.db.transaction(async (tx) => {
      await this.widgetsToPanelsRepo.deleteByPanelId(id);

      return this.panelRepo.delete(id, tx);
    });
  }
}
