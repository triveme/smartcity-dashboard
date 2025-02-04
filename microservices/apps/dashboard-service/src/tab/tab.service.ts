import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { DbType } from '@app/postgres-db';
import { NewTab, Tab } from '@app/postgres-db/schemas/dashboard.tab.schema';
import { TabRepo } from './tab.repo';

@Injectable()
export class TabService {
  constructor(private readonly tabRepo: TabRepo) {}

  private readonly logger = new Logger(TabService.name);

  async getAll(): Promise<Tab[]> {
    return this.tabRepo.getAll();
  }

  async getById(id: string): Promise<Tab> {
    return this.tabRepo.getById(id);
  }

  async getTabsByWidgetId(widgetId: string): Promise<Tab[]> {
    const widgetTabs = await this.tabRepo.getTabsByWidgetId(widgetId);

    if (widgetTabs.length === 0) {
      this.logger.warn(`No Tabs Found in Database with WidgetId: ${widgetId}`);
      return [];
    }

    return widgetTabs;
  }

  async getTabsByWidgetIds(widgetIds: string[]): Promise<Tab[]> {
    return this.tabRepo.getTabsByWidgetIds(widgetIds);
  }

  async getTabsByWidgetIdsAndComponentType(
    widgetIds: string[],
    componentType: string,
  ): Promise<Tab[]> {
    return this.tabRepo.getTabsByWidgetIdsAndComponentType(
      widgetIds,
      componentType,
    );
  }

  async create(row: NewTab, transaction?: DbType): Promise<Tab> {
    this.validateTabData(row);

    return this.tabRepo.create(row, transaction);
  }

  async update(
    id: string,
    values: Partial<Tab>,
    transaction?: DbType,
  ): Promise<Tab> {
    return this.tabRepo.update(id, values, transaction);
  }

  async delete(id: string): Promise<Tab> {
    return this.tabRepo.delete(id);
  }

  private validateTabData(values: NewTab): void {
    if (values.componentType === 'Karte') {
      if (
        !this.isValidDecimal(values.mapLatitude + '') ||
        !this.isValidDecimal(values.mapLongitude + '')
      ) {
        throw new HttpException(
          'Map Longitude and Latitude must be valid decimals',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private isValidDecimal(value: string): boolean {
    const decimalValue = Number(value);

    return !isNaN(decimalValue) && isFinite(decimalValue);
  }
}
