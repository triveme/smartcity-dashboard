import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewWidgetToPanel,
  WidgetToPanel,
} from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';
import { WidgetToPanelRepo } from './widget-to-panel.repo';

@Injectable()
export class WidgetToPanelService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly widgetToPanelRepo: WidgetToPanelRepo,
  ) {}

  async getAll(): Promise<WidgetToPanel[]> {
    return this.widgetToPanelRepo.getAll();
  }

  async getById(widgetId: string, panelId: string): Promise<WidgetToPanel> {
    return this.widgetToPanelRepo.getById(widgetId, panelId);
  }

  async getByPanelId(panelId: string): Promise<WidgetToPanel[]> {
    return this.widgetToPanelRepo.getByPanelId(panelId);
  }

  async create(row: NewWidgetToPanel): Promise<WidgetToPanel> {
    return this.widgetToPanelRepo.create(row);
  }

  async update(
    widgetId: string,
    panelId: string,
    values: Partial<WidgetToPanel>,
  ): Promise<WidgetToPanel> {
    const result = await this.widgetToPanelRepo.update(
      widgetId,
      panelId,
      values,
    );

    if (!result)
      throw new HttpException(
        'WidgetsToPanels not found',
        HttpStatus.NOT_FOUND,
      );

    return result;
  }

  async bulkUpdate(updates: WidgetToPanel[]): Promise<WidgetToPanel[]> {
    return this.db.transaction(async (tx) => {
      const updatedRecords: WidgetToPanel[] = [];

      for (const update of updates) {
        const result = await this.widgetToPanelRepo.update(
          update.widgetId,
          update.panelId,
          update,
          tx,
        );

        if (!result)
          throw new HttpException(
            'WidgetsToPanels not found',
            HttpStatus.NOT_FOUND,
          );

        updatedRecords.push(result);
      }

      return updatedRecords;
    });
  }

  async delete(widgetId: string, panelId: string): Promise<WidgetToPanel> {
    const result = await this.widgetToPanelRepo.delete(widgetId, panelId);

    if (!result)
      throw new HttpException(
        'WidgetsToPanels not found',
        HttpStatus.NOT_FOUND,
      );

    return result;
  }
}
